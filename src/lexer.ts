import { LintedToken, Token } from './types';

const NUMBER = /[0-9.]/;
const VARIABLE = /[a-z0-9_]/i;
const WHITESPACE = /\s/;

export const getTokens = (code: string, operators: string[]) => {
  const tokens: Token[] = [];
  let index = 0;
  while (index < code.length) {
    let char = code[index];
    if (char === '(') {
      tokens.push({ type: 'leftParen', value: char });
      index++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'rightParen', value: char });
      index++;
      continue;
    }
    if (operators.includes(char)) {
      let seq = '';
      while (operators.includes(char)) {
        seq += char;
        char = code[++index];
        continue;
      }
      tokens.push({ type: 'operator', value: seq });
      continue;
    }
    if (NUMBER.test(char)) {
      let seq = '';
      while (NUMBER.test(char)) {
        seq += char;
        char = code[++index];
      }
      tokens.push({ type: 'number', value: seq });
      continue;
    }
    if (char === '"' || char === "'") {
      const quoteMark = char;
      let seq = quoteMark;
      char = code[++index];
      while (char && char !== quoteMark) {
        seq += char;
        char = code[++index];
      }
      if (char && char === quoteMark) {
        seq += char;
        index += 1;
        tokens.push({ type: 'string', value: seq });
      } else {
        tokens.push({ type: 'unknown', value: seq });
      }
      continue;
    }
    if (VARIABLE.test(char)) {
      let seq = '';
      while (char && VARIABLE.test(char)) {
        seq += char;
        char = code[++index];
      }
      tokens.push({ type: 'variable', value: seq });
      continue;
    }
    if (WHITESPACE.test(char)) {
      tokens.push({ type: 'whitespace', value: char });
      index++;
      continue;
    }

    tokens.push({ type: 'unknown', value: char });
    index++;
  }

  return tokens;
};

export const getLintedTokens = (
  tokens: Token[],
  operators: string[],
  variables: string[]
): LintedToken[] =>
  tokens.map(token => {
    if (token.type === 'variable') {
      const matchingTokens = variables.filter(
        v =>
          v.length >= token.value.length &&
          v.startsWith(token.value) &&
          v !== token.value
      );
      return {
        ...token,
        hints: matchingTokens,
        valid: variables.includes(token.value),
      };
    }
    if (token.type === 'operator') {
      return {
        ...token,
        valid: operators.includes(token.value),
      };
    }
    if (token.type === 'number') {
      return {
        ...token,
        valid: token.value.split('').filter(char => char === '.').length < 2,
      };
    }
    if (token.type === 'unknown') {
      return { ...token, valid: false };
    }
    return { ...token, valid: true };
  });
