import React, { useEffect, useState } from 'react'
import { fetchPlayerScore } from '../services/services'

const HUD = ({companyId,branchId, playerName}) => {

    const [highScore,setHighScore]=useState(null)

    useEffect(()=>{
        const fetchHighScore=async()=>{
           const score = await fetchPlayerScore(companyId)
            setHighScore(score)
        };fetchHighScore()
    },[])

 
  return (
    <div className='hud'>
       
        <img src="./logo.png" width={'70px'} alt="" />
         <div>
            <p>{playerName}</p>
            {highScore&&<p className='hc'>High Score :{highScore}</p>}
         </div>
        <div >
            {/* <div style={{margin:'10px'}}>
                <p>Health</p>
                <div style={{height:'10px',width:'125px',backgroundColor:'green',borderRadius:'20px'}}></div>
                
            </div> */}
            {/* <p style={{fontWeight:'200',fontSize:'12px',paddingRight:'20px',color:'#a78f08'}}>{companyId} , {branchId}</p> */}
        </div></div>
  )
}

export default HUD
