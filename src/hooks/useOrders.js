import { useState, useEffect } from 'react'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Load orders and metadata in parallel
        const [ordersRes, metadataRes] = await Promise.all([
          fetch('/data/orders.json'),
          fetch('/data/metadata.json')
        ])

        if (!ordersRes.ok || !metadataRes.ok) {
          throw new Error('Failed to load data')
        }

        const [ordersData, metadataData] = await Promise.all([
          ordersRes.json(),
          metadataRes.json()
        ])

        setOrders(ordersData)
        setMetadata(metadataData)
        setError(null)
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return { orders, metadata, loading, error }
}
