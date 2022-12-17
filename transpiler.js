import { Assignment, Expression, ExpressionType, FileReader, FunctionCall, FunctionDefinition, Statement, StatementType, SyntaxError, Token, Value, ValueType } from './types.js';
import { tokenize } from './tokenizer.js';
import TokenConfig from './config/default.js';


/**
 * TODO: -> functions
 * @param {Token[]} tokens
 * @param {number} index
 * @returns {[Expression, number]}
 */
function readExpression(tokens, index) {

  let i = index, e = new Expression(ExpressionType.FunctionCall, new FunctionCall());
  let buf = [], newline = false;

  if (tokens[i].is('NUMBER')) {
    if (tokens[i + 1] === undefined || tokens[i + 1].is('NEWLINE')) {
      e.type = ExpressionType.Value;
      e.body = new Value(ValueType.Number, tokens[i].value);
    } else {
      throw new SyntaxError('Expressions that begin with a number cannot be followed by anything else.');
    }
  }

  else for (; i < tokens.length; i++) {

    console.log(tokens[i]);

    if (tokens[i].is('IDENTITY')) {
      buf.push(new Expression(ExpressionType.Value, new Value(ValueType.Identity, tokens[i].value)));
    }

    else if (tokens[i].is('NUMBER')) {
      buf.push(new Expression(ExpressionType.Value, new Value(ValueType.Number, tokens[i].value)));
    }

    else if (tokens[i].is('OPERATOR')) {
      e.body.name = tokens[i].value;
    }

    else if (tokens[i].is('NEWLINE')) {
      if (newline) break;
      newline = true;
    }

    else if (tokens[i].is('ARROW')) {
      const params = tokens.slice(index, i).map(t => t.value);
      const [expr, newIndex] = readExpression(tokens, i + 1);
      e.type = ExpressionType.Value;
      e.body = new Value(ValueType.Function, new FunctionDefinition(params, expr));
      i = newIndex;
      break;
    }

    else if (tokens[i].is('PAREN_OPEN')) {
      const [expr, newIndex] = readExpression(tokens, i + 1);
      buf.push(expr);
      i = newIndex;
      break;
    }

    else if (tokens[i].is('PAREN_CLOSE')) {
      break;
    }

    else if (tokens[i].is('PIPE')) {
      const [expr, newIndex] = readExpression(tokens, i + 1);
      e.pipe.push(expr);
      i = newIndex;
    }

  }

  if (e.type === ExpressionType.FunctionCall) {
    if (e.body.name === null) {
      e.body.name = buf[0].value;
      e.body.args = buf.slice(1);
    } else {
      e.body.args = buf;
    }
  }

  return [e, i];
}


/**
 * Transpiles an array of tokens.
 * @param {Token[]} tokens
 */
function transpile(tokens) {

  let statements = [];

  for (let i = 0; i < tokens.length; i++) {

    if (tokens[i].is('COMMENT')) {
      continue;
    }

    if (tokens[i].is('IDENTITY') && tokens[i + 1]?.is('EQUALS')) {
      const [expr, newIndex] = readExpression(tokens, i + 1);
      const stmt = new Statement(StatementType.Assignment, new Assignment(tokens[i].value, expr));
      statements.push(stmt);
      i = newIndex;
    }

    else if (tokens[i].is('IDENTITY', 'NUMBER', 'OPERATOR')) {
      const [expr, newIndex] = readExpression(tokens, i);
      const stmt = new Statement(StatementType.Expression, expr);
      statements.push(stmt);
      i = newIndex;
    }

  }

  for (const s of statements) {
    console.log(JSON.stringify(s, null, 2));
  }

}


const reader = new FileReader('source.txt');
const tokens = tokenize(reader, TokenConfig);
transpile(tokens);
