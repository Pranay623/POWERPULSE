import React from 'react'
import bg from '../Starter/assests/4x/back.mp4'
import '../Starter/Starter.css'
import name from '../Starter/assests/name.svg'
import outf from '../Starter/assests/4x/forest@4x.png'
import outfp from '../Starter/assests/4x/forest path@4x.png'
import outim from '../Starter/assests/4x/inner mountain@4x.png'
import outmm from '../Starter/assests/4x/middle mountain@4x.png'
import outom from '../Starter/assests/4x/outer mountain@4x.png'




const Starter = () => {
  return (
    <div className='main'>
        <video autoPlay loop muted className='bg-video'>
        <source src={bg} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
        <div className='name'>
        <img src={name} className='bg-name'></img>
        
        </div>
        <div class="bg">
          <img src={outim} className='bg-in-m'></img>        
          <img src={outmm} className='bg-m-m'></img>
          <img src={outom} className='bg-out-m'></img>
          <img src={outfp} className='bg-forest-path'></img>
          <img src={outf} className='bg-forest'></img>
          
        </div>
        <div className='button'>
          <a href='/sign'>
            <span>LET'S GO</span>
            <div className='wave'></div>
          </a>
        </div>
        
    </div>
  )
}

export default Starter