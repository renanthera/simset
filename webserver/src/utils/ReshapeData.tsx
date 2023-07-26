export function ReshapeData_Options(data, chartOptions) {
  const len = data.length;
  const turbo = len >= chartOptions.turboThreshold || (len >= 1000 && !chartOptions.turboThreshold);

  if (turbo) {
    return data.map(d => [d.x, d.y]);
  }

  return data;
}

export function ReshapeData(data) {
  return data.map(d => [d.x, d.y]);
}
