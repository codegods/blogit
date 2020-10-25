"use strict";

const path = require("path");
const fs = require("fs");
const getPublicUrlOrPath = require("react-dev-utils/getPublicUrlOrPath");

// Make sure any symlinks in the project folder are resolved
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === "development",
  require(resolveApp("package.json")).homepage,
  process.env.PUBLIC_URL
);

const moduleFileExtensions = [
  "web.mjs",
  "mjs",
  "web.js",
  "js",
  "web.ts",
  "ts",
  "web.tsx",
  "tsx",
  "json",
  "web.jsx",
  "jsx",
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

module.exports = {
  ///  dotenv: resolveApp('.env'),
  appPath: resolveApp("."),
  appBuild: resolveApp("../build"),
  appPublic: resolveApp("public"),
  appHtml: resolveApp("public/index.html"),
  appIndexJs: resolveModule(resolveApp, "src/index"),
  appPackageJson: resolveApp("package.json"),
  appSrc: resolveApp("src"),
  appTsConfig: resolveApp("tsconfig.json"),
  //  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp("yarn.lock"),
  //  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp("node_modules"),
  publicUrlOrPath,
};

module.exports.moduleFileExtensions = moduleFileExtensions;
