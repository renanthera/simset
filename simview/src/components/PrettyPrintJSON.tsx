export function PrettyPrintJSON({ data }) {
  if (data) {
    if (data.length > 0) {
      return (
        <>
          <div className="min-h-0 max-h-[90%] overflow-auto">
            <div>
              {data.length} sim{data.length > 1 ? 's' : ''} selected.
            </div>
            <pre>
              {data ? data.map(({ name }) => name + '\n') : ''}
            </pre>
            <pre>
              {data.length > 0 ? JSON.stringify(data, null, 2) : ''}
            </pre>
          </div>
        </>
      )
    }
  }
  return "No data selected."
}
