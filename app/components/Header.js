"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import logo from "@/app/src/logo.png";
import settings from "@/app/src/setting.svg";
import notification from "@/app/src/notification.svg";
import Reload from "@/app/src/reload.svg";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loader from "./Loader";

export default function Header({ currentNotificationCount, pageTitle }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [notificationNumber, setNotificationNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const reloadBtn = useRef(null);
  const notificationBtn = useRef(null);
  const router = useRouter();


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
  }, []);


  useEffect(() => {
    if (!user?.id) return;

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`/api/login/${user.id}`);
        setUserData(res.data.user);
        setNotificationNumber(res.data.user.hasSeen ?? 0);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();


    const handleFocus = () => fetchUserData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);


  useEffect(() => {
    if (currentNotificationCount !== undefined) {
      setNotificationNumber(currentNotificationCount);
    }
  }, [currentNotificationCount]);


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


useEffect(() => {
  if (!notificationBtn.current) return;

  const handleNotificationClick = async () => {
    if (notificationNumber < 1 || !userData) return;

    try {
      setLoading(true);

      await axios.put(`/api/login/update-status/${user.name}`, { hasSeen: 0 });

      if (userData.role === "admin") {
        router.push("/apply-status/admin");
      } else {
        router.push("/apply-status/employee");
      }

    } catch (err) {
      console.error("Failed to update notification status:", err);
    } finally {
      setLoading(false);
    }
  };

  notificationBtn.current.addEventListener("click", handleNotificationClick);
  return () => notificationBtn.current?.removeEventListener("click", handleNotificationClick);
}, [notificationNumber, userData, router]);


  useEffect(() => {
    const handleClickOutside = () => {
      if (showLogout) setShowLogout(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [showLogout]);

  if (!user || !userData)
    return (
      <header>
        {loading && <Loader />}
        <nav>
          <div className="logo">
            <Image src={logo} alt="logo" width={55} height={24} />
          </div>
          <h1 className="page-title">{pageTitle || "Loading..."}</h1>
          <div className="options">
            <button className="button" ref={reloadBtn}>
              <Image src={Reload} alt="reload" width={24} height={24} />
            </button>
            <button className="button">
              <Image src={notification} alt="notification" width={24} height={24} />
            </button>
            <button className="settings button">
              <Image src={settings} alt="settings" width={24} height={24} />
            </button>
          </div>
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

          <div
            className="settings button"
            onClick={(e) => {
              e.stopPropagation();
              setShowLogout(!showLogout);
            }}
          >
            <Image src={settings} alt="settings" width={24} height={24} />
            {showLogout && (
              <button
                className="logout"
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
