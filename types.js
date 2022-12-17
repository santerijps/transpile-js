import * as fs from 'fs';


/**
 * Reads a file one character at a time.
 */
export class FileReader {

  #fd = null;
  #buffer = Buffer.alloc(1, 0, 'utf-8');
  #position = 0;
  #eof = false;

  /**
   * Initializes a new FileReader
   * @param {string} filePath
   */
  constructor(filePath) {
    this.#fd = fs.openSync(filePath, 'r');
  }

  at(position) {
    const n = fs.readSync(this.#fd, this.#buffer, 0, 1, position);
    return n ? this.#buffer.toString('utf-8') : null;
  }

  goto(position) {
    this.#position = position;
  }

  move(positions) {
    this.#position += positions;
  }

  get() {
    const n = fs.readSync(this.#fd, this.#buffer, 0, 1, this.#position);
    if (n === 0) {
      this.#eof = true;
      return null;
    }
    this.#position += 1;
    return this.#buffer.toString('utf-8');
  }

  peek() {
    const n = fs.readSync(this.#fd, this.#buffer, 0, 1, this.#position);
    if (n === 0) {
      this.#eof = true;
      return null;
    }
    return this.#buffer.toString('utf-8');
  }

  eof() {
    return this.peek() === null;
  }

  get position() {
    return this.#position;
  }

  close() {
    fs.closeSync(this.#fd);
  }

  [Symbol.iterator]() {
    const buffer = Buffer.alloc(1, undefined, 'utf-8');
    return {
      next: () => {
        const n = fs.readSync(this.#fd, buffer, 0, 1, this.#position);
        if (n) {
          this.#position += 1;
          return {value: buffer.toLocaleString(), done: false};
        }
        return {value: null, done: true};
      },
    };
  }

}


export class Token {

  /**
   * @param {string} type
   * @param {string} value
   */
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  /**
   * Check if the token has the specified type.
   * @param {...string} type
   */
  is(...type) {
    return type.filter(t => t === this.type).length > 0;
  }

}


export class Assignment {

  /**
   * @param {string} name
   * @param {Expression} expr
   */
  constructor(name, expr) {
    this.name = name ?? null;
    this.expr = expr ?? null;
  }

}


export class FunctionCall {

  /**
   * @param {string} name
   * @param {Expression[]} args
   */
  constructor(name, args) {
    this.name = name ?? null;
    this.args = args ?? null;
  }

}


export class FunctionDefinition {

  /**
   * @param {string[]} params
   * @param {Expression} body
   */
  constructor(params, body) {
    this.params = params ?? [];
    this.body = body || null;
  }

}


export class ValueType {
  static Function = 'FUNCTION_DEFINITION';
  static Identity = 'IDENTITY';
  static Number = 'NUMBER';
  static String = 'STRING';
}


export class Value {

  /**
   * @param {string} type
   * @param {string | Expression | FunctionDefinition} value
   */
  constructor(type, value) {
    this.type = type ?? null;
    this.value = value ?? null;
  }

}


export class ExpressionType {
  static FunctionCall = 'FUNCTION_CALL';
  static Value = 'VALUE';
}


export class Expression {

  /**
   * @param {string} type
   * @param {FunctionCall | Value} body
   * @param {Expression[]} pipe
   */
  constructor(type, body, pipe) {
    this.type = type ?? null;
    this.body = body ?? null;
    this.pipe = pipe ?? [];
  }

}


export class StatementType {
  static Assignment = 'ASSIGNMENT';
  static Expression = 'EXPRESSION';
}


export class Statement {

  /**
   * @param {string} type
   * @param {Assignment | Expression} value
   */
  constructor(type, value) {
    this.type = type ?? null;
    this.value = value ?? null;
  }

}


export class SyntaxError extends Error {

  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
  }

}