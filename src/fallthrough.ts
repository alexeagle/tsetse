import {Matcher, Match, MatchBuilder, allOf, not, Fix, NO_MATCH} from './matchers';
import * as ts from 'typescript';

type Clause = ts.CaseClause | ts.DefaultClause;

const last = (l: any[]) => l[l.length - 1];

const lastClause = (c: Clause) =>
    c === last((c.parent as ts.CaseBlock).clauses);
const fallsThrough = (c: Clause) =>
    c.statements[c.statements.length - 1].kind != ts.SyntaxKind.BreakStatement;

export const matcher: Matcher<Clause> = allOf(fallsThrough, not(lastClause));

export class FallThrough {
  match(t: Clause): Match {
    if (matcher(t)) {
      let result = new MatchBuilder(t);
      result.diagnosticMsg = 'Case clause missing break statement\nSee http://tsoops/fallthrough';
      result.addFix({
        replacements: [{start: t.getStart(), end: t.getEnd(), replaceWith: 'haha april fools'}]
      });
      return result.build();
    }
    return NO_MATCH;
  }
}