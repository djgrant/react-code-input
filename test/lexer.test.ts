import { getTokens } from "../src/compiler/lexer";

describe("lexer", () => {
  test("1", () => {
    const tokens = getTokens("1");
    expect(tokens).toEqual([{ start: 0, end: 1, type: "number", value: "1" }]);
  });

  test(`"1"`, () => {
    const tokens = getTokens(`"1"`);
    expect(tokens).toEqual([
      { start: 0, end: 3, type: "string", value: "1", raw: `"1"` },
    ]);
  });

  test("1 + 1", () => {
    const tokens = getTokens("1 + 1");
    expect(tokens).toEqual([
      { start: 0, end: 1, type: "number", value: "1" },
      { start: 1, end: 2, type: "whitespace", value: " ", raw: "\u00A0" },
      { start: 2, end: 3, type: "operator", value: "+" },
      { start: 3, end: 4, type: "whitespace", value: " ", raw: "\u00A0" },
      { start: 4, end: 5, type: "number", value: "1" },
    ]);
  });

  test(`123 + "123"`, () => {
    const tokens = getTokens(`123 + "123"`);
    expect(tokens).toEqual([
      { start: 0, end: 3, type: "number", value: "123" },
      { start: 3, end: 4, type: "whitespace", value: " ", raw: "\u00A0" },
      { start: 4, end: 5, type: "operator", value: "+" },
      { start: 5, end: 6, type: "whitespace", value: " ", raw: "\u00A0" },
      { start: 6, end: 11, type: "string", value: "123", raw: `"123"` },
    ]);
  });

  test(`123 + num`, () => {
    const tokens = getTokens(`123 + num`);
    expect(tokens).toEqual([
      { start: 0, end: 3, type: "number", value: "123" },
      { start: 3, end: 4, type: "whitespace", value: " ", raw: "\u00A0" },
      { start: 4, end: 5, type: "operator", value: "+" },
      { start: 5, end: 6, type: "whitespace", value: " ", raw: "\u00A0" },
      { start: 6, end: 9, type: "identifier", value: "num" },
    ]);
  });

  test(`sum(123, 345)`, () => {
    const tokens = getTokens(`sum(123, 345)`);
    expect(tokens).toEqual([
      { start: 0, end: 3, type: "identifier", value: "sum" },
      { start: 3, end: 4, type: "leftParen", value: "(" },
      { start: 4, end: 7, type: "number", value: "123" },
      { start: 7, end: 8, type: "comma", value: "," },
      { start: 8, end: 9, type: "whitespace", value: " ", raw: "\u00A0" },
      { start: 9, end: 12, type: "number", value: "345" },
      { start: 12, end: 13, type: "rightParen", value: ")" },
    ]);
  });

  test(`sum(true, false)`, () => {
    const tokens = getTokens(`sum(true, false)`);
    expect(tokens).toEqual([
      { start: 0, end: 3, type: "identifier", value: "sum" },
      { start: 3, end: 4, type: "leftParen", value: "(" },
      { start: 4, end: 8, type: "boolean", value: "true" },
      { start: 8, end: 9, type: "comma", value: "," },
      { start: 9, end: 10, type: "whitespace", value: " ", raw: "\u00A0" },
      { start: 10, end: 15, type: "boolean", value: "false" },
      { start: 15, end: 16, type: "rightParen", value: ")" },
    ]);
  });

  test(`sum([123, 345])`, () => {
    const tokens = getTokens(`sum([123, 345])`);
    expect(tokens).toEqual([
      { start: 0, end: 3, type: "identifier", value: "sum" },
      { start: 3, end: 4, type: "leftParen", value: "(" },
      { start: 4, end: 5, type: "leftSquare", value: "[" },
      { start: 5, end: 8, type: "number", value: "123" },
      { start: 8, end: 9, type: "comma", value: "," },
      { start: 9, end: 10, type: "whitespace", value: " ", raw: "\u00A0" },
      { start: 10, end: 13, type: "number", value: "345" },
      { start: 13, end: 14, type: "rightSquare", value: "]" },
      { start: 14, end: 15, type: "rightParen", value: ")" },
    ]);
  });
});
