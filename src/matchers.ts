import * as ts from 'typescript';

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

export function anyOf<T extends ts.Node>(...matchers: Matcher</** super */ any>[]): Matcher<T> {
  return (t: T) => {
    for (let m of matchers) {
      if (m(t)) {
        return true;
      }
    }
    return false;
  };
}

export function not<T extends ts.Node>(matcher: Matcher<T>): Matcher<T> {
  return (t: T) => !matcher(t);
}

export function kindIs<T extends ts.Node>(kind: ts.SyntaxKind): Matcher<T> {
  return (t: T) => t.kind === kind;
}

export function lastStatement<T extends ts.Node&{statements: ts.NodeArray<ts.Statement>}>(
    matcher: Matcher<ts.Statement>): Matcher<T> {
  return (t: T) => matcher(t.statements[t.statements.length - 1]);
}