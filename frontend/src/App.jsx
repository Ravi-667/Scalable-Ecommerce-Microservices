import React from 'react'

export default function App() {
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    fetch('/api')
      .then((r) => r.json())
      .then((d) => setMessage(d.message))
      .catch(() => setMessage('Backend not reachable'))
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>Scalable E-Commerce (frontend scaffold)</h1>
      <p>Backend status: {message}</p>
    </div>
  )
}
