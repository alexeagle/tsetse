import * as ts from 'typescript';
import * as fallthrough from './fallthrough';
import {Match, NO_MATCH, Fix, Replacement} from './match';

let matches: Match[] = [];

let visit = (node: ts.Node) => {
  switch (node.kind) {
    case ts.SyntaxKind.CaseClause:
    case ts.SyntaxKind.DefaultClause:
      let n = <ts.CaseClause|ts.DefaultClause>node;
      if (fallthrough.matcher(n)) {
        let match = fallthrough.describeMatch(n);
        if (match !== NO_MATCH) {
          matches.push(match);
        }
      }
      break;
  }
  ts.forEachChild(node, visit);
};

const defaultOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES6,
  noImplicitAny: true,
  skipDefaultLibCheck: true,
  noEmit: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
};
export function checkOneFile(
    path: string, compilerOptions: ts.CompilerOptions = defaultOptions): ts.Diagnostic[] {
  let program = ts.createProgram([path], compilerOptions);
  let diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length > 0) {
    return diagnostics;
  }
  let sf = program.getSourceFile(path);
  if (!sf) {
    throw 'SourceFile not found: ' + sf;
  }
  visit(sf);

  let replacements: Replacement[] = [];
  matches.forEach(m => m.fixes.forEach(f => replacements = replacements.concat(f.replacements)));
  let fixed = sf.getFullText();
  replacements.sort((a, b) => b.start - a.start).forEach(r => {
    fixed = fixed.slice(0, r.start) + r.replaceWith + fixed.slice(r.end);
  });
  console.log('fixed source', fixed);
  return matches.map(m => m.diagnostic);
}

export class Extension {
  check(sf: ts.SourceFile): {errors: ts.Diagnostic[], data: Object} {
    visit(sf);
    const errors = matches.map(m => m.diagnostic);
    // TODO: return suggested replacements as data
    return {errors, data: null};
  }
}
const extension = new Extension();
export default extension;
