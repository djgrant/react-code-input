import { ArrayExpression, AST, Token } from "./types";

const ADDSUB = /^\+$|^\-$/;
const MULDIV = /^\*$|^\/$/;

export const buildAST = (allTokens: Token[]): AST => {
  const tokens = allTokens.filter(token => token.type !== "whitespace");
  let i = -1;
  let token: Token;
  let next: Token;
  incrementToken();

  return parseExpression();

  function incrementToken() {
    i++;
    const last = tokens.length - 1;
    if (i <= last) token = tokens[i];
    if (i < last) next = tokens[i + 1];
  }

  function parseTerminal(): AST {
    if (token.type === "number") {
      const node: AST = {
        type: "Literal",
        value: Number(token.value),
        start: token.start,
        end: token.end,
      };
      incrementToken();
      return node;
    }

    if (token.type === "string") {
      const node: AST = {
        type: "Literal",
        value: token.value,
        start: token.start,
        end: token.end,
      };
      incrementToken();
      return node;
    }

    if (token.type === "boolean") {
      const node: AST = {
        type: "Literal",
        value: token.value === "true" ? true : false,
        start: token.start,
        end: token.end,
      };
      incrementToken();
      return node;
    }

    if (token.type === "identifier") {
      const node: AST = {
        type: "Identifier",
        name: token.value,
        start: token.start,
        end: token.end,
      };
      incrementToken();
      return node;
    }

    throw new TokenError(token, allTokens);
  }

  function parseExpression(): AST {
    if (token.type === "leftParen") {
      incrementToken();
      return parseExpression();
    }

    if (token.type === "leftSquare") {
      const node: ArrayExpression = {
        type: "ArrayExpression",
        elements: [],
        start: token.start,
        end: -1,
      };

      incrementToken();
      while (token.type !== "rightSquare") {
        if (token.type === "comma") {
          incrementToken();
          continue;
        }
        node.elements.push(parseExpression());
        token = tokens[i];
      }
      incrementToken();
      node.end = i;
      return node;
    }

    let node = parseTerminal();

    // @ts-ignore
    if (node.type === "Identifier" && token.type === "leftParen") {
      node = {
        type: "CallExpression",
        callee: node,
        arguments: [],
        start: node.start,
        end: -1,
      };
      incrementToken();
      while (token.type !== "rightParen") {
        if (token.type === "comma") {
          incrementToken();
          continue;
        }
        node.arguments.push(parseExpression());
      }
      node.end = token.end;
      return node;
    }

    while (token?.type === "operator") {
      const start = node.start;
      const operator = token.value;
      const left = node;
      incrementToken();
      const nextOperator = next.type === "operator" ? next.value : null;
      const rightTerminalRules = [
        ADDSUB.test(operator) && nextOperator && ADDSUB.test(nextOperator), // E = T +- T +- E
        MULDIV.test(operator) && nextOperator, // E = T */ T */+- E
      ];
      const right = rightTerminalRules.some(Boolean)
        ? parseTerminal()
        : parseExpression();
      const end = right.end;
      node = {
        type: "BinaryExpression",
        operator,
        left,
        right,
        start,
        end,
      };
    }

    if (token.type === "rightParen") {
      incrementToken();
    }

    return node;
  }
};

class TokenError extends Error {
  constructor(token: Token, allTokens: Token[]) {
    super();
    const originalCode = allTokens.map(t => t.raw || t.value).join("");
    const leftPadding = Array.from(new Array(token.end)).join(" ");
    this.message = `Invalid token ${token.value}\n\n${originalCode}\n${leftPadding}^`;
  }
}
