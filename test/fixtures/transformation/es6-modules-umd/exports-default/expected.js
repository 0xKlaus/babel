(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module);
  }
})(function (exports, module) {
  "use strict";

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  module.exports = foo;
  module.exports = 42;
  module.exports = {};
  module.exports = [];
  module.exports = foo;

  module.exports = function () {};

  var _default = (function () {
    var _class = function _default() {
      _classCallCheck(this, _class);
    };

    return _class;
  })();

  module.exports = _default;

  function foo() {}

  var Foo = (function () {
    var _Foo = function Foo() {
      _classCallCheck(this, _Foo);
    };

    return _Foo;
  })();

  module.exports = Foo;
});