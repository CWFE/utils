import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'

const App = () => {
  useEffect(() => {
  }, [])

  return (
    <div style={{ width: '100%', height: '200px', backgroundColor: 'red' }} />
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
