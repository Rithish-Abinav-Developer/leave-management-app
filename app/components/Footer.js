"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import homeIcon from "@/app/src/home.svg";
import { useRouter } from "next/navigation";
import LeaveIcon from "@/app/src/all-leave-icon.svg";
import StatusIcon from "@/app/src/status-icon.svg";


export default function Footer() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  
    useEffect(()=>{
      const token = localStorage.getItem('user');
      if(!token){
        router.push('/home');
      }
    },[])
  

  return (
    <footer>
      <ul
        style={{
          display: "flex",
          gap: "1rem",
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        <li>
          <Link href="/home">
            <Image src={homeIcon} alt="Home" width={24} height={24} />
            <p>Home</p>
          </Link>
        </li>

        <li>
          <Link
            href={
              user?.role === "employee"
                ? "/apply-form"
                : "/all-leaves"
            }
          >
            <Image src={LeaveIcon} alt="Status" width={24} height={24} />
            <p>{user?.role === "employee" ? "Apply Leave" : "All Leaves"}</p>
          </Link>
        </li>

        <li>
          <Link
            href={
              user?.role === "employee"
                ? "/apply-status/employee"
                : "/apply-status/admin"
            }
          >
            <Image src={StatusIcon} alt="Status" width={24} height={24} />
            <p>Leave Status</p>
          </Link>
        </li>
      </ul>
    </footer>
  );
}
