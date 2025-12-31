import React from 'react'
import { cart, orders } from '../services/api'

export default function Checkout() {
  const [c, setC] = React.useState({ items: [] })
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState(null)

  const load = () => cart.get().then((r) => setC(r)).catch(() => setC({ items: [] }))
  React.useEffect(() => { load() }, [])

  const placeOrder = async () => {
    setLoading(true)
    try {
      const ord = await orders.place()
      setMessage('Order placed — ID: ' + (ord._id || ord.id))
      setC({ items: [] })
    } catch (err) {
      setMessage(err?.body?.error || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const total = (c.items || []).reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0)

  return (
    <div>
      <h2>Checkout</h2>
      {message && <div style={{ padding: 8, background: '#efe', marginBottom: 12 }}>{message}</div>}
      <ul>
        {c.items && c.items.length ? c.items.map((it) => (
          <li key={it._id} style={{ margin: 8 }}>
            {it.product?.title || 'Item'} — {it.quantity} × ${it.price}
          </li>
        )) : <li>Cart is empty</li>}
      </ul>
      <div style={{ marginTop: 12 }}>
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={placeOrder} disabled={loading || !c.items || c.items.length === 0}>{loading ? 'Placing...' : 'Place Order'}</button>
      </div>
    </div>
  )
}
