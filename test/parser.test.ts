import { getTokens } from "../src/compiler/lexer";
import {
  buildAST,
  EndOfLineError,
  UnexpectedTokenError,
  UnknownTokenError,
} from "../src/compiler/parser";

describe("parser", () => {
  test("empty string", () => {
    const tokens = getTokens("");
    const ast = buildAST(tokens);
    expect(ast).toEqual(null);
  });

  test("1 +", () => {
    const tokens = getTokens("1 +");
    expect(() => buildAST(tokens)).toThrow(EndOfLineError);
  });

  test(`any(1, 2`, () => {
    const tokens = getTokens(`any(1, 2`);
    expect(() => buildAST(tokens)).toThrow(EndOfLineError);
  });

  test(`[1, 2,`, () => {
    const tokens = getTokens(`[1, 2,`);
    expect(() => buildAST(tokens)).toThrow(EndOfLineError);
  });

  test(`1 fn(1)`, () => {
    const tokens = getTokens(`1 fn(1)`);
    expect(() => buildAST(tokens)).toThrow(UnexpectedTokenError);
  });

  test(`1 1`, () => {
    const tokens = getTokens(`1 1`);
    expect(() => buildAST(tokens)).toThrow(UnexpectedTokenError);
  });

  test(`1 + $1`, () => {
    const tokens = getTokens(`1 + $1`);
    expect(() => buildAST(tokens)).toThrow(UnknownTokenError);
  });

  test(`1 bar`, () => {
    const tokens = getTokens(`1 bar`);
    expect(() => buildAST(tokens)).toThrow(UnexpectedTokenError);
  });

  test(`foo(1 bar)`, () => {
    const tokens = getTokens(`foo(1 bar)`);
    expect(() => buildAST(tokens)).toThrow(UnexpectedTokenError);
  });

  test(`foo(1bar)`, () => {
    const tokens = getTokens(`foo(1bar)`);
    expect(() => buildAST(tokens)).toThrow(UnexpectedTokenError);
  });

  test("12", () => {
    const tokens = getTokens("12");
    const ast = buildAST(tokens);
    expect(ast).toEqual({
      type: "Literal",
      value: 12,
      start: 0,
      end: 2,
    });
  });

  test(`"123hello"`, () => {
    const tokens = getTokens(`"123hello"`);
    const ast = buildAST(tokens);
    expect(ast).toEqual({
      type: "Literal",
      value: "123hello",
      start: 0,
      end: 10,
    });
  });

  test(`[1,2]`, () => {
    const tokens = getTokens(`[1,2]`);
    const ast = buildAST(tokens);
    expect(ast).toEqual({
      type: "ArrayExpression",
      elements: [
        { type: "Literal", value: 1, start: 1, end: 2 },
        { type: "Literal", value: 2, start: 3, end: 4 },
      ],
      start: 0,
      end: 5,
    });
  });

  test("1 + 23", () => {
    const tokens = getTokens("1 + 23");
    const ast = buildAST(tokens);

    expect(ast).toEqual({
      type: "BinaryExpression",
      operator: "+",
      left: { type: "Literal", value: 1, start: 0, end: 1 },
      right: { type: "Literal", value: 23, start: 4, end: 6 },
      start: 0,
      end: 6,
    });
  });

  test("1 - 23 + 3", () => {
    const tokens = getTokens("1 - 23 + 3");
    const ast = buildAST(tokens);

    expect(ast).toEqual({
      type: "BinaryExpression",
      operator: "+",
      left: {
        type: "BinaryExpression",
        operator: "-",
        left: { type: "Literal", value: 1, start: 0, end: 1 },
        right: { type: "Literal", value: 23, start: 4, end: 6 },
        start: 0,
        end: 6,
      },
      right: { type: "Literal", value: 3, start: 9, end: 10 },
      start: 0,
      end: 10,
    });
  });

  test("1 / 23 - 3", () => {
    const tokens = getTokens("1 / 23 - 3");
    const ast = buildAST(tokens);

    expect(ast).toEqual({
      type: "BinaryExpression",
      operator: "-",
      left: {
        type: "BinaryExpression",
        operator: "/",
        left: { type: "Literal", value: 1, start: 0, end: 1 },
        right: { type: "Literal", value: 23, start: 4, end: 6 },
        start: 0,
        end: 6,
      },
      right: { type: "Literal", value: 3, start: 9, end: 10 },
      start: 0,
      end: 10,
    });
  });

  test("1 - 23 * 3", () => {
    const tokens = getTokens("1 - 23 * 3");
    const ast = buildAST(tokens);

    expect(ast).toEqual({
      type: "BinaryExpression",
      operator: "-",
      left: { type: "Literal", value: 1, start: 0, end: 1 },
      right: {
        type: "BinaryExpression",
        operator: "*",
        left: { type: "Literal", value: 23, start: 4, end: 6 },
        right: { type: "Literal", value: 3, start: 9, end: 10 },
        start: 4,
        end: 10,
      },
      start: 0,
      end: 10,
    });
  });

  test("3/4*5", () => {
    const tokens = getTokens("3/4*5");
    const ast = buildAST(tokens);

    expect(ast).toMatchObject({
      type: "BinaryExpression",
      operator: "*",
      left: {
        type: "BinaryExpression",
        operator: "/",
        left: { type: "Literal", value: 3 },
        right: { type: "Literal", value: 4 },
      },
      right: { type: "Literal", value: 5 },
    });
  });

  test("1*2-3/4*5", () => {
    const tokens = getTokens("1*2-3/4*5");
    const ast = buildAST(tokens);

    expect(ast).toMatchObject({
      type: "BinaryExpression",
      operator: "-",
      left: {
        type: "BinaryExpression",
        operator: "*",
        left: { type: "Literal", value: 1 },
        right: { type: "Literal", value: 2 },
      },
      right: {
        type: "BinaryExpression",
        operator: "*",
        left: {
          type: "BinaryExpression",
          operator: "/",
          left: { type: "Literal", value: 3 },
          right: { type: "Literal", value: 4 },
        },
        right: { type: "Literal", value: 5 },
      },
    });
  });

  test("1 * (2 + (3 / 4 - 5))", () => {
    const tokens = getTokens("1 * (2 + (3 / 4 - 5))");
    const ast = buildAST(tokens);

    expect(ast).toMatchObject({
      type: "BinaryExpression",
      operator: "*",
      left: { type: "Literal", value: 1 },
      right: {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "Literal", value: 2 },
        right: {
          type: "BinaryExpression",
          operator: "-",
          left: {
            type: "BinaryExpression",
            operator: "/",
            left: { type: "Literal", value: 3 },
            right: { type: "Literal", value: 4 },
          },
          right: { type: "Literal", value: 5 },
        },
      },
    });
  });

  test(`123 + num`, () => {
    const tokens = getTokens(`123 + num`);
    const ast = buildAST(tokens);

    expect(ast).toMatchObject({
      type: "BinaryExpression",
      operator: "+",
      left: { type: "Literal", value: 123 },
      right: { type: "Identifier", name: "num" },
    });
  });

  test(`((123 + num))`, () => {
    const tokens = getTokens(`((123 + num))`);
    const ast = buildAST(tokens);

    expect(ast).toMatchObject({
      type: "BinaryExpression",
      operator: "+",
      left: { type: "Literal", value: 123 },
      right: { type: "Identifier", name: "num" },
    });
  });

  test(`sum(1,2,3,)`, () => {
    const tokens = getTokens(`sum(1,2,3,)`);
    const ast = buildAST(tokens);

    expect(ast).toMatchObject({
      type: "CallExpression",
      callee: { type: "Identifier", name: "sum" },
      arguments: [
        { type: "Literal", value: 1 },
        { type: "Literal", value: 2 },
        { type: "Literal", value: 3 },
      ],
    });
  });

  test(`sum(123, (1 + 2), true)`, () => {
    const tokens = getTokens(`sum(123, (1 + 2), true)`);
    const ast = buildAST(tokens);

    expect(ast).toMatchObject({
      type: "CallExpression",
      callee: { type: "Identifier", name: "sum" },
      arguments: [
        { type: "Literal", value: 123 },
        {
          type: "BinaryExpression",
          operator: "+",
          left: { type: "Literal", value: 1 },
          right: { type: "Literal", value: 2 },
          start: 10,
          end: 15,
        },
        { type: "Literal", value: true, start: 18, end: 22 },
      ],
      start: 0,
      end: 23,
    });
  });

  test(`sum([123, 345], false)`, () => {
    const tokens = getTokens(`sum([123, 345], false)`);
    const ast = buildAST(tokens);

    expect(ast).toMatchObject({
      type: "CallExpression",
      callee: { type: "Identifier", name: "sum" },
      arguments: [
        {
          type: "ArrayExpression",
          elements: [
            { type: "Literal", value: 123 },
            { type: "Literal", value: 345 },
          ],
        },
        { type: "Literal", value: false },
      ],
    });
  });

  test(`1 + sum(1,2,3)`, () => {
    const tokens = getTokens(`1 + sum(1,2,3)`);
    const ast = buildAST(tokens);

    expect(ast).toMatchObject({
      type: "BinaryExpression",
      left: { type: "Literal", value: 1 },
      operator: "+",
      start: 0,
      end: 14,
      right: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "sum" },
        arguments: [
          { type: "Literal", value: 1, start: 8, end: 9 },
          { type: "Literal", value: 2, start: 10, end: 11 },
          { type: "Literal", value: 3, start: 12, end: 13 },
        ],
        start: 4,
        end: 14,
      },
    });
  });

  test(`1 + [1,2,3]`, () => {
    const tokens = getTokens(`1 + [1,2,3]`);
    const ast = buildAST(tokens);
    expect(ast).toMatchObject({
      type: "BinaryExpression",
      left: { type: "Literal", value: 1 },
      operator: "+",
      right: {
        type: "ArrayExpression",
        elements: [
          { type: "Literal", value: 1 },
          { type: "Literal", value: 2 },
          { type: "Literal", value: 3 },
        ],
      },
    });
  });

  test("any(a + b) - c", () => {
    const tokens = getTokens("any(a + b) - c");
    expect(() => buildAST(tokens)).not.toThrow();
  });

  test("any(a, all(b, c))", () => {
    const tokens = getTokens("any(a, all(b, c))");
    const ast = buildAST(tokens);
    expect(ast).toMatchObject({
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "any",
        start: 0,
        end: 3,
      },
      arguments: [
        {
          type: "Identifier",
          name: "a",
          start: 4,
          end: 5,
        },
        {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: "all",
            start: 7,
            end: 10,
          },
          arguments: [
            {
              type: "Identifier",
              name: "b",
              start: 11,
              end: 12,
            },
            {
              type: "Identifier",
              name: "c",
              start: 14,
              end: 15,
            },
          ],
          start: 7,
          end: 16,
        },
      ],
      start: 0,
      end: 17,
    });
  });

  test("any(a, all(b, c)) + d", () => {
    const tokens = getTokens("any(a, all(b, c)) + d");
    expect(() => buildAST(tokens)).not.toThrow();
  });

  test(`(fn(1) + 1)`, () => {
    const tokens = getTokens(`(fn(1) + 1)`);
    expect(() => buildAST(tokens)).not.toThrow();
  });

  test(`[1,2] + 1`, () => {
    const tokens = getTokens(`[1,2] + 1`);
    expect(() => buildAST(tokens)).not.toThrow();
  });
});
