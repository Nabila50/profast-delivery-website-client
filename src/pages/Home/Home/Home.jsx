import React from 'react'
import Banner from '../Banner/Banner';
import OurServices from '../Services/Services';
import Benefits from '../../Benefits/Benefits';
import BeMerchant from '../BeMerchant/BeMerchant';
import HomeAccordian from '../Accordian/HomeAccordian';


export default function Home() {
  return (
    <div>
         <Banner></Banner>
        <OurServices></OurServices>
        {/* <ClientLogoMarquee></ClientLogoMarquee> */}
        {/* <LogoSwiper></LogoSwiper> */}
        {/* <ClientLogoMarquee></ClientLogoMarquee> */}
      
        <Benefits></Benefits>
        <BeMerchant></BeMerchant>
        <HomeAccordian></HomeAccordian>
    </div>
  )
}
