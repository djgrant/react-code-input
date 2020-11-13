export interface Token {
  type:
    | "leftParen"
    | "rightParen"
    | "variable"
    | "operator"
    | "number"
    | "string"
    | "whitespace"
    | "unknown";
  value: string;
  renderedValue?: string;
}

export type LintedToken = Token & { hints?: string[]; valid: boolean };
