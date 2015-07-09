import stripJsonComments from "strip-json-comments";
import { validateOption, normaliseOptions } from "./index";
import isAbsolute from "path-is-absolute";
import clone from "lodash/lang/clone";
import merge from "../../../helpers/merge";
import config from "./config";
import path from "path";
import fs from "fs";
import pathExists from "path-exists";

var existsCache = {};
var jsonCache   = {};

const CONFIG_FILENAME = ".babelrc";

function exists(filename) {
  var cached = existsCache[filename];
  if (cached != null) {
    return cached;
  } else {
    return existsCache[filename] = pathExists.sync(filename);
  }
}

export default class OptionManager {
  constructor(log, pipeline) {
    this.resolvedConfigs = [];
    this.options         = OptionManager.createBareOptions();
    this.pipeline        = pipeline;
    this.log             = log;
  }

  /**
   * Description
   */

  static createBareOptions() {
    var opts = {};

    for (var key in config) {
      var opt = config[key];
      opts[key] = clone(opt.default);
    }

    return opts;
  }

  /**
   * Description
   */

  addConfig(loc) {
    if (this.resolvedConfigs.indexOf(loc) >= 0) return;

    var content = fs.readFileSync(loc, "utf8");
    var opts;

    try {
      opts = jsonCache[content] = jsonCache[content] || JSON.parse(stripJsonComments(content));
    } catch (err) {
      err.message = `${loc}: ${err.message}`;
      throw err;
    }

    this.mergeOptions(opts, loc);
    this.resolvedConfigs.push(loc);
  }

  /**
   * Description
   */

  mergeOptions(opts, alias) {
    if (!opts) return;

    for (let key in opts) {
      if (key[0] === "_") continue;

      let option = config[key];

      // check for an unknown option
      if (!option) this.log.error(`Unknown option: ${alias}.${key}`, ReferenceError);
    }

    // normalise options
    normaliseOptions(opts);

    // merge them into this current files options
    merge(this.options, opts);
  }

  /**
   * Description
   */

  findConfigs(loc) {
    if (!loc) return;

    if (!isAbsolute(loc)) {
      loc = path.join(process.cwd(), loc);
    }

    while (loc !== (loc = path.dirname(loc))) {
      if (this.options.breakConfig) return;

      var configLoc = path.join(loc, CONFIG_FILENAME);
      if (exists(configLoc)) this.addConfig(configLoc);
    }
  }

  /**
   * Description
   */

  normaliseOptions() {
    var opts = this.options;

    for (let key in config) {
      var option = config[key];
      var val    = opts[key];

      // optional
      if (!val && option.optional) continue;

      // deprecated
      if (val && option.deprecated) {
        this.log.deprecate(`Deprecated option ${key}: ${option.deprecated}`);
      }

      // validate
      if (val) val = validateOption(key, val, this.pipeline);

      // aaliases
      if (option.alias) {
        opts[option.alias] = opts[option.alias] || val;
      } else {
        opts[key] = val;
      }
    }
  }

  /**
   * Description
   */

  init(opts) {
    this.mergeOptions(opts, "direct");

    // babelrc option
    if (opts.babelrc) {
      for (var loc of (opts.babelrc: Array)) this.addConfig(loc);
    }

    // resolve all .babelrc files
    this.findConfigs(opts.filename);

    // merge in env
    var envKey = process.env.BABEL_ENV || process.env.NODE_ENV || "development";
    if (this.options.env) {
      this.mergeOptions(this.options.env[envKey], `direct.env.${envKey}`);
    }

    // normalise
    this.normaliseOptions(opts);

    return this.options;
  }
}
