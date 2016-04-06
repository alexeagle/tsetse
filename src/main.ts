import * as ts from 'typescript';
import * as fallthrough from './fallthrough';

let diags: ts.Diagnostic[] = [];

let visit =
    (node: ts.Node) => {
      switch (node.kind) {
        case ts.SyntaxKind.CaseClause:
        case ts.SyntaxKind.DefaultClause:
          let n = <ts.CaseClause|ts.DefaultClause>node;
          if (fallthrough.matcher(n)) {
            let d = new fallthrough.FallThrough().match(n);
            diags.push(d.diagnostic);
          }
          break;
      }
      ts.forEachChild(node, visit);
    }

export function checkOneFile(path: string, compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES6,
  noImplicitAny: true,
  skipDefaultLibCheck: true,
  noEmit: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
}):
    {diagnostics: ts.Diagnostic[]} {
      let program = ts.createProgram([path], compilerOptions);
      let diagnostics = ts.getPreEmitDiagnostics(program);
      if (diagnostics.length > 0) {
        return {diagnostics};
      }
      let sf = program.getSourceFile(path);
      if (!sf) {
        throw 'SourceFile not found: ' + sf;
      }
      visit(sf);
      return {diagnostics: diags};
    }

// CLI entry point
if (require.main === module) {}
