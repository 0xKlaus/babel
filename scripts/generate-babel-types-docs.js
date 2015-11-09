'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');

var types = require('../packages/babel-types');

var readmePath = path.join(__dirname, '..', 'packages', 'babel-types', 'README.md');
var readmeSrc = fs.readFileSync(readmePath, 'utf8');
var readme = [
  readmeSrc.split('<!-- begin generated section -->')[0].trim(),
  '',
  '<!-- begin generated section -->',
  ''
];

var customTypes = {
  ClassMethod: {
    key: 'if computed then `Expression` else `Identifier | Literal`',
  },
  Identifier: {
    name: '`string`',
  },
  MemberExpression: {
    property: 'if computed then `Expression` else `Identifier`',
  },
  ObjectMethod: {
    key: 'if computed then `Expression` else `Identifier | Literal`',
  },
  ObjectProperty: {
    key: 'if computed then `Expression` else `Identifier | Literal`',
  },
};
function getType(validator) {
  if (validator.type) {
    return validator.type;
  } else if (validator.oneOfNodeTypes) {
    return validator.oneOfNodeTypes.join(' | ');
  } else if (validator.chainOf) {
    if (
      validator.chainOf.length === 2 &&
      validator.chainOf[0].type === 'array' &&
      validator.chainOf[1].each
    ) {
      return 'Array<' + getType(validator.chainOf[1].each) + '>';
    }
    if (
      validator.chainOf.length === 2 &&
      validator.chainOf[0].type === 'string' &&
      validator.chainOf[1].oneOf
    ) {
      return validator.chainOf[1].oneOf.map(function (val) {
        return JSON.stringify(val);
      }).join(' | ');
    }
  }
  var err = new Error('Unrecognised validator type');
  err.validator = validator;
  throw err;
}
Object.keys(types.BUILDER_KEYS).sort().forEach(function (key) {
  readme.push('### t.' + key[0].toLowerCase() + key.substr(1) + '(' + types.BUILDER_KEYS[key].join(', ') + ')');
  readme.push('');
  readme.push('See also `t.is' + key + '(node, opts)` and `t.assert' + key + '(node, opts)`.');
  readme.push('');
  if (types.ALIAS_KEYS[key] && types.ALIAS_KEYS[key].length) {
    readme.push('aliases ' + types.ALIAS_KEYS[key].map(function (key) {
      return '`' + key + '`';
    }).join(', '));
    readme.push('');
  }
  types.BUILDER_KEYS[key].forEach(function (field) {
    var defaultValue = types.NODE_FIELDS[key][field].default;
    var fieldDescription = ['`' + field + '`'];
    var validator = types.NODE_FIELDS[key][field].validate;
    if (customTypes[key] && customTypes[key][field]) {
      fieldDescription.push(customTypes[key][field]);
    } else if (validator) {
      try {
        fieldDescription.push(': `' + getType(validator) + '`');
      } catch (ex) {
        console.log(key);
        console.log(field);
        console.dir(validator, {depth: 10, colors: true});
      }
    }
    if (
      defaultValue !== null ||
      types.NODE_FIELDS[key][field].optional
    ) {
      fieldDescription.push(' (default: `' + util.inspect(defaultValue) + '`)');
    } else {
      fieldDescription.push(' (required)');
    }
    readme.push(' - ' + fieldDescription.join(''));
  });
  readme.push('');
});

readme.push(
  '',
  '<!-- end generated section -->',
  '',
  readmeSrc.split('<!-- end generated section -->')[1].trim()
);

fs.writeFileSync(readmePath, readme.join('\n'));
// console.log(readme.join('\n'));
