const code = multiline([
  "for (const {foo, ...bar} of { bar: [] }) {",
    "() => foo;",
    "const [qux] = bar;",
    "try {} catch (e) {",
      "let quux = qux;",
    "}",
  "}"
]);

let programPath;
let forOfPath;
let functionPath;

transform(code, {
  configFile: false,
  plugins: [
    "../../../../lib",
    {
      post({ path }) {
        programPath = path;
        path.traverse({
          ForOfStatement(path) { forOfPath = path },
          FunctionExpression(path) { functionPath = path }
        });
      }
    }
  ]
});

expect(Object.keys(programPath.scope.bindings)).toEqual(["foo", "bar"]);

// for declarations should be transformed to for bindings
expect(forOfPath.scope.bindings).toEqual({});
// The body should be wrapped into closure
expect(forOfPath.get("body").scope.bindings).toEqual({});

expect(Object.keys(functionPath.scope.bindings)).toEqual(["foo", "bar", "qux", "quux"]);
