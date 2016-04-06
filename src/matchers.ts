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

/*
 * Define a predicate on AST nodes.
 */
export type Matcher<T extends ts.Node> = (t: T) => boolean;

export function allOf<T extends ts.Node>(...matchers: Matcher</** super */ any>[]): Matcher<T> {
  return (t: T) => {
    for (let m of matchers) {
      if (!m(t)) {
        return false;
      }
    }
    return true;
  };
}

export function not<T extends ts.Node>(matcher: Matcher<T>): Matcher<T> {
  return (t: T) => !matcher(t);
}