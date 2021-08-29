const { renderHook, act } = require('@testing-library/react-hooks')
import usePromise from './usePromise'

test('onSuccess is called with the resolved value', async () => {
  const onSuccess = jest.fn()
  const onError = jest.fn()
  const parseResult = jest
    .fn()
    .mockImplementation(result => result.replace('s', 'd'))
  const parseError = jest.fn()
  const promise = new Promise(resolve => {
    setTimeout(() => {
      resolve('success')
    }, 1)
  })
  const { result } = renderHook(() =>
    usePromise(() => promise, { onSuccess, parseResult, onError, parseError })
  )

  await act(async () => result.current.request())

  expect(parseResult).toHaveBeenCalledWith('success')
  expect(onSuccess).toHaveBeenCalledWith('duccess')
  expect(result.current.result).toEqual('duccess')
  expect(parseError).not.toHaveBeenCalled()
  expect(onError).not.toHaveBeenCalled()
})

test('onError is called with the rejected value', async () => {
  const onError = jest.fn()
  const onSuccess = jest.fn()
  const parseError = jest
    .fn()
    .mockImplementation(result => result.replace('r', 'd'))
  const parseResult = jest.fn()

  const promise = new Promise((_, reject) => {
    setTimeout(() => {
      reject('rejected')
    }, 1)
  })
  const { result } = renderHook(() =>
    usePromise(() => promise, {
      onSuccess,
      onError,
      parseResult,
      parseError,
    })
  )

  await act(async () => result.current.request())

  expect(parseError).toHaveBeenCalledWith('rejected')
  expect(onError).toHaveBeenCalledWith('dejected')
  expect(result.current.error).toEqual('dejected')
  expect(parseResult).not.toHaveBeenCalled()
  expect(onSuccess).not.toHaveBeenCalled()
})

test('result is the value of the resolved promise', async () => {
  const promise = new Promise(resolve => {
    setTimeout(() => {
      resolve('success')
    }, 1)
  })
  const { result } = renderHook(() => usePromise(() => promise, {}))

  await act(async () => result.current.request())

  expect(result.current.result).toEqual('success')
  expect(result.current.error).toEqual(undefined)
})

test('error is the value of the rejected promise', async () => {
  const promise = new Promise((_, reject) => {
    setTimeout(() => {
      reject('error')
    }, 1)
  })
  const { result } = renderHook(() => usePromise(() => promise, {}))

  await act(async () => result.current.request())

  expect(result.current.error).toEqual('error')
  expect(result.current.result).toEqual(undefined)
})

test('loading is false', async () => {
  const promise = new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 1)
  })
  const { result } = renderHook(() => usePromise(() => promise, {}))
  expect(result.current.loading).toBeFalsy()
  await act(async () => result.current.request())
  expect(result.current.loading).toBeFalsy()
})
