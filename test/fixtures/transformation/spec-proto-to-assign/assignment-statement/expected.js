"use strict";

var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

_defaults(obj, bar);