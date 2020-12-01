import {
  isJSXText,
  isJSXExpressionContainer,
  isJSXEmptyExpression,
} from "../../validators/generated";
import cleanJSXElementLiteralChild from "../../utils/react/cleanJSXElementLiteralChild";
import type * as t from "../..";

type ReturnedChild =
  | t.JSXExpressionContainer
  | t.JSXSpreadChild
  | t.JSXElement
  | t.JSXFragment
  | t.Expression;

export default function buildChildren(node: {
  children: ReadonlyArray<
    | t.JSXText
    | t.JSXExpressionContainer
    | t.JSXSpreadChild
    | t.JSXElement
    | t.JSXFragment
    | t.JSXEmptyExpression
  >;
}): ReturnedChild[] {
  const elements = [];

  for (let i = 0; i < node.children.length; i++) {
    let child: any = node.children[i];

    if (isJSXText(child)) {
      cleanJSXElementLiteralChild(child, elements);
      continue;
    }

    if (isJSXExpressionContainer(child)) child = child.expression;
    if (isJSXEmptyExpression(child)) continue;

    elements.push(child);
  }

  return elements;
}
