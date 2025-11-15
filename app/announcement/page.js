"use client"
import axios from 'axios';
import React, { useState } from 'react'

export default function page() {

  const [announcementText, setAnnouncementText] = useState("");

  const handleSubmit = async (e) => {
    if(!announcementText){
      alert("Please write an announcement");
      return;
    }
    e.preventDefault();
    try{
      const res = await axios.put("/api/announcement", {
        announcementText,
      });
      if(res)
      alert("Announcement sent successfully");
      setAnnouncementText("");
    }
    catch(error){
      console.error(error);
      alert("Error sending announcement");
    }
  };

  return (
    <div>


<form onSubmit={handleSubmit}>
<textarea 
  placeholder='Write your announcement here...'
  value={announcementText}
  onChange={(e) => setAnnouncementText(e.target.value)}
/>
<button type='submit'>Send</button>
</form>

    </div>
  )
}
