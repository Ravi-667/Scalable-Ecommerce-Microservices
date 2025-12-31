import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import Product from './pages/Product'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'

function Header() {
  const token = localStorage.getItem('token')
  return (
    <header style={{ padding: 12, borderBottom: '1px solid #eee' }}>
      <Link to="/">Home</Link> | <Link to="/products">Products</Link> | <Link to="/cart">Cart</Link> | {token ? <Link to="/checkout">Checkout</Link> : <Link to="/login">Login</Link>}
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <div style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<Product />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
