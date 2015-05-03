import isFunction from "lodash/lang/isFunction";
import transform from "../transformation";
import * as acorn from "../../acorn";
import * as util from "../util";
import fs from "fs";

export { util, acorn, transform };
export { pipeline } from "../transformation";
export { canCompile } from "../util";

export { default as options } from "../transformation/file/options";
export { default as Transformer } from "../transformation/transformer";
export { default as TransformerPipeline } from "../transformation/transformer-pipeline";
export { default as traverse } from "../traversal";
export { default as buildExternalHelpers } from "../tools/build-external-helpers";
export { version } from "../../../package";
export { all as parse } from "../helpers/parse";

import * as t from "../types";
export { t as types };

export function register(opts?: Object) {
  var callback = require("./register/node-polyfill");
  if (opts != null) callback(opts);
  return callback;
}

export function polyfill() {
  require("../polyfill");
}

export function transformFile(filename: string, opts?: Object, callback: Function) {
  if (isFunction(opts)) {
    callback = opts;
    opts = {};
  }

  opts.filename = filename;

  fs.readFile(filename, function (err, code) {
    if (err) return callback(err);

    var result;

    try {
      result = transform(code, opts);
    } catch (err) {
      return callback(err);
    }

    callback(null, result);
  });
}

export function transformFileSync(filename: string, opts?: Object = {}) {
  opts.filename = filename;
  return transform(fs.readFileSync(filename), opts);
}
