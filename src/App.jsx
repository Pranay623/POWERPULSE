import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Starter from './components/Starter/Starter'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className='body'>
      <Starter/>
      </div>
    </>
  )
}

export default App
