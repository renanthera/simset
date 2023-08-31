import {
  useState,
  useRef,
  useCallback,
  useEffect
} from 'react'

export const useResizeObserver = () => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const resizeObserver = useRef(null)

  const onResize = useCallback(e => {
    console.log(e[0])
    const { width, height } = e[0].contentRect
    setSize({ width, height })
  }, [])

  const ref = useCallback(n => {
    if (n) {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect()
      }
      resizeObserver.current = new ResizeObserver(onResize)
      resizeObserver.current.observe(n)
    }
  }, [onResize])

  useEffect(() => () => {
    resizeObserver.current.disconnect()
  }, [])

  // console.log(ref, size)
  return { ref, ...size }
}
