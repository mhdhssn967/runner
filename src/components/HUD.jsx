import React from 'react'

const HUD = ({score}) => {
  return (
    <div style={{display:'flex',justifyContent:'space-between', backgroundColor:'#fef301',position:'fixed',width:'100vw',zIndex:'1'}}>
        <img src="./logo.png" width={'70px'} alt="" />
        <div style={{display:'flex',alignItems:'center',gap:'10px',paddingRight:'20px'}}>
            <h2>Score {score}</h2>
            {/* <div style={{margin:'10px'}}>
                <p>Health</p>
                <div style={{height:'10px',width:'125px',backgroundColor:'green',borderRadius:'20px'}}></div>
                
            </div> */}
        </div></div>
  )
}

export default HUD
