"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import logo from "@/app/src/logo.png";
import settings from "@/app/src/setting.svg";
import notification from "@/app/src/notification.svg";
import Reload from "@/app/src/reload.svg";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Loader from "./Loader";

export default function Header({ currentNotificationCount,pageTitle }) {
  const [notificationNumber, setNotificationNumber] = useState(0);

  const[loading,setLoading] = useState(false);

  const reloadBtn = useRef(null);

  const[showLogout,setShowLogout] = useState(false);

  const notificationBtn = useRef(null);
 const router = useRouter();

  
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("No user found");
      return JSON.parse(storedUser);
    },
  });


  const {
    data: userData,
    isLoading: isUserDataLoading,
    refetch: refetchUserData,
  } = useQuery({
    queryKey: ["userData", user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/login/${user.id}`);
      setNotificationNumber(res.data.user.hasSeen ?? 0);
      return res.data.user;
    },
    enabled: false, 
    onSuccess: (data) => {
      setNotificationNumber(data.hasSeen ?? 0);
    },
  });


  useEffect(() => {
    if (user?.id) {
      refetchUserData();
    }
  }, [user, refetchUserData]);

  
  useEffect(() => {
    if (currentNotificationCount !== undefined) {
      setNotificationNumber(currentNotificationCount);
    }
  }, [currentNotificationCount]);

 
  useEffect(() => {
    const handleFocus = () => refetchUserData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchUserData]);


  useEffect(()=>{
    const user = localStorage.getItem("user");
    if (!user) {
      window.location.href = "/login";
    }
  },[])

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (showLogout) setShowLogout(false);
  };

  window.addEventListener("click", handleClickOutside);

  return () => {
    window.removeEventListener("click", handleClickOutside);
  };
}, [showLogout]);


notificationBtn.current?.addEventListener("click", () => {
  if(notificationNumber<1){
  return;
  }
  if(userData.role==="Admin"){
   router.push("/apply-status/admin");
  }
  else{
    router.push("/apply-status/employee");
  }
});

useEffect(() => {
  if (!reloadBtn.current) return;

  const handleReload = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 4000);
  };

  reloadBtn.current.addEventListener("click", handleReload);
  return () => reloadBtn.current?.removeEventListener("click", handleReload);
}, []);




  if (isUserLoading || isUserDataLoading)
    return (
       <header>
        {loading && <Loader />}
      <nav>
        <div className="logo">
          <Image src={logo} alt="logo" width={55} height={24} />
        </div>
        <h1 className="page-title">{pageTitle}</h1>

        <div className="options">

           <button className="button" ref={reloadBtn}>
            <Image src={Reload} alt="reload" width={24} height={24} />
          </button>

           <button className=" button">
            <Image src={notification} alt="notification" width={24} height={24} />
          </button>

          <button className="settings button">
            <Image src={settings} alt="settings" width={24} height={24} />
          </button>
        </div>
      </nav>
    </header>
    );

  if (isUserError)
    return (
      <header>
         {loading && <Loader />}
        <nav>
          <div className="logo">
            <Image src={logo} alt="logo" width={55} height={24} />
          </div>
          <h1 className="page-title">Error loading user</h1>
        </nav>
      </header>
    );


  return (
    <header>
       {loading && <Loader />}
      <nav>
        <div className="logo">
          <Image src={logo} alt="logo" width={55} height={24} />
        </div>
        <h1 className="page-title">{pageTitle}</h1>

        <div className="options">

             <button className="button" ref={reloadBtn}>
            <Image src={Reload} alt="reload" width={24} height={24} />
          </button>


          <button className="notification button" ref={notificationBtn}>
            <Image src={notification} alt="notification" width={24} height={24} />
            {notificationNumber > 0 && <p id="count">{notificationNumber}</p>}
          </button>

          

          <div className="settings button"  onClick={(e) => {
    e.stopPropagation();
    setShowLogout(!showLogout);
  }}>
            <Image src={settings} alt="settings" width={24} height={24} />
            {showLogout && (
              <button className="logout" onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}>Log Out</button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
