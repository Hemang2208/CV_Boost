import { useState } from 'react'
import './App.css'

function App() {
  const l = ["Home", "Features","Pricing", "Contact"];

  return (
    <>
      <nav>
        <ul>
          {
            l.map((items,index)=>(
              <li key={index}>{items}</li>
            ))
          }
        </ul>
      </nav>
    </>
  )
}

export default App
