import PluginPass from "./plugin-pass";
import * as messages from "babel-messages";
import traverse from "babel-traverse";
import assign from "lodash/object/assign";
import clone from "lodash/lang/clone";
import File from "./file";
import * as t from "babel-types";

const VALID_PLUGIN_PROPERTIES = [
  "visitor", "metadata",
  "manipulateOptions",
  "post", "pre"
];

const VALID_METADATA_PROPERTES = [
  "dependencies",
  "optional",
  "stage",
  "group",
  "experimental",
  "secondPass",
  "mode"
];

export default class Plugin {
  constructor(key: string, plugin: Object) {
    Plugin.validate(key, plugin);

    plugin = assign({}, plugin);

    var take = function (key) {
      var val = plugin[key];
      delete plugin[key];
      return val;
    };

    this.manipulateOptions = take("manipulateOptions");
    this.metadata          = take("metadata") || {};
    this.dependencies      = this.metadata.dependencies || [];
    this.post              = take("post");
    this.pre               = take("pre");

    //

    if (this.metadata.stage != null) {
      this.metadata.optional = true;
    }

    //

    this.visitor = this.normalize(clone(take("visitor")) || {});
    this.key     = key;
  }

  static validate(name, plugin) {
    for (let key in plugin) {
      if (key[0] === "_") continue;
      if (VALID_PLUGIN_PROPERTIES.indexOf(key) >= 0) continue;

      var msgType = "pluginInvalidProperty";
      if (t.TYPES.indexOf(key) >= 0) msgType = "pluginInvalidPropertyVisitor";
      throw new Error(messages.get(msgType, name, key));
    }

    for (let key in plugin.metadata) {
      if (VALID_METADATA_PROPERTES.indexOf(key) >= 0) continue;

      throw new Error(messages.get("pluginInvalidProperty", name, `metadata.${key}`));
    }
  }

  normalize(visitor: Object): Object {
    traverse.explode(visitor);
    return visitor;
  }

  buildPass(file: File): PluginPass {
    // validate Transformer instance
    if (!(file instanceof File)) {
      throw new TypeError(messages.get("pluginNotFile", this.key));
    }

    return new PluginPass(file, this);
  }
}
