import React from 'react'

const HUD = ({companyId,branchId}) => {

 
  return (
    <div style={{display:'flex',justifyContent:'space-between', backgroundColor:'#fef301',position:'fixed',width:'100vw',zIndex:'1'}}>
        <img src="./logo.png" width={'70px'} alt="" />
        <div >
            {/* <div style={{margin:'10px'}}>
                <p>Health</p>
                <div style={{height:'10px',width:'125px',backgroundColor:'green',borderRadius:'20px'}}></div>
                
            </div> */}
            <p style={{fontWeight:'200',fontSize:'12px',paddingRight:'20px',color:'#a78f08'}}>{companyId} , {branchId}</p>
        </div></div>
  )
}

export default HUD
