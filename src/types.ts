export interface Token {
  type: 'variable' | 'operator' | 'number' | 'whitespace' | 'unknown';
  value: string;
}

export type LintedToken = Token & { hints?: string[]; valid: boolean };
