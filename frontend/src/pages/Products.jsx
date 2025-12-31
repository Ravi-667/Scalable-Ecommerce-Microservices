import React from 'react'
import { Link } from 'react-router-dom'
import { products } from '../services/api'

export default function Products() {
  const [items, setItems] = React.useState([])
  const [q, setQ] = React.useState('')

  React.useEffect(() => {
    products.list().then((r) => setItems(r.items || r.items === undefined ? r.items || r : r.items))
      .catch(() => setItems([]))
  }, [])

  return (
    <div>
      <h2>Products</h2>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" />
      <button onClick={() => products.list(q).then((r) => setItems(r.items || r))}>Search</button>
      <ul>
        {items && items.length ? items.map((p) => (
          <li key={p._id} style={{ margin: 12 }}>
            <Link to={`/products/${p._id}`}><strong>{p.title}</strong></Link>
            <div>{p.description}</div>
            <div>${p.price}</div>
          </li>
        )) : <li>No products</li>}
      </ul>
    </div>
  )
}
