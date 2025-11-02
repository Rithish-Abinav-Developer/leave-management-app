"use client";
import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Loader from "../components/Loader";

export default function Page() {
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    role: "",
    type: "Leave",
    leaveType: "",
    date: "",
    toDate: "",
    time: "",
    hours: "",
    period: "",
    reason: "",
    file: null,
    status: "Pending",
  });

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("No user found");
      return JSON.parse(storedUser);
    },
  });

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        userId: user.id || "",
      }));
    }
  }, [user]);

const handleChange = (e) => {
  const { name, value, type, files } = e.target;

  if (name === "type") {
    setFormData((prev) => ({
      ...prev,
      type: value,
      leaveType: "",
      date: "",
      time: "",
      hours: "",
      period: "",
      reason: "",
      file: null,
      status: "Pending",
    }));
    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: type === "file" ? files[0] : value,
  }));
};


const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData();


  Object.keys(formData).forEach((key) => data.append(key, formData[key]));


  const storedUser = JSON.parse(localStorage.getItem("user"));


  if (storedUser?.profileImage) {
    data.append("profileImage", storedUser.profileImage);
  }

  try {
  
    const res = await axios.post("/api/applications", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    await axios.post("/api/admin-notification", {});

    alert("Form submitted successfully!");
    setFormData(prev => ({ ...Object.fromEntries(Object.keys(prev).map(k => [k, ""])), type: "Leave", file: null }));
  } catch (error) {
    console.error("Error submitting:", error);
    alert("Submission failed!");
  }
};


  // if (isLoading) return <p>Loading user info...</p>;
  if (isError) return <p>Error loading user info.</p>;

  return (
    <div className="apply_page">
      {isLoading && <Loader />}
      <Header pageTitle={'Apply Form'} />

      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="heading_test">
            <h2>Leave Application Form</h2>
            <p>Please provide information about your leave or permission.</p>
          </div>

          {/* Application Type */}
          <div className="form-group application_type">
            <div>
              <input
                type="radio"
                id="leave"
                name="type"
                value="Leave"
                checked={formData.type === "Leave"}
                onChange={handleChange}
              />
              <label htmlFor="leave">Leave</label>
            </div>
            <div>
              <input
                type="radio"
                id="permission"
                name="type"
                value="Permission"
                checked={formData.type === "Permission"}
                onChange={handleChange}
              />
              <label htmlFor="permission">Permission</label>
            </div>
          </div>

          {formData.type === "Leave" && (
            <div className="form-group">
              <label>Leave Type:</label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
              >
                <option>Choose leave type...</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Marriage Leave">Marriage Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>{formData.type === "Permission"?"Select Date":"Select From Date:"}</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

{formData.type === "Leave" && (
              <div className="form-group">
            <label>Select To Date</label>
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              required
            />
          </div>
)}

          {formData.type === "Permission" && (
            <>
              <div className="form-group">
                <label>Select Time:</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Select Hours:</label>
                <select
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                >
                  <option>Period of permission...</option>
                  <option value={0.5}>Half an hour</option>
                  <option value={1}>One hour</option>
                  <option value={2}>Two hours</option>
                </select>
              </div>
            </>
          )}

          {formData.type === "Leave" && (
            <div className="form-group">
              <label>Select Period:</label>
              <select
                name="period"
                value={formData.period}
                onChange={handleChange}
              >
                <option>Period of leave...</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} Day{i > 0 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Reason:</label>
            <textarea
              name="reason"
              placeholder="Enter reason..."
              value={formData.reason}
              onChange={handleChange}
            ></textarea>
          </div>

          {formData.type === "Leave" && formData.leaveType === "Sick Leave" && (
            <div className="form-group">
              <label>Upload document (for sick leave):</label>
              <input type="file" name="file" onChange={handleChange} />
            </div>
          )}

          <button type="submit" className="btn-submit">
            Apply
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
