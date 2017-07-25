// @flow

import defineType, {
  assertEach,
  assertNodeType,
  assertOneOf,
  assertValueType,
  chain,
} from "./index";
import { functionDeclarationCommon } from "./core";
import { classMethodOrDeclareMethodCommon } from "./es2015";

const bool = assertValueType("boolean");

function validate(validate) {
  return { validate };
}

function typeIs(typeName) {
  return typeof typeName === "string"
    ? assertNodeType(typeName)
    : assertNodeType(...typeName);
}

function validateType(name) {
  return validate(typeIs(name));
}

function validateOptional(validate) {
  return { validate, optional: true };
}

function validateOptionalType(typeName) {
  return { validate: typeIs(typeName), optional: true };
}

function arrayOf(elementType) {
  return chain(assertValueType("array"), assertEach(elementType));
}

function arrayOfType(nodeTypeName) {
  return arrayOf(typeIs(nodeTypeName));
}

function validateArrayOfType(nodeTypeName) {
  return validate(arrayOfType(nodeTypeName));
}

defineType("TSParameterProperty", {
  aliases: ["LVal"], // TODO: This isn't usable in general as an LVal. Should have a "Parameter" alias.
  visitor: ["parameter"],
  fields: {
    accessibility: {
      validate: assertOneOf("public", "private", "protected"),
      optional: true,
    },
    readonly: {
      validate: assertValueType("boolean"),
      optional: true,
    },
    parameter: {
      validate: assertNodeType("Identifier", "AssignmentPattern"),
    },
  },
});

defineType("TSDeclareFunction", {
  aliases: ["Statement", "Declaration"],
  visitor: ["id", "typeParameters", "params", "returnType"],
  fields: functionDeclarationCommon,
});

defineType("TSDeclareMethod", {
  visitor: ["decorators", "key", "typeParameters", "params", "returnType"],
  fields: classMethodOrDeclareMethodCommon,
});

defineType("TSQualifiedName", {
  aliases: ["TSEntityName"],
  visitor: ["left", "right"],
  fields: {
    left: validateType("TSEntityName"),
    right: validateType("Identifier"),
  },
});

const signatureDeclarationCommon = {
  typeParameters: validateOptionalType("TypeParameterDeclaration"),
  parameters: validateArrayOfType(["Identifier", "RestElement"]),
  typeAnnotation: validateOptionalType("TypeAnnotation"),
};

const callConstructSignatureDeclaration = {
  aliases: ["TSTypeElement"],
  visitor: ["typeParameters", "parameters", "typeAnnotation"],
  fields: signatureDeclarationCommon,
};

defineType("TSCallSignatureDeclaration", callConstructSignatureDeclaration);
defineType(
  "TSConstructSignatureDeclaration",
  callConstructSignatureDeclaration,
);

const namedTypeElementCommon = {
  key: validateType("Expression"),
  computed: validate(bool),
  optional: validateOptional(bool),
};

defineType("TSPropertySignature", {
  aliases: ["TSTypeElement"],
  visitor: ["key", "typeAnnotation", "initializer"],
  fields: {
    ...namedTypeElementCommon,
    readonly: validateOptional(bool),
    typeAnnotation: validateOptionalType("TypeAnnotation"),
    initializer: validateOptionalType("Expresssion"),
  },
});

defineType("TSMethodSignature", {
  aliases: ["TSTypeElement"],
  visitor: ["key", "typeParameters", "parameters", "typeAnnotation"],
  fields: {
    ...signatureDeclarationCommon,
    ...namedTypeElementCommon,
  },
});

defineType("TSIndexSignature", {
  aliases: ["TSTypeElement"],
  visitor: ["parameters", "typeAnnotation"],
  fields: {
    readonly: validateOptional(bool),
    parameters: validateArrayOfType("Identifier"), // Length must be 1
    typeAnnotation: validateOptionalType("TypeAnnotation"),
  },
});

const tsKeywordTypes = [
  "TSAnyKeyword",
  "TSNumberKeyword",
  "TSObjectKeyword",
  "TSBooleanKeyword",
  "TSStringKeyword",
  "TSSymbolKeyword",
  "TSVoidKeyword",
  "TSUndefinedKeyword",
  "TSNullKeyword",
  "TSNeverKeyword",
];

for (const type of tsKeywordTypes) {
  defineType(type, {
    aliases: ["TSType"],
    visitor: [],
    fields: {},
  });
}

defineType("TSThisType", {
  aliases: ["TSType"],
  visitor: [],
  fields: {},
});

const fnOrCtr = {
  aliases: ["TSType"],
  visitor: ["typeParameters", "typeAnnotation"],
  fields: signatureDeclarationCommon,
};

defineType("TSFunctionType", fnOrCtr);
defineType("TSConstructorType", fnOrCtr);

defineType("TSTypeReference", {
  aliases: ["TSType"],
  visitor: ["typeName", "typeParameters"],
  fields: {
    typeName: validateType("TSEntityName"),
    typeParameters: validateOptionalType("TypeParameterInstantiation"),
  },
});

defineType("TSTypePredicate", {
  aliases: ["TSType"],
  visitor: ["parameterName", "typeAnnotation"],
  fields: {
    parameterName: validateType(["Identifier", "TSThisType"]),
    typeAnnotation: validateType("TypeAnnotation"),
  },
});

defineType("TSTypeQuery", {
  aliases: ["TSType"],
  visitor: ["exprName"],
  fields: {
    exprName: validateType("TSEntityName"),
  },
});

defineType("TSTypeLiteral", {
  aliases: ["TSType"],
  visitor: ["members"],
  fields: {
    members: validateArrayOfType("TSTypeElement"),
  },
});

defineType("TSArrayType", {
  aliases: ["TSType"],
  visitor: ["elementType"],
  fields: {
    elementType: validateType("TSType"),
  },
});

defineType("TSTupleType", {
  aliases: ["TSType"],
  visitor: ["elementTypes"],
  fields: {
    elementTypes: validateArrayOfType("TSType"),
  },
});

const unionOrIntersection = {
  aliases: ["TSType"],
  visitor: ["types"],
  fields: {
    types: validateArrayOfType("TSType"),
  },
};

defineType("TSUnionType", unionOrIntersection);
defineType("TSIntersectionType", unionOrIntersection);

defineType("TSParenthesizedType", {
  aliases: ["TSType"],
  visitor: ["typeAnnotation"],
  fields: {
    typeAnnotation: validateType("TSType"),
  },
});

defineType("TSTypeOperator", {
  aliases: ["TSType"],
  visitor: ["typeAnnotation"],
  fields: {
    operator: validate(assertValueType("string")),
    typeAnnotation: validateType("TSType"),
  },
});

defineType("TSIndexedAccessType", {
  aliases: ["TSType"],
  visitor: ["objectType", "indexType"],
  fields: {
    objectType: validateType("TSType"),
    indexType: validateType("TSType"),
  },
});

defineType("TSMappedType", {
  aliases: ["TSType"],
  visitor: ["typeParameter", "typeAnnotation"],
  fields: {
    readonly: validateOptional(bool),
    typeParameter: validateType("TypeParameter"),
    optional: validateOptional(bool),
    typeAnnotation: validateOptionalType("TSType"),
  },
});

defineType("TSLiteralType", {
  aliases: ["TSType"],
  visitor: ["literal"],
  fields: {
    literal: validateType([
      "NumericLiteral",
      "StringLiteral",
      "BooleanLiteral",
    ]),
  },
});

defineType("TSExpressionWithTypeArguments", {
  aliases: ["TSType"],
  visitor: ["expression", "typeParameters"],
  fields: {
    expression: validateType("TSEntityName"),
    typeParameters: validateOptionalType("TypeParameterInstantiation"),
  },
});

defineType("TSInterfaceDeclaration", {
  // "Statement" alias prevents a semicolon from appearing after it in an export declaration.
  aliases: ["Statement", "Declaration"],
  visitor: ["id", "typeParameters", "extends", "body"],
  fields: {
    declare: validateOptional(bool),
    id: validateType("Identifier"),
    typeParameters: validateOptionalType("TypeParameterDeclaration"),
    extends: validateOptional(arrayOfType("TSExpressionWithTypeArguments")),
    body: validateType("TSInterfaceBody"),
  },
});

defineType("TSInterfaceBody", {
  visitor: ["body"],
  fields: {
    body: validateArrayOfType("TSTypeElement"),
  },
});

defineType("TSTypeAliasDeclaration", {
  aliases: ["Statement", "Declaration"],
  visitor: ["id", "typeParameters", "typeAnnotation"],
  fields: {
    declare: validateOptional(bool),
    id: validateType("Identifier"),
    typeParameters: validateOptionalType("TypeParameterDeclaration"),
    typeAnnotation: validateType("TSType"),
  },
});

defineType("TSAsExpression", {
  aliases: ["Expression"],
  visitor: ["expression", "typeAnnotation"],
  fields: {
    expression: validateType("Expression"),
    typeAnnotation: validateType("TSType"),
  },
});

defineType("TSTypeAssertion", {
  aliases: ["Expression"],
  visitor: ["typeAnnotation", "expression"],
  fields: {
    typeAnnotation: validateType("TSType"),
    expression: validateType("Expression"),
  },
});

defineType("TSEnumDeclaration", {
  // "Statement" alias prevents a semicolon from appearing after it in an export declaration.
  aliases: ["Statement", "Declaration"],
  visitor: ["id", "members"],
  fields: {
    declare: validateOptional(bool),
    const: validateOptional(bool),
    id: validateType("Identifier"),
    members: validateArrayOfType("TSEnumMember"),
    initializer: validateOptionalType("Expression"),
  },
});

defineType("TSEnumMember", {
  visitor: ["id", "initializer"],
  fields: {
    id: validateType(["Identifier", "StringLiteral"]),
    initializer: validateOptionalType("Expression"),
  },
});

defineType("TSModuleDeclaration", {
  aliases: ["Statement", "Declaration"],
  visitor: ["id", "body"],
  fields: {
    declare: validateOptional(bool),
    global: validateOptional(bool),
    id: validateType(["Identifier", "StringLiteral"]),
    body: validateType(["TSModuleBlock", "TSModuleDeclaration"]),
  },
});

defineType("TSModuleBlock", {
  visitor: ["body"],
  fields: {
    body: validateArrayOfType("Statement"),
  },
});

defineType("TSImportEqualsDeclaration", {
  aliases: ["Statement"],
  visitor: ["id", "moduleReference"],
  fields: {
    isExport: validate(bool),
    id: validateType("Identifier"),
    moduleReference: validateType([
      "TSEntityName",
      "TSExternalModuleReference",
    ]),
  },
});

defineType("TSExternalModuleReference", {
  visitor: ["expression"],
  fields: {
    expression: validateType("StringLiteral"),
  },
});

defineType("TSNonNullExpression", {
  aliases: ["Expression"],
  visitor: ["expression"],
  fields: {
    expression: validateType("Expression"),
  },
});

defineType("TSExportAssignment", {
  aliases: ["Statement"],
  visitor: ["expression"],
  fields: {
    expression: validateType("Expression"),
  },
});

defineType("TSNamespaceExportDeclaration", {
  aliases: ["Statement"],
  visitor: ["id"],
  fields: {
    id: validateType("Identifier"),
  },
});
