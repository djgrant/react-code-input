import { EditorToken, Token } from "./types";

export const getEditorTokens = (
  tokens: Token[],
  symbols: string[]
): EditorToken[] => {
  return tokens.map((token, i) => {
    const nextToken = getNextToken(i);
    switch (token.type) {
      case "identifier":
        const matchingTokens = symbols.filter(
          v =>
            v.length >= token.value.length &&
            v.startsWith(token.value) &&
            v !== token.value
        );

        const variant =
          nextToken?.type === "leftParen" ? "CallExpression" : undefined;

        return {
          ...token,
          variant,
          hints: matchingTokens,
          valid: symbols.includes(token.value),
        };

      case "number":
        return {
          ...token,
          valid: token.value.split("").filter(char => char === ".").length < 2,
        };

      case "unknown":
        return { ...token, valid: false };

      default:
        return { ...token, valid: true };
    }
  });

  function getNextToken(i: number): Token | null {
    const token = tokens[++i];
    if (!token) return null;
    if (token.type === "whitespace") return getNextToken(i);
    return token;
  }
};
