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

export function not<T extends ts.Node>(matcher: Matcher<T>): Matcher<T> {
  return (t: T) => !matcher(t);
}