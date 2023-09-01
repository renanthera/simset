import {
  useRef,
  useEffect
} from 'react'

const resizeCanvas = (canvas) => {
  const { width, height } = canvas.getBoundingClientRect()

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
    return true
  }
  return false
}

export const useCanvas = (draw) => {
  const ref = useRef(null)

  useEffect( () => {
    const canvas = ref.current
    const context = canvas.getContext('2d')

    draw(context)
  }, [draw])

  return ref
}
