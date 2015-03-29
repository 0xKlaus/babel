import isString from "lodash/lang/isString";
import * as t from "../../types";

var isCreateClassCallExpression = t.buildMatchMemberExpression("React.createClass");

export function isCreateClass(node) {
  if (!node || !t.isCallExpression(node)) return false;

  // not React.createClass call member object
  if (!isCreateClassCallExpression(node.callee)) return false;

  // no call arguments
  var args = node.arguments;
  if (args.length !== 1) return false;

  // first node arg is not an object
  var first = args[0];
  if (!t.isObjectExpression(first)) return false;

  return true;
}

export var isReactComponent = t.buildMatchMemberExpression("React.Component");

export function isCompatTag(tagName) {
  return tagName && /^[a-z]|\-/.test(tagName);
}

function flattenChildren(args) {
  var flattened = [];
  var last;

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (isStringLiteral(arg) && isStringLiteral(last)) {
      last.value += arg.value;
    } else {
      last = arg;
      flattened.push(arg);
    }
  }

  return flattened;
}

function isStringLiteral(node) {
  return t.isLiteral(node) && isString(node.value);
}

function cleanJSXElementLiteralChild(child, args) {
  var lines = child.value.split(/\r\n|\n|\r/);

  var lastNonEmptyLine = 0;
  var i;

  for (i = 0; i < lines.length; i++) {
    if (lines[i].match(/[^ \t]/)) {
      lastNonEmptyLine = i;
    }
  }

  for (i = 0; i < lines.length; i++) {
    var line = lines[i];

    var isFirstLine = i === 0;
    var isLastLine = i === lines.length - 1;
    var isLastNonEmptyLine = i === lastNonEmptyLine;

    // replace rendered whitespace tabs with spaces
    var trimmedLine = line.replace(/\t/g, " ");

    // trim whitespace touching a newline
    if (!isFirstLine) {
      trimmedLine = trimmedLine.replace(/^[ ]+/, "");
    }

    // trim whitespace touching an endline
    if (!isLastLine) {
      trimmedLine = trimmedLine.replace(/[ ]+$/, "");
    }

    if (trimmedLine) {
      if (!isLastNonEmptyLine) {
        trimmedLine += " ";
      }

      args.push(t.literal(trimmedLine));
    }
  }
}

export function buildChildren(node) {
  var elems = [];

  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    if (t.isJSXExpressionContainer(child)) child = child.expression;

    if (t.isLiteral(child) && typeof child.value === "string") {
      cleanJSXElementLiteralChild(child, elems);
      continue;
    } else if (t.isJSXEmptyExpression(child)) {
      continue;
    }

    elems.push(child);
  }

  return flattenChildren(elems);
}
