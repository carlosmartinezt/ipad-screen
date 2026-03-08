import { useState, useEffect } from 'react'

export function usePolling(url, intervalMs) {
  const [data, setData] = useState(null)

  useEffect(() => {
    let active = true
    const doFetch = async () => {
      try {
        const res = await fetch(url)
        const json = await res.json()
        if (active) setData(json)
      } catch (err) {
        console.error(`Polling ${url} failed:`, err)
      }
    }
    doFetch()
    const id = setInterval(doFetch, intervalMs)
    return () => { active = false; clearInterval(id) }
  }, [url, intervalMs])

  return data
}
