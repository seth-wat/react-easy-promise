import { useEffect, useMemo, useState } from 'react'

const usePromise = (promise, effects = {}) => {
  const [executed, setExecuted] = useState([])

  const { onSuccess, onError, parseResult, parseError } = effects

  const status = useMemo(() => {
    const finished = executed.filter(exec => exec.end)
    return executed.length > finished.length
      ? { loading: true }
      : [...finished].sort(exec => exec.start).reverse()[0] || {}
  }, [executed, onSuccess, onError])

  useEffect(() => {
    if (executed.length > 1 && executed.every(exec => exec.end)) {
      const mostRecent = [...executed].sort(exec => exec.start).reverse()[0]
      setExecuted([mostRecent])
    }
  }, [executed])

  const request = async (...params) => {
    const start = Date.now()
    setExecuted(prev => [...prev, { start }])
    try {
      const res = await promise(...params)
      const result = (await parseResult?.(res)) ?? res
      await onSuccess?.(result)
      setExecuted(prev =>
        prev.reduce((next, exec) => {
          exec.start === start
            ? next.push({
                ...exec,
                end: Date.now(),
                result,
              })
            : next.push(exec)
          return next
        }, [])
      )
    } catch (e) {
      const error = (await parseError?.(e)) ?? e
      await onError?.(error)
      setExecuted(prev =>
        prev.reduce((next, exec) => {
          exec.start === start
            ? next.push({
                ...exec,
                end: Date.now(),
                error,
              })
            : next.push(exec)
          return next
        }, [])
      )
    }
  }

  return {
    request,
    ...status,
  }
}

export default usePromise
