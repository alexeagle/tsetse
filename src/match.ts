import * as ts from 'typescript';

export const NO_MATCH: Match = {
  diagnostic: undefined
};
export interface Match {
  diagnostic: ts.Diagnostic;
  // First fix is applied by default
  // Other fixes may be shown in an interactive context
  fixes?: Fix[];
}
export interface Replacement {
  start: number;
  end: number;
  replaceWith: string;
}
export interface Fix {
  replacements: Replacement[];
  addImports?: {symbol: string, module: string};
  removeImports?: {symbol: string, module: string};
}

export class MatchBuilder {
  private diagnostic: ts.Diagnostic;
  private fixes: Fix[] = [];
  constructor(node: ts.Node) {
    this.diagnostic = {
      messageText: '',
      category: 1,
      code: 1,
      file: node.getSourceFile(),
      start: node.getStart(),
      length: node.getEnd() - node.getStart(),
    };
  }
  public set diagnosticMsg(msg: string) { this.diagnostic.messageText = msg; }
  public addFix(fix: Fix) { this.fixes.push(fix); }
  public build(): Match { return {diagnostic: this.diagnostic, fixes: this.fixes}; }
}