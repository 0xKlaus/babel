import {
  stringTypeAnnotation,
  numberTypeAnnotation,
  voidTypeAnnotation,
  booleanTypeAnnotation,
  genericTypeAnnotation,
  identifier,
} from "../generated";
import type * as t from "../..";

/**
 * Create a type annotation based on typeof expression.
 */
export default function createTypeAnnotationBasedOnTypeof(
  type:
    | "string"
    | "number"
    | "undefined"
    | "boolean"
    | "function"
    | "object"
    | "symbol",
):
  | t.StringTypeAnnotation
  | t.VoidTypeAnnotation
  | t.NumberTypeAnnotation
  | t.BooleanTypeAnnotation
  | t.GenericTypeAnnotation {
  if (type === "string") {
    return stringTypeAnnotation();
  } else if (type === "number") {
    return numberTypeAnnotation();
  } else if (type === "undefined") {
    return voidTypeAnnotation();
  } else if (type === "boolean") {
    return booleanTypeAnnotation();
  } else if (type === "function") {
    return genericTypeAnnotation(identifier("Function"));
  } else if (type === "object") {
    return genericTypeAnnotation(identifier("Object"));
  } else if (type === "symbol") {
    return genericTypeAnnotation(identifier("Symbol"));
  } else {
    throw new Error("Invalid typeof value");
  }
}
