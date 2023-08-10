const mime = require('mime');

const additionalTypes = [
  {'text/plain': ['simc']},
]

mime.define(...additionalTypes)

export function getType(type) {
  return mime.getType(type);
}
