var _x = babelHelpers.classPrivateFieldLooseKey("x");

var C = function C() {
  "use strict";

  babelHelpers.classCallCheck(this, C);
  this.y = babelHelpers.classPrivateFieldLooseBase(this, _x)[_x];
  Object.defineProperty(this, _x, {
    writable: true,
    value: void 0
  });
};

expect(() => {
  new C();
}).toThrow();
