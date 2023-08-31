export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeObjects(target, source) {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeObjects(target[key], source[key]);
      } else if (Array.isArray(source[key])) {
        output[key] = [ ...target[key], ...source[key] ]
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}
