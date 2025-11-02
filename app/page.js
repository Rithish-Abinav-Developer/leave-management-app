"use client"
import React, { useEffect } from 'react';
import Image from "next/image";
import logo from "@/app/src/logo.png"; 
import Link from 'next/link';
import { useRouter } from "next/navigation";


export default function page() {

  const router = useRouter();

  useEffect(()=>{
    const token = localStorage.getItem('user');
    if(token){
      router.push('/home');
    }
  },[])


  return (
    <div className='entry_page'>

<div className='entry_page_banner'>
  <div className='logo_container'>
<Image className='logo' src={logo} alt='logo' width={120} height={54} />
</div>
</div>

<div className='entry_page_content'>
<p className='welcome_text'>Hey, you're back!<br/>
Time to plan some quality time off!</p>

<Link href='/login' className='common_btn'>
 Let’s go!
</Link>

</div>

<div className='entry_page_footer'>
<ul>
  <li>Version 1.0.0 </li>
           <li>Developed by Rithish</li>
  <li>Help & Support</li>
</ul>
</div>




    </div>
  )
}
