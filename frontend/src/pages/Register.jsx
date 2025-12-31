import React from 'react'
import { auth } from '../services/api'

export default function Register() {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const submit = async (e) => {
    e.preventDefault()
    try {
      const r = await auth.register({ name, email, password })
      localStorage.setItem('token', r.token)
      alert('Registered')
      window.location.href = '/'
    } catch (err) {
      alert('Registration failed')
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Register</h2>
      <div>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button>Register</button>
    </form>
  )
}
