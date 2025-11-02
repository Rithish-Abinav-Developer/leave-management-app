"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/app/src/logo.png";
import Link from "next/link";
import userIcon from "@/app/src/username.svg";
import passwordIcon from "@/app/src/password.svg";
import passwordEyeicon from "@/app/src/password-eye.svg";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Loader from "../components/Loader";

export default function Page() {
const router = useRouter();

const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [user, setUser] = useState({
    email: "",
    password: "",
  });


  const loginMutation = useMutation({
    mutationFn: async (user) => {
      const res = await axios.post("/api/login", user);
      // console.log("Login response:", res.data);
      return res.data;
    },
    onSuccess: (data) => {
      setErr(data.message);
      setUser({ email: "", password: "" });
      

      const userData = {
        name: data.user?.name,
        email: data.user?.email,
        role: data.user?.role,
        id: data.user?.id,
        profileImage: data.user?.profileImage,
      };
      
      localStorage.setItem("user", JSON.stringify(userData));
      setLoading(false);
      router.push("/home");
    },
    onError: (error) => {
      console.error("Login error:", error);
      setErr(error.response?.data?.error || "Something went wrong");
    },
  });

  const Login = (e) => {
    e.preventDefault();
    setLoading(true);
    if (!user.email || !user.password) {
      setErr("Please fill in all fields");
      return;
    }
    loginMutation.mutate(user);
  };

    useEffect(()=>{
      const token = localStorage.getItem('user');
      if(token){
        router.push('/home');
      }
    },[])

  return (
    <div className="entry_page">
      {loading && <Loader/>}
      
      <div className="entry_page_banner">
        <div className="logo_container">
          <Image className="logo" src={logo} alt="logo" width={120} height={54} />
        </div>
      </div>

      <div className="entry_page_content">
        <form onSubmit={Login}>
          <p>Welcome back!</p>

          {/* Username / Email */}
          <div className="form_group">
            <Image src={userIcon} alt="user icon" width={24} height={24} />
            <input
              onChange={(e) => {
                setUser({ ...user, email: e.target.value });
                setErr("");
              }}
              type="email"
              value={user.email}
              id="email"
              name="email"
              placeholder="Email"
            />
          </div>

          {/* Password */}
          <div className="form_group">
            <Image src={passwordIcon} alt="password icon" width={24} height={24} />
            <input
              type={showPassword ? "text" : "password"}
              onChange={(e) => {
                setUser({ ...user, password: e.target.value });
                setErr("");
              }}
              id="password"
              name="password"
              value={user.password}
              placeholder="Password"
            />
            <Image
              id="password-eye"
              src={passwordEyeicon}
              alt="show password"
              width={24}
              height={24}
              className="cursor-pointer select-none"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}
              onTouchEnd={() => setShowPassword(false)}
            />
          </div>

          {err && <p id="error-message" className="error-message">{err}</p>}

          <button type="submit" className="common_btn" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      <div className="entry_page_footer">
        <ul>
          <li>Version 1.0.0</li>
          <li>Powered by Srdn.Co</li>
          <li>Help & Support</li>
        </ul>
      </div>
    </div>
  );
}
