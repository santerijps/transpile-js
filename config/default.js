export default {

  IDENTITY: {
    match: {
      head: /[a-zA-Z\_\$]/,
      tail: /[a-zA-Z\_\$\d\.]/
    }
  },

  NUMBER: {
    match: {
      head: /\d/,
      tail: /[\d\_\.]/,
      limit: {
        '.': 1,
      },
    },
  },

  COMMENT: {
    boundary: {
      start: '/*',
      end: '*/'
    }
  },

  ARROW: {
    equals: '->'
  },

  DARROW: {
    equals: '=>'
  },

  OPERATOR: {
    in: ['+', '-', '*', '/']
  },

  EQUALS: {
    equals: '='
  },

  PIPE: {
    equals: '|'
  },

  NEWLINE: {
    equals: '\r\n'
  },

  SINGLE_QUOTE: {
    equals: "'"
  },

  PAREN_OPEN: {
    equals: '('
  },

  PAREN_CLOSE: {
    equals: ')'
  },

};
