import * as match from './match';
import {not, lastStatement, kindIs, anyOf, Matcher} from './matchers';
import * as ts from 'typescript';

type Clause = ts.CaseClause | ts.DefaultClause;

const last = (l: any[]) => l[l.length - 1];

const empty = (c: Clause) => !c.statements.length;
const isLastClause = (c: Clause) => c === last((c.parent as ts.CaseBlock).clauses);
const hasBreakOrReturn = lastStatement(
    anyOf(kindIs(ts.SyntaxKind.BreakStatement), kindIs(ts.SyntaxKind.ReturnStatement)));
export const matcher: Matcher<Clause> = not(anyOf(empty, isLastClause, hasBreakOrReturn));

export function describeMatch(t: Clause): match.Match {
  if (matcher(t)) {
    let result = new match.MatchBuilder(t);
    result.diagnosticMsg =
        'Case clause missing break statement\nSee http://tsetse.info/fallthrough';
    result.addFix().appendText('break;');
    return result.build();
  }
  return match.NO_MATCH;
}