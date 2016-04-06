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
export class Fix {
  replacements: Replacement[] = [];
  constructor(private nodeStart: number, private nodeEnd: number) {}
  appendText(text: string): this {
    this.replacements.push({start: this.nodeEnd, end: this.nodeEnd, replaceWith: text});
    return this;
  }
}

export class MatchBuilder {
  private diagnostic: ts.Diagnostic;
  private fixes: Fix[] = [];
  constructor(private node: ts.Node) {
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
  public addFix(fix: Fix = new Fix(this.node.getStart(), this.node.getEnd())) {
    this.fixes.push(fix);
    return fix;
  }
  public build(): Match { return {diagnostic: this.diagnostic, fixes: this.fixes}; }
}