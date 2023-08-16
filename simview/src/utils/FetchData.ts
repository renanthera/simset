export function fetchJSON(...args) {
  const JSONPayload = fetch(...args).then( (res) => res.json() );

  return JSONPayload;
}
