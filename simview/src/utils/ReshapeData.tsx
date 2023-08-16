export function ExtractChartDataFromJSON(json) {
  return json.content.sim.profilesets.results.map( ({name, mean, iterations}) => {
    return {name: name, y: mean, iterations: iterations, x: Math.random()}
  });
}
