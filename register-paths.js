// register-paths.js
const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.build.json');

tsConfigPaths.register({
  baseUrl: tsConfig.compilerOptions.baseUrl,
  paths: tsConfig.compilerOptions.paths,
});
