import React from 'react'

const TestApp = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>Test App Loading</h1>
      <p>If you can see this, React is working properly.</p>
      <button onClick={() => alert('Button clicked!')}>Test Button</button>
    </div>
  )
}

export default TestApp
