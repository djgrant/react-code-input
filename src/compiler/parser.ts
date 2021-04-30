import { AST, Token } from "./types";

const ADDSUB = /^\+$|^\-$/;
const MULDIV = /^\*$|^\/$/;

type Cursor = Token & { next: Token | null };

export const buildAST = (allTokens: Token[]): AST | null => {
  const tokens = allTokens.filter(token => token.type !== "whitespace");
  let i = -1;
  let token = getNextToken();

  if (tokens.length === 0) return null;

  const ast = parseExpression();

  if (token) {
    throw new UnexpectedTokenError(allTokens, token);
  }

  return ast;

  function getNextToken(): Cursor | null {
    i++;
    const last = tokens.length - 1;
    const next = i < last ? tokens[i + 1] : null;
    return i <= last ? { ...tokens[i], next } : null;
  }

  function parseTerminal(): AST {
    if (!token) {
      throw new EndOfLineError(allTokens);
    }

    if (token.type === "number") {
      const node: AST = {
        type: "Literal",
        value: Number(token.value),
        start: token.start,
        end: token.end,
      };
      token = getNextToken();
      return node;
    }

    if (token.type === "string") {
      const node: AST = {
        type: "Literal",
        value: token.value,
        start: token.start,
        end: token.end,
      };
      token = getNextToken();
      return node;
    }

    if (token.type === "boolean") {
      const node: AST = {
        type: "Literal",
        value: token.value === "true" ? true : false,
        start: token.start,
        end: token.end,
      };
      token = getNextToken();
      return node;
    }

    if (token.type === "identifier") {
      const node: AST = {
        type: "Identifier",
        name: token.value,
        start: token.start,
        end: token.end,
      };
      token = getNextToken();
      return node;
    }

    throw new UnknownTokenError(allTokens, token);
  }

  function parseExpression(): AST {
    let node: AST | void;

    // Sub Expression
    if (token?.type === "leftParen") {
      token = getNextToken();
      node = parseExpression();
      if (!token) {
        throw new EndOfLineError(allTokens, ")");
      } else if (token?.type !== "rightParen") {
        throw new UnexpectedTokenError(allTokens, token);
      } else {
        token = getNextToken();
      }
    }

    // Array Expression
    if (token?.type === "leftSquare") {
      node = {
        type: "ArrayExpression",
        elements: [],
        start: token.start,
        end: -1,
      };

      token = getNextToken();
      while (token && token?.type !== "rightSquare") {
        if (token.type === "comma") {
          token = getNextToken();
        } else {
          node.elements.push(parseExpression());
        }
      }
      if (!token) throw new EndOfLineError(allTokens, "]");
      token = getNextToken();
      node.end = i;
    }

    if (!node) {
      node = parseTerminal();
    }

    // Call Expression
    if (node.type === "Identifier" && token?.type === "leftParen") {
      node = {
        type: "CallExpression",
        callee: node,
        arguments: [],
        start: node.start,
        end: -1,
      };
      token = getNextToken();
      while (token && token.type !== "rightParen") {
        if (token.type === "comma") {
          token = getNextToken();
        } else {
          node.arguments.push(parseExpression());
          if (token && !["comma", "rightParen"].includes(token.type)) {
            throw new UnexpectedTokenError(allTokens, token);
          }
        }
      }
      if (!token) throw new EndOfLineError(allTokens, ")");
      node.end = token.end;
      token = getNextToken();
    }

    // Binary Expression
    while (token?.type === "operator") {
      const start: number = node.start;
      const operator = token.value;
      const left: AST = node;
      token = getNextToken();
      const next = token?.next;
      const nextOperator = next?.type === "operator" ? next.value : null;

      const rightTerminalRules = [
        // E = T +- T +- E
        ADDSUB.test(operator) && nextOperator && ADDSUB.test(nextOperator),
        // E = T */ T */+- E
        MULDIV.test(operator) && nextOperator,
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

    return node;
  }
};

export class ParseError extends Error {
  constructor(allTokens: Token[], token: Token | null, message: string) {
    super();
    const padEnd =
      (token && token.start + 1) || allTokens[allTokens.length - 1].end;
    const originalCode = allTokens.map(t => t.raw || t.value).join("");
    const leftPadding = Array.from(new Array(padEnd)).join(" ");
    this.message = `${message}\n\n${originalCode}\n${leftPadding}^`;
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

export class UnknownTokenError extends ParseError {
  constructor(allTokens: Token[], token: Token) {
    super(allTokens, token, `Invalid token ${token.value}`);
    Object.setPrototypeOf(this, UnknownTokenError.prototype);
  }
}

export class UnexpectedTokenError extends ParseError {
  constructor(allTokens: Token[], token: Token) {
    super(allTokens, token, `Unexpected token ${token.value}`);
    Object.setPrototypeOf(this, UnexpectedTokenError.prototype);
  }
}

export class EndOfLineError extends ParseError {
  constructor(allTokens: Token[], expectedToken?: string) {
    const message = expectedToken
      ? `Expected ${expectedToken}`
      : `Unexpected end of line`;
    super(allTokens, null, message);
    Object.setPrototypeOf(this, EndOfLineError.prototype);
  }
}
