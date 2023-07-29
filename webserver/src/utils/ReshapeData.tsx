import fsPromises from 'fs/promises';
import path from 'path'

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

export async function getLocalData() {
  const filePath = path.join(process.cwd(), 'data', 'zzzzzzzzzzzzzzz', '4', 'output.json');
  const jsonData = await fsPromises.readFile(filePath);
  const objectData = JSON.parse(jsonData);
  return objectData;
}
