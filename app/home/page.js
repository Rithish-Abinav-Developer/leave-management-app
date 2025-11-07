"use client";
import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import profile from "@/app/src/profile.png";
import rightArrow from "@/app/src/right-arrow.svg";
import Link from "next/link";
import casualLeaveIcon from "@/app/src/cl-icon.svg";
import sickLeaveIcon from "@/app/src/sl-icon.svg";
import marriageLeaveIcon from "@/app/src/mrl-icon.svg";
import maternityLeaveIcon from "@/app/src/m-icon.svg";
import leaveProfile from "@/app/src/leave-profile.svg";
import leaveCasual from "@/app/src/cli.svg";
import leaveSick from "@/app/src/sli.svg";
import leaveMarriage from "@/app/src/mri.svg";
import leaveMaternity from "@/app/src/mi.svg";
import PartyImage from '@/app/src/party-gif.webp'
import Loader from "../components/Loader";
import EditProfile from "@/app/src/edit.svg";
import TimeIcon from "@/app/src/time-icon.svg";
import PermissionIcon from "@/app/src/permissionIcon.svg";


export default function Page() {

  const[profilePic,setProfileImage] = useState("");
    const [showFullList, setShowFullList] = useState(false);
    const [loading, setLoading] = useState(false);

     const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  // console.log(file)
  if (!file) return;

  try {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.name; 

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", userName); 

    const res = await axios.post("/api/upload/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    localStorage.setItem("user", JSON.stringify({ ...user, profileImage: res.data.url }));
    setProfileImage(res.data.url);
    setLoading(false);
  } catch (err) {
    console.error("❌ Upload failed:", err);
    setLoading(false);
  }
};



 useEffect(()=>{
  const user = JSON.parse(localStorage.getItem("user"));
  if(user?.profileImage){
    // console.log(user?.profileImage)
    setProfileImage(user.profileImage);
  }
},[])


  
  const { data:user, isLoading:userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
        const res = localStorage.getItem("user");
        return res ? JSON.parse(res) : null;
  
    },
  });

const { data: Application, isLoading: applicationLoading } = useQuery({
  queryKey: ["application", user?.name],
  queryFn: async () => {
    const res = await axios.get(`/api/applications/${user.name}`);
    return res.data.userApplications;
  },
  enabled: !!user, 
});

const casualLeave = Application?.filter(item => item.leaveType === "Casual Leave" && item.status === "Approved") || [];
const sickLeave = Application?.filter(item => item.leaveType === "Sick Leave" && item.status === "Approved") || [];
const marriageLeave = Application?.filter(item => item.leaveType === "Marriage Leave" && item.status === "Approved") || [];
const maternityLeave = Application?.filter(item => item.leaveType === "Maternity Leave" && item.status === "Approved") || [];
const permission = Application?.filter(item => item.type === "Permission" && item.status === "Approved" ) || 0;


const {data:TodayLeave, isLoading:todayLeaveLoading} = useQuery({
  queryKey: ["todayLeave"],
  queryFn: async () => {
    const res = await axios.get(`/api/applications/leave-today/${user.name}`);
    console.log(res.data.applications);
    return res.data.applications;
  },
});


const {data:RecentLeave, isLoading:recentLeaveLoading} = useQuery({
  queryKey: ["recentLeave"],
  queryFn: async () => {
    const res = await axios.get(`/api/applications/${user.name}`);
    // console.log(res.data.userApplications);
    return res.data.userApplications;
  },
});

  // if (userLoading) return <p>Loading...</p>;

  return (
    <div className="apply_page">
      {userLoading &&  <Loader/> }
      {loading || todayLeaveLoading || recentLeaveLoading &&  <Loader/> }
     
      <Header pageTitle="Home" />

      <div className="home_banner entry_page_banner">
        <div className="profile_img">
          
   
        <Image src={EditProfile} alt="edit-profile" width={24} height={24} loading="eager" id="edit_profile"  onClick={handleImageClick}/>
         <input type="file" accept="image/*" name="profileImage"  ref={fileInputRef} onChange={handleFileChange} style={{display:"none"}}  />
   
     
        <Image src={profilePic || profile} alt="profile" width={75} height={75} loading="eager" />
        </div>
        <p>Welcome Back</p>
        <h1>{user?.name || "loading"}</h1>
      </div>

      <div className="container">

{user?.role==="employee" && (
<>
        <div className="top_sec">
            <h3>Dashboard</h3>
            <Link href="/apply-status/employee">
            Leave History
            <Image src={rightArrow} alt="right-arrow" width={16} height={16} />
            </Link>
        </div>

<div className="dashboard_cards">

    <div className="card">
        <div>
<Image src={casualLeaveIcon} alt="casual-leave-icon" width={35} height={35} />
<span>
    <p className={`${casualLeave?.length> 12 ? "warning" : ""}`}>{casualLeave?.length || 0}</p>/<p>12</p>
</span>
        </div>
        <p>Casual Leave</p>
    </div>

     <div className="card">
        <div>
<Image src={sickLeaveIcon} alt="sick-leave-icon" width={35} height={35} />
<span>
    <p className={`${sickLeave?.length > 12 ? "warning" : ""}`}>{sickLeave?.length || 0}</p>/<p>12</p>
</span>
        </div>
        <p>Sick Leave</p>
    </div>

         <div className="card">
        <div>
<Image src={PermissionIcon} alt="permission-icon" width={35} height={35} />
<span>
    <p className={`${permission?.length > 2 ? "warning" : ""}`}>{permission?.length || 0}</p>/<p>02</p>
</span>
        </div>
        <p>Permissions</p>
    </div>

     {/* <div className="card">
        <div>
<Image src={maternityLeaveIcon} alt="casual-leave-icon" width={35} height={35} />
<span>
    <p>{maternityLeave?.length || 0}</p>/<p>05</p>
</span>
        </div>
        <p>Maternity Leave</p>
    </div> */}



</div>
</>
)}


 <div className="top_sec">
            <h3>Colleague’s on leave today</h3>
            {TodayLeave && TodayLeave.length > 2 && (
            <button onClick={() => setShowFullList(prev => !prev)}>
           {showFullList ? "Show Less" : "Full List"}
            <Image src={rightArrow} alt="right-arrow" width={16} height={16} />
            </button>
            )}
        </div>

      <div className={`leave_profiles ${showFullList ? "full_list" : ""}`}>
  {TodayLeave && TodayLeave.length > 0 ? (
    TodayLeave.map((item) => (
      <div className="profile" key={item._id}>
        <Image
          src={item.profileImage?item.profileImage: leaveProfile}
          alt="profile"
          width={40}
          height={40}
          loading="eager"
        />
        <div>
          <h4>{item.name}</h4>
          <p>
            <Image
              src={
                item.leaveType === "Casual Leave"
                  ? leaveCasual
                  : item.leaveType === "Sick Leave"
                  ? leaveSick
                  : item.leaveType === "Marriage Leave"
                  ? leaveMarriage
                  : leaveMaternity
              }
              alt={`${item.leaveType}-icon`}
              width={16}
              height={16}
            />{" "}
            {/* {new Date(item.date).toLocaleDateString("en-GB")} */}
            {item.division}
          </p>
        </div>
      </div>
    ))
  ) : (
    <p className="txts">No colleagues on leave today</p>
  )}
</div>


        <div className="announcements">
            <h4>Announcement & News</h4>
            <p>We're celebrating the Festival of Lights tomorrow from 3:00 PM to 4:00 PM in the cafeteria. Join us for sweets, music, and fun activities!</p>
        </div>

         <div className="top_sec">
            <h3>Your Recent Leaves</h3>
            <Link href="/apply-status/employee">
          See more
            <Image src={rightArrow} alt="right-arrow" width={16} height={16} />
            </Link>
        </div>

        <div className="recent_leaves">
{RecentLeave && RecentLeave.length > 0 ? (
  RecentLeave.slice(0, 3).map(item => (
    <div
      className={`leave ${
        item.status === "Approved"
          ? "approved"
          : item.status === "Rejected"
          ? "rejected"
          : "pending"
      }`}
      key={item._id}
    >
      <Image
        src={
          item.leaveType === "Casual Leave"
            ? leaveCasual
            : item.leaveType === "Sick Leave"
            ? leaveSick
            : item.leaveType === "Marriage Leave"
            ? leaveMarriage
            : item.leaveType === "Maternity Leave"
            ? leaveMaternity
            : TimeIcon
        }
        alt="casual-leave-icon"
        width={16}
        height={16}
      />
      <div>
        <h5>{item.type==="Leave"?item.leaveType:`Permission for ${item.hours==="0.5"?"half an":item.hours} hr`}</h5>
        {item.toDate ? (
          <p className="date">
            {`${new Date(item.date).toLocaleDateString("en-GB")}`} to{" "}
            {`${new Date(item.toDate).toLocaleDateString("en-GB")}`}
          </p>
        ) : (
          <p className="date">
            {`${new Date(item.date).toLocaleDateString("en-GB")} - ${item.time}`}
          </p>
        )}
        <p className="reason">{item.reason}</p>
      </div>
    </div>
  ))
) : (
  <p className="txts">No recent leaves</p>
)}

         
                 
        </div>

        <div className="party">
            <p>“Ride the waves of work and leisure, and surf <br/>your way to blissful balance”</p>
 <Image
    src={PartyImage}
    alt="party-image"
    width={0}
    height={0}
    sizes="100vw"
    style={{ width: "100%", height: "auto" }}
  />        </div>

      </div>

      <Footer />
    </div>
  );
}
