import React from 'react'
import { cart } from '../services/api'

export default function Cart() {
  const [c, setC] = React.useState({ items: [] })

  const load = () => cart.get().then((r) => setC(r)).catch(() => setC({ items: [] }))
  React.useEffect(() => { load() }, [])

  const remove = async (itemId) => {
    await cart.removeItem(itemId)
    load()
  }

  return (
    <div>
      <h2>Your Cart</h2>
      <ul>
        {c.items && c.items.length ? c.items.map((it) => (
          <li key={it._id} style={{ margin: 12 }}>
            <div>{it.product.title} x {it.quantity}</div>
            <div>${it.price}</div>
            <button onClick={() => remove(it._id)}>Remove</button>
          </li>
        )) : <li>Cart empty</li>}
      </ul>
    </div>
  )
}
