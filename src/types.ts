export interface Token {
  type:
    | 'leftParen'
    | 'rightParen'
    | 'variable'
    | 'operator'
    | 'number'
    | 'string'
    | 'whitespace'
    | 'unknown'
    | 'unterminatedString';
  value: string;
}

export type LintedToken = Token & { hints?: string[]; valid: boolean };
