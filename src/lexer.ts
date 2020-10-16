import { LintedToken, Token } from "./types";

const NUMBER = /[0-9]/;
const VARIABLE = /[a-z,0-9,_]/i;
const WHITESPACE = /\s/;

export const getTokens = (value: string, operators: string[]) => {
  const tokens: Token[] = [];
  let current = 0;
  while (current < value.length) {
    let char = value[current];
    if (char === "(") {
      tokens.push({ type: "leftParen", value: char });
      current++;
      continue;
    }
    if (char === ")") {
      tokens.push({ type: "rightParen", value: char });
      current++;
      continue;
    }
    if (operators.includes(char)) {
      let seq = "";
      while (operators.includes(char)) {
        seq += char;
        char = value[++current];
        continue;
      }
      tokens.push({ type: "operator", value: seq });
      continue;
    }
    if (NUMBER.test(char)) {
      let seq = "";
      while (NUMBER.test(char)) {
        seq += char;
        char = value[++current];
      }
      tokens.push({ type: "number", value: seq });
      continue;
    }
    if (VARIABLE.test(char)) {
      let seq = "";
      while (char && VARIABLE.test(char)) {
        seq += char;
        char = value[++current];
      }
      tokens.push({ type: "variable", value: seq });
      continue;
    }
    if (WHITESPACE.test(char)) {
      tokens.push({ type: "whitespace", value: char });
      current++;
      continue;
    }

    tokens.push({ type: "unknown", value: char });
    current++;
  }

  return tokens;
};

export const getLintedTokens = (
  tokens: Token[],
  operators: string[],
  variables: string[]
): LintedToken[] =>
  tokens.map((token) => {
    if (token.type === "variable") {
      const matchingTokens = variables.filter(
        (v) =>
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
    if (token.type === "operator") {
      return {
        ...token,
        valid: operators.includes(token.value),
      };
    }
    if (token.type === "unknown") {
      return { ...token, valid: false };
    }
    return { ...token, valid: true };
  });
