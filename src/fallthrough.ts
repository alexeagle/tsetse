import * as match from './match';
import {not, lastStatement, kindIs, anyOf, Matcher} from './matchers';
import * as ts from 'typescript';

type Clause = ts.CaseClause | ts.DefaultClause;

const last = (l: any[]) => l[l.length - 1];

const lastClause = (c: Clause) => c === last((c.parent as ts.CaseBlock).clauses);
const hasBreakOrReturn = lastStatement(
    anyOf(kindIs(ts.SyntaxKind.BreakStatement), kindIs(ts.SyntaxKind.ReturnStatement)));
export const matcher: Matcher<Clause> = not(anyOf(lastClause, hasBreakOrReturn));

export class FallThrough {
  match(t: Clause): match.Match {
    if (matcher(t)) {
      let result = new match.MatchBuilder(t);
      result.diagnosticMsg = 'Case clause missing break statement\nSee http://tsoops/fallthrough';
      result.addFix({
        replacements: [{start: t.getStart(), end: t.getEnd(), replaceWith: 'haha april fools'}]
      });
      return result.build();
    }
    return match.NO_MATCH;
  }
}