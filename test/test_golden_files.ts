import {expect} from 'chai';
import {createReadStream, readdirSync} from 'fs';
import {createInterface} from 'readline';
import {checkOneFile} from '../src/main';
import * as ts from 'typescript';

let r = /\s*\/\/\s*BUG:/;

for (let file of readdirSync('test_files')) {
  describe(file, () => {
    it('should match "// BUG" lines', (done) => {
      let path = `test_files/${file}`;
      var lineReader = createInterface({input: createReadStream(path, {encoding: 'utf-8'})});

      let actual: number[] = [], expected: number[] = [];
      let lineno = 1;
      lineReader
          .on('line',
              (line: string) => {
                if (r.test(line)) {
                  expected.push(lineno + 1);
                }
                lineno++;
              })
          .on('close', () => {
            let diagnostics = checkOneFile(path);
            for (let d of diagnostics) {
              let line = ts.getLineAndCharacterOfPosition(d.file, d.start).line + 1;
              actual.push(line)
            }
            expect(actual).to.deep.equal(expected);
            done();
          });
    });
  });
}
