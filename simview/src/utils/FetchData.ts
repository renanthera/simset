export const fetcher = ([url, query]) => {
  // console.log(url, query)
  if (url && query) {
    return fetch(
      url,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(query)
      }
    ).then(res => res.json())
  }
}
