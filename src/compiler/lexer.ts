import { Token } from "./types";

export const NUMBER = /[0-9.]/;
export const IDENTIFIER = /[a-z0-9_]/i;
export const WHITESPACE = /\s/;
export const QUOTE_MARK = /['"]/;
export const OPERATORS = ["+", "-", "/", "*"];

export const getTokens = (code: string) => {
  const tokens: Token[] = [];
  let index = 0;

  while (index < code.length) {
    const start = index;
    let char = code[index];

    if (char === "(") {
      tokens.push({
        type: "leftParen",
        value: char,
        start,
        end: index + 1,
      });
      index++;
      continue;
    }
    if (char === ")") {
      tokens.push({
        type: "rightParen",
        value: char,
        start,
        end: index + 1,
      });
      index++;
      continue;
    }
    if (char === "[") {
      tokens.push({
        type: "leftSquare",
        value: char,
        start,
        end: index + 1,
      });
      index++;
      continue;
    }
    if (char === "]") {
      tokens.push({
        type: "rightSquare",
        value: char,
        start,
        end: index + 1,
      });
      index++;
      continue;
    }
    if (char === ",") {
      tokens.push({
        type: "comma",
        value: char,
        start,
        end: index + 1,
      });
      index++;
      continue;
    }
    if (OPERATORS.includes(char)) {
      let seq = "";
      while (OPERATORS.includes(char)) {
        seq += char;
        char = code[++index];
        continue;
      }
      tokens.push({
        type: "operator",
        value: seq,
        start,
        end: index,
      });
      continue;
    }
    if (NUMBER.test(char)) {
      let seq = "";
      while (NUMBER.test(char)) {
        seq += char;
        char = code[++index];
      }
      tokens.push({
        type: "number",
        value: seq,
        start,
        end: index,
      });
      continue;
    }
    if (QUOTE_MARK.test(char)) {
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
        tokens.push({
          type: "string",
          raw: seq,
          value: seq.slice(1, -1),
          start,
          end: index,
        });
      } else {
        tokens.push({
          type: "unknown",
          value: seq,
          start,
          end: index,
        });
      }
      continue;
    }
    if (IDENTIFIER.test(char)) {
      let seq = "";
      while (char && IDENTIFIER.test(char)) {
        seq += char;
        char = code[++index];
      }
      tokens.push({
        type: ["true", "false"].includes(seq) ? "boolean" : "identifier",
        value: seq,
        start,
        end: index,
      });
      continue;
    }
    if (WHITESPACE.test(char)) {
      tokens.push({
        type: "whitespace",
        raw: "\u00A0",
        value: char,
        start,
        end: index + 1,
      });
      index++;
      continue;
    }

    tokens.push({
      type: "unknown",
      value: char,
      start,
      end: index + 1,
    });
    index++;
  }

  return tokens;
};
