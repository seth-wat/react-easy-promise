# React Easy Promise

- [x] Reduces the overhead of working with promises
- [x] Prevents race conditions
- [x] Keeps it simple

`npm install react-easy-promise`

### How it works:

```javascript
import { usePromise } from 'react-easy-promise'
import { useEffect } from 'react'

const fetchColors = () =>
  new Promise(resolve => {
    setTimeout(() => resolve(['red', 'yellow', 'blue']), 3000)
  })

const ColorDisplay = () => {
  const { request, loading, error, result } = usePromise(fetchColors)

  useEffect(() => {
    request()
  }, [])

  if (loading) {
    return <div>... loading</div>
  }

  if (error) {
    return <div>... error</div>
  }

  if (result) {
    return (
      <div>
        {result.map(color => (
          <p key={color}>{color}</p>
        ))}
      </div>
    )
  }

  return null
}

export default ColorDisplay
```

### Callbacks:

```javascript
import { usePromise } from 'react-easy-promise'

const fetchColors = shouldResolve =>
  shouldResolve
    ? new Promise(resolve => {
        setTimeout(() => resolve(['red', 'yellow', 'blue']), 1000)
      })
    : new Promise((_, reject) => {
        setTimeout(() => reject('system error'), 1000)
      })

const ColorDisplay = () => {
  const { request, loading } = usePromise(fetchColors, {
    onSuccess: r => window.alert(r),
    onError: e => window.alert(e),
  })

  return (
    <div>
      {loading && <p>... loading</p>}
      <button onClick={() => request(true)}>Succeed</button>
      <button onClick={() => request(false)}>Fail</button>
    </div>
  )
}

export default ColorDisplay
```

### Race Conditions:

```javascript
import { usePromise } from 'react-easy-promise'
import { useEffect } from 'react'

const fetchColors = (delay, colors) =>
  new Promise(resolve => {
    setTimeout(() => resolve(colors), delay)
  })

const ColorDisplay = () => {
  const { request, loading, result } = usePromise(fetchColors)

  useEffect(() => {
    setTimeout(() => {
      request(2000, ['red'])
    }, 1)
    setTimeout(() => {
      request(500, ['yellow'])
    }, 2)
    setTimeout(() => {
      request(100, ['blue'])
    }, 3)
    /*
    expect to see blue in the UI
    despite being the first resolved promise, it is the last initiated
     */
  }, [])

  return (
    <div>
      {loading && <p>... loading</p>}
      {result}
    </div>
  )
}

export default ColorDisplay
```

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
