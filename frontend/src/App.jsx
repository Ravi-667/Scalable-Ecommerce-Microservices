import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Home from './pages/Home'
import Products from './pages/Products'
import Product from './pages/Product'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Root redirect component - redirects based on auth status
function RootRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }
  
  return isSignedIn ? <Navigate to="/home" replace /> : <Navigate to="/sign-in" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect based on auth status */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Auth routes - no layout wrapper */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        
        {/* Public routes with layout */}
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/products/:id" element={<Layout><Product /></Layout>} />
        
        {/* Protected routes - require authentication */}
        <Route path="/cart" element={
          <Layout>
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/checkout" element={
          <Layout>
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/profile" element={
          <Layout>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/orders" element={
          <Layout>
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          </Layout>
        } />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
