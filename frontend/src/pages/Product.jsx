import React from 'react'
import { useParams } from 'react-router-dom'
import { products, cart } from '../services/api'

export default function Product() {
  const { id } = useParams()
  const [p, setP] = React.useState(null)

  React.useEffect(() => {
    products.get(id).then(setP).catch(() => setP(null))
  }, [id])

  if (!p) return <div>Loading...</div>

  const add = async () => {
    try {
      await cart.add({ productId: p._id, quantity: 1 })
      alert('Added to cart')
    } catch (err) {
      alert('Add failed: ' + (err.body?.error || err.status))
    }
  }

  return (
    <div>
      <h2>{p.title}</h2>
      <div>{p.description}</div>
      <div>${p.price}</div>
      <button onClick={add}>Add to cart</button>
    </div>
  )
}
