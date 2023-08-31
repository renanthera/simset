export function PrettyPrintJSON({data}) {
  if (data) {
    if (data.length > 0) {
      return (
        <>
          <div>
            {data.length} sim{data.length > 1 ? 's' : ''} selected.
          </div>
          <pre>
              {data ? data.map(({name}) => name + '\n') : ''}
            </pre>
          <pre>
              {data.length > 0 ? JSON.stringify(data, null, 2) : ''}
            </pre>
        </>
      )
    }
  }
  return "No data selected."
}
