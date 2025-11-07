"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Loader from "../components/Loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setHours, setMinutes } from "date-fns"; 
import leavesDates from "./leavesDates.js";


export default function Page() {

  const [loading, setLoading] = useState(false);
  const [isPeriodLocked, setIsPeriodLocked] = useState(false);

  const [user, setUser] = useState(null);


  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    role: "",
    division:"",
    admin:"",
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

  // const { data: user, isLoading, isError } = useQuery({
  //   queryKey: ["user"],
  //   queryFn: async () => {
  //     const storedUser = localStorage.getItem("user");
  //     if (!storedUser) throw new Error("No user found");
  //     return JSON.parse(storedUser);
  //   },
  // });

  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
  setLoading(false);
}, []);

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        admin: user.admin || "",
        division: user.division || "",
        userId: user.id || "",
      }));
    }
  }, [user]);

const handleChange = (e) => {
  const { name, value, type, files } = e.target;
  console.log(name)

 if (name === "leaveType") {
  console.log("Leave type changed to:", value);
  setFormData((prev) => ({
    ...prev,
    leaveType: value,
    date: "",
    toDate: "",
    period: "",
  }));
  return;
}


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
  
  if (!user) {
    alert("User not loaded yet. Please wait a moment.");
    return;
  }
  setLoading(true);

  if (formData.type === "Leave") {
    if (!formData.leaveType) {
      alert("⚠️ Please select a leave type.");
      setLoading(false);
      return;
    }
    if(formData.leaveType === "Sick Leave"){
      if (!formData.file || formData.file===null) {
        alert("⚠️ Please upload a medical certificate.");
        setLoading(false);
        return;
      }
    }
    if (!formData.date) {
      alert("⚠️ Please select From Date.");
      setLoading(false);
      return;
    }
    if (!formData.toDate) {
      alert("⚠️ Please select To Date.");
      setLoading(false);
      return;
    }
    if (!formData.reason.trim()) {
      alert("⚠️ Please enter the reason for leave.");
      setLoading(false);
      return;
    }
  } else if (formData.type === "Permission") {
    if (!formData.date) {
      alert("⚠️ Please select a Date.");
      setLoading(false);
      return;
    }
    if (!formData.time) {
      alert("⚠️ Please select a Time.");
      setLoading(false);
      return;
    }
    if (!formData.hours) {
      alert("⚠️ Please select Hours of permission.");
      setLoading(false);
      return;
    }
    if (!formData.reason.trim()) {
      alert("⚠️ Please enter the reason for permission.");
      setLoading(false);
      return;
    }
  }


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

    // await axios.post("/api/admin-notification", {});
    

    alert("Form submitted successfully!");
const storedUser = JSON.parse(localStorage.getItem("user")) || {};

setFormData({
  name: storedUser?.name || "",
  email: storedUser?.email || "",
  role: storedUser?.role || "",
  division: storedUser?.division || "",
  admin: storedUser?.admin || "",
  userId: storedUser?.id || "",
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
 await axios.put(`/api/login/update-status/${storedUser?.admin}`, { increment: true });
    setLoading(false);
  } catch (error) {
    console.error("Error submitting:", error);
    alert("Submission failed!");
    setLoading(false);
  }
};


  // if (isLoading) return <p>Loading user info...</p>;


  return (
    <div className="apply_page">
      { loading && <Loader />}
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
  <label>
    {formData.type === "Permission" ? "Select Date" : "Select From Date:"}
  </label>
  <DatePicker
    selected={formData.date ? new Date(formData.date) : null}
    onChange={(date) =>
      setFormData((prev) => ({
        ...prev,
        date: date ? date.toLocaleDateString("en-CA") : "",
      }))
    }
    minDate={formData.leaveType === "Sick Leave" ? null : new Date()}
maxDate={formData.leaveType === "Sick Leave" ? new Date() : null}

    dateFormat="yyyy-MM-dd"
    placeholderText="Select date"
    className="date-picker"
    filterDate={(date) => {
      const day = date.getDay();
      const formatted = date.toISOString().split("T")[0];
      // Disable weekends & festival dates
      return day !== 0 && day !== 6 && !leavesDates.includes(formatted);
    }}
  />
</div>

{formData.type === "Leave" && (
  <div className="form-group">
    <label>Select To Date</label>
    <DatePicker
      selected={formData.toDate ? new Date(formData.toDate) : null}
    onChange={(date) => {
  if (!date) return;

  const formatted = date.toISOString().split("T")[0];
  const day = date.getDay();

  // Prevent selecting a weekend or public holiday as the endpoint (you already do this elsewhere)
  if (day === 0 || day === 6 || leavesDates.includes(formatted)) {
    alert("⚠️ Selected date is a holiday or weekend. Please choose another date.");
    return;
  }

  if (!formData.date) {
    alert("Please select From Date first.");
    return;
  }

const fromDate = new Date(`${formData.date}T00:00:00`);
const toDate = new Date(`${date.toLocaleDateString("en-CA")}T00:00:00`);

if (toDate.getTime() < fromDate.getTime()) {
  alert("⚠️ To Date cannot be before From Date.");
  return;
}


  // Count working days (days that are NOT weekend and NOT in leavesDates)
  let workingDays = 0;
  let weekendFound = false;
  let publicHolidayFound = false;

  const iter = new Date(fromDate);
  while (iter <= toDate) {
    const iso = iter.toISOString().split("T")[0];
    const d = iter.getDay();

    const isWeekend = d === 0 || d === 6;
    const isPublicHoliday = leavesDates.includes(iso);

    if (isPublicHoliday) {
      publicHolidayFound = true;
    } else if (isWeekend) {
      weekendFound = true;
    } else {
      // it's a working day
      workingDays++;
    }

    iter.setDate(iter.getDate() + 1);
  }

  // Extra days rule:
  // +1 if any weekend exists between, +1 if any public holiday exists between
  let extraDays = 0;
  if (weekendFound) extraDays += 1;
  if (publicHolidayFound) extraDays += 1;

  const finalDays = workingDays + extraDays;
console.log(date.toLocaleDateString("en-CA"))
  // Update state
  setFormData((prev) => ({
    ...prev,
    toDate: date ? date.toLocaleDateString("en-CA") : "",
    period: String(finalDays),
  }));
  setIsPeriodLocked(extraDays > 0);

  // Inform the user if extras applied
  if (extraDays > 0) {
    const parts = [];
    if (publicHolidayFound) parts.push("public holiday");
    if (weekendFound) parts.push("weekend");
    alert(`⚠️ Detected ${parts.join(" and ")} between the dates. Added ${extraDays} extra day(s). Total counted: ${finalDays} day(s).`);
  }
}}



      minDate={formData.date ? new Date(formData.date) : new Date()}
maxDate={formData.leaveType === "Sick Leave" ? new Date() : null}

      dateFormat="yyyy-MM-dd"
      placeholderText="Select to date"
      className="date-picker"
      filterDate={(date) => {
        const day = date.getDay();
        const formatted = date.toISOString().split("T")[0];
        return day !== 0 && day !== 6 && !leavesDates.includes(formatted);
      }}
    />
  </div>
)}



          {formData.type === "Permission" && (
            <>
              <div className="form-group">
                <label>Select Time:</label>
<DatePicker
  selected={
    formData.time ? new Date(`1970-01-01T${formData.time}:00`) : null
  }
  onChange={(time) => {
    if (time) {
      const hours = String(time.getHours()).padStart(2, "0");
      const minutes = String(time.getMinutes()).padStart(2, "0");
      setFormData((prev) => ({ ...prev, time: `${hours}:${minutes}` }));

    }
  }}
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={30}
  timeCaption="Time"
  dateFormat="h:mm aa" 
  minTime={setHours(setMinutes(new Date(), 0), 9)} 
 maxTime={setHours(setMinutes(new Date(), 30), 17)} 
  placeholderText="Select time (9 AM - 5:30 PM)"
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
    <label>Period of Leave:</label>
    <select
      name="period"
      value={formData.period || ""}
      disabled // always disabled
    >
      {formData.period ? (
        <option value={formData.period}>
          {Number(formData.period)} Day{Number(formData.period) > 1 ? "s" : ""} (Auto Calculated)
        </option>
      ) : (
        <option>Auto calculated from dates...</option>
      )}
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
