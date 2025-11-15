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
    fromPeriod: 0,
    toPeriod: 0,  
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
    // if (!formData.toDate) {
    //   alert("⚠️ Please select To Date.");
    //   setLoading(false);
    //   return;
    // }
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
 await axios.put(`/api/login/update-status/${storedUser?.admin}`, { increment: true, role: storedUser?.role || "" });
    setLoading(false);
  } catch (error) {
    console.error("Error submitting:", error);
    alert("Submission failed!");
    setLoading(false);
  }
};



const calculateTotalPeriod = (fromDateStr, toDateStr, fromP, toP) => {
  if (!fromDateStr) return 0;

  const fromDate = new Date(`${fromDateStr}T00:00:00`);
  const toDate = toDateStr ? new Date(`${toDateStr}T00:00:00`) : fromDate;

  let workingDays = 0;
  let iter = new Date(fromDate);

  let weekendBetween = false;
  let publicHolidayBetween = false;

  while (iter <= toDate) {
    const iso = iter.toISOString().split("T")[0];
    const day = iter.getDay();

    const isWeekend = day === 0 || day === 6;
    const isPublicHoliday = leavesDates.includes(iso);

    if (isWeekend) weekendBetween = true;
    if (isPublicHoliday) publicHolidayBetween = true;

    if (!isWeekend && !isPublicHoliday) workingDays++;

    iter.setDate(iter.getDate() + 1);
  }


  let extraDays = 0;
  if (weekendBetween) extraDays += 1;
  if (publicHolidayBetween) extraDays += 1;

  return workingDays - (1 - fromP) - (1 - toP) + extraDays;
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
 <div className="date_container">
    <DatePicker
      selected={formData.date ? new Date(formData.date) : null}
      onChange={(date) => {
        if (!date) return;
        const formatted = date.toLocaleDateString("en-CA");

        setFormData((prev) => ({
          ...prev,
          date: formatted,
          toDate: "",
          fromPeriod: 1,
          toPeriod: 1,
          period: 1,
        }));
      }}
      minDate={formData.leaveType === "Sick Leave" ? null : new Date()}
      maxDate={formData.leaveType === "Sick Leave" ? new Date() : null}
      dateFormat="yyyy-MM-dd"
      placeholderText="Select from date"
      className="date-picker"
      filterDate={(date) => {
        const day = date.getDay();
        const formatted = date.toISOString().split("T")[0];
        return day !== 0 && day !== 6 && !leavesDates.includes(formatted);
      }}
    />

    {formData.type === "Leave" && (
    <select className="period_select"
      name="fromPeriod"
      value={formData.fromPeriod}
      onChange={(e) => {
        const newFrom = Number(e.target.value);
        const totalPeriod = calculateTotalPeriod(
          formData.date,
          formData.toDate,
          newFrom,
          formData.toPeriod
        );
        setFormData((prev) => ({ ...prev, fromPeriod: newFrom, period: Number(totalPeriod) }));
      }}
    >
      <option value={1}>Full Day</option>
      <option value={0.5}>Half Day</option>
    </select>
    )}
  </div>
</div>


{formData.type === "Leave" && (
  <div className="form-group">
    <label>Select To Date</label>
  <div className="date_container">
      <DatePicker
        selected={formData.toDate ? new Date(formData.toDate) : null}
        onChange={(date) => {
          if (!date) return;
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

     

          const totalPeriod = calculateTotalPeriod(
            formData.date,
            date.toLocaleDateString("en-CA"),
            formData.fromPeriod,
            formData.toPeriod
          );

               let weekendBetween = false;
let publicHolidayBetween = false;
let iter = new Date(fromDate);

while (iter <= toDate) {
  const iso = iter.toISOString().split("T")[0];
  const day = iter.getDay();
  if (day === 0 || day === 6) weekendBetween = true;
  if (leavesDates.includes(iso)) publicHolidayBetween = true;
  iter.setDate(iter.getDate() + 1);
}

if (weekendBetween || publicHolidayBetween) {
  const parts = [];
  if (weekendBetween) parts.push("weekend");
  if (publicHolidayBetween) parts.push("public holiday");
  const extraDays = (weekendBetween ? 1 : 0) + (publicHolidayBetween ? 1 : 0);
  alert(`⚠️ Detected ${parts.join(" and ")} between the dates. Added ${extraDays} extra day(s). Total counted: ${totalPeriod} day(s).`);
}

          

          setFormData((prev) => ({
            ...prev,
            toDate: date.toLocaleDateString("en-CA"),
            period: Number(totalPeriod),
          }));
        }}
        minDate={
          formData.date
            ? new Date(new Date(formData.date).setDate(new Date(formData.date).getDate() + 1))
            : new Date()
        }
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
      <select className="period_select"
        name="toPeriod"
        value={formData.toPeriod}
        onChange={(e) => {
          const newTo = Number(e.target.value);
          const totalPeriod = calculateTotalPeriod(
            formData.date,
            formData.toDate,
            formData.fromPeriod,
            newTo
          );
          setFormData((prev) => ({ ...prev, toPeriod: newTo, period: Number(totalPeriod) }));
        }}
      >
        <option value={1}>Full Day</option>
        <option value={0.5}>Half Day</option>
      </select>
    </div>
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
      disabled 
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
