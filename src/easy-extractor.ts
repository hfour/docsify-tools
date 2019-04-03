import * as ae from '@microsoft/api-extractor';
import * as os from 'os'
import * as path from 'path'
import * as mkdirp from 'mkdirp';
import * as yargs from 'yargs';

let tmpDir = path.resolve(os.tmpdir(), 'api-extractor-' + Math.random().toString())
mkdirp.sync(tmpDir);


let args = yargs
  .wrap(yargs.terminalWidth() - 1)
  .usage('$0 [-p pkgDir] -o docsDir')
  .options({
    package: {
      alias: 'p',
      type: 'string',
      describe: 'Path to the package directory (defaults to the current directory)',
      default: process.cwd()
    },
    output: {
      alias: 'o',
      type: 'string',
      describe: 'Where to output the documentation relative to the package directory',
      demandOption: true
    },
    help: {
      alias: 'h',
      type: 'boolean',
      describe: 'Show this help screen'
    }
  }).argv;


let apiEx = new ae.Extractor({
  apiJsonFile: {
    enabled: true,
    outputFolder: tmpDir
  },
  apiReviewFile: {
    enabled: false
  },
  compiler: {
    configType: 'tsconfig',
    rootFolder: '.'
  },
  tsdocMetadata: {
    enabled: false
  },
  project: {
    entryPointSourceFile: 'build/index.d.ts'
  },
  "validationRules": {
    "missingReleaseTags": ae.ExtractorValidationRulePolicy.allow
  },
}, {
  localBuild: true
});

apiEx.processProject()
// todo: api-documenter