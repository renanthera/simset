export function GenerateNumbers(count) {
  var d : {x: number; y: number} = (k) => {
    return {x: Math.random(), y: Math.random()};
  }
  return [...Array(count)].map(d);
};
