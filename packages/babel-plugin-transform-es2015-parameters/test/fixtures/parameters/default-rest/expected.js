var a = 1;
function rest() {
  var b = arguments.length <= 0 || arguments[0] === undefined ? a : arguments[0];

  assert.equal(b, 1);
}
rest(undefined, 2);

function rest2() {
  var b = arguments.length <= 0 || arguments[0] === undefined ? a : arguments[0];

  assert.equal(arguments.length <= 1 ? undefined : arguments[1], 2);
}
rest2(undefined, 2);

function rest3() {
  var b = arguments.length <= 0 || arguments[0] === undefined ? a : arguments[0];

  assert.equal(arguments.length - 1, 1);
}
rest3(undefined, 2);
