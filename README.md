# A static analysis and refactoring driver for TypeScript

This project is modelled on similar work in Java, see
http://ErrorProne.info

In very early design, do not use.

## Errors, not warnings (and definitely not formatting)
To comply with syntax style, users should use a formatter, not a linter.

Warnings are nice to have, but ought to appear in code review, not on the command line.
Developers should only fix warnings in code they are nearly ready to commit.

On the other hand, things which are almost always wrong should be reported as errors
by the compiler (both command line and in the editor). This gives us the most early
impact, since our tool catches real defects.

See my longer post: https://medium.com/@Jakeherringbone/why-linting-makes-me-yawn-cadbd9a51ca9

## Matchers use a convenient predicate DSL
When a developer is bitten by a bug, and thinks the compiler might have caught it,
we want to lower the bar for that developer to contribute a checker that catches it.
This biases our checks to those which save developers time.

A checker is a boolean predicate composition, like this one to detect fallthrough
(same condition as `--noImplicitFallthrough`)

```
const empty = (c: Clause) => !c.statements.length;
const isLastClause = (c: Clause) => c === last((c.parent as ts.CaseBlock).clauses);
const hasBreakOrReturn = lastStatement(
    anyOf(kindIs(ts.SyntaxKind.BreakStatement), kindIs(ts.SyntaxKind.ReturnStatement)));
export const matcher: Matcher<Clause> = not(anyOf(empty, isLastClause, hasBreakOrReturn));
```

## Producing a fix
Since we want to focus on errors, we need a way to turn them on for a large codebase without
breaking users builds or asking engineers to take an interrupt to fix things for us.
(Imagine rolling out --noImplicitAny on the whole Angular 2 codebase, or fixing --noImplicitReturns
in Google or Microsoft's entire TS corpus)

At Google, we apply the fix using a mapreduce across the whole codebase, then use a tool
to automatically send out code reviews to each team and submit.
*See H. Wright, D. Jasper, M. Klimek, C. Carruth, and Z. Wan. Large-scale automated refactoring using clangmr.
In Proceedings of the 29th International Conference on Software Maintenance, 2013.*

A fix is also nice-to-have in interactive UIs that can prompt the user and update the code.

Fixes also use a convenient DSL, such as the fix for fallthrough, where we assume most developers
meant to have a break statement:
```
let result = new match.MatchBuilder(t);
result.diagnosticMsg =
    'Case clause missing break statement\nSee http://tsetse.info/fallthrough';
result.addFix().appendText('break;');
return result.build();
```
