export interface Token {
  type:
    | "leftParen"
    | "rightParen"
    | "leftSquare"
    | "rightSquare"
    | "identifier"
    | "operator"
    | "number"
    | "string"
    | "boolean"
    | "whitespace"
    | "comma"
    | "unknown";
  value: string;
  raw?: string;
  start: number;
  end: number;
}

export interface EditorToken extends Token {
  variant?: AST["type"];
  hints?: string[];
  valid: boolean;
}

export type AST =
  | Identifier
  | Literal
  | CallExpression
  | BinaryExpression
  | ArrayExpression;

export interface ASTNode {
  start: number;
  end: number;
}

export interface BinaryExpression extends ASTNode {
  type: "BinaryExpression";
  operator: string;
  left: AST;
  right: AST;
}

export interface ArrayExpression extends ASTNode {
  type: "ArrayExpression";
  elements: AST[];
}

export interface CallExpression extends ASTNode {
  type: "CallExpression";
  callee: Identifier;
  arguments: AST[];
}

export interface Literal extends ASTNode {
  type: "Literal";
  value: string | boolean | number;
  raw: string;
}

export interface Identifier extends ASTNode {
  type: "Identifier";
  name: string;
}
