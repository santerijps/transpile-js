import { FileReader } from './types.js';
import { Token } from './types.js';
import { assert } from './util.js';


/*

TOKEN_TYPE: {

  match?: RegExp | {
    head?: RegExp,
    tail?: RegExp,
    limit?: {
      CHAR: MAX_CHAR_COUNT_IN_TOKEN,
      ...
    }
  },

  equals?: STRING,
  in?: STRING[]

  boundary?: {
    start: STRING,
    end: STRING,
    except?: {
      procededBy: STRING
    }
  },

}

*/

/**
 * Tokenizes the FileReader input.
 * @param {FileReader} reader A FileReader instance
 * @param {object} config Token configuration, i.e. how to determine tokens
 */
export function tokenize(reader, config) {

  /**
   * @type {Token[]}
   */
  const result = [];

  while (!reader.eof()) {

    const token = new Token();

    TokenMatcher: for (const type in config) {
      const o = config[type];

      if (o.equals !== undefined && equals(reader, o.equals)) {
        token.type = type;
        token.value = o.equals;
        break TokenMatcher;
      }

      else if (o.in !== undefined) {
        for (const x of o.in) {
          if (equals(reader, x)) {
            token.type = type;
            token.value = x;
            break TokenMatcher;
          }
        }
      }

      else if (o.match !== undefined) {
        const value = o.match instanceof RegExp ? matchSimple(reader, o.match) : matchComplex(reader, o.match);
        if (value) {
          token.type = type;
          token.value = value;
          break TokenMatcher;
        }
      }

      else if (o.boundary !== undefined) {
        assert(o.boundary.start, 'boundary.start exists');
        assert(o.boundary.end, 'boundary.end exists');
        if (equals(reader, o.boundary.start)) {
          let value = '';
          let c, i = reader.position + o.boundary.start.length, j;
          while ((c = reader.at(i)) !== null) {
            let match = true;
            for (j = 0; j < o.boundary.end.length; j++) {
              match = match && reader.at(i + j) === o.boundary.end[j];
            }
            if (match) {
              for (let k = 0; k < i + j; k++) {
                value += reader.at(reader.position + k);
              }
              token.type = type;
              token.value = value;
              break TokenMatcher;
            }
            i += 1;
          }
        }
      }

    }

    if (token.type && token.value) {
      result.push(token);
      reader.move(token.value.length);
    }

    else {
      reader.move(1);
    }

  }

  return result;
}


/**
 * @param {FileReader} reader
 * @param {string} x
 * @returns {boolean}
 */
function equals(reader, x) {
  for (let i = 0; i < x.length; i++) {
    if (reader.at(reader.position + i) !== x[i]) {
      return false;
    }
  }
  return true;
}


/**
 * @param {FileReader} reader
 * @param {RegExp} regex
 * @returns {string}
 */
function matchSimple(reader, regex) {
  let value = '';
  let c, i = 0;
  while ((c = reader.at(reader.position + i)) !== null) {
    if (c.match(regex)) {
      value += c;
      i += 1;
    } else {
      break;
    }
  }
  return value;
}


/**
 * @param {FileReader} reader
 * @param {object} o
 * @returns {string | null}
 */
function matchComplex(reader, o) {

  let value = '';

  if (o.head) {
    const c = reader.at(reader.position);
    if (!c.match(o.head)) return null;
    value += reader.at(reader.position);
  }

  if (o.tail) {
    let c, i = 1;
    const limit = { ...o.limit };
    while ((c = reader.at(reader.position + i)) !== null) {
      if (c.match(o.tail)) {
        if (limit[c] !== undefined && !(limit[c]--)) {
          return value;
        }
        value += c;
        i += 1;
      } else {
        break;
      }
    }
  }

  return value;
}
