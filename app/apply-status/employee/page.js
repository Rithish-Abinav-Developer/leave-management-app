"use client";
import React, { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/app/components/Loader";

export default function EmployeeStatusPage() {
  const [username, setUsername] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser.name) setUsername(storedUser.name);
  }, []);


  useEffect(() => {
    if (!username) return;
    axios.put(`/api/login/update-status/${username}`, { hasSeen: 0 })
      .then(res => setNotificationCount(res.data.user?.hasSeen ?? 0))
      .catch(err => console.error(err));
  }, [username]);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["employeeApplications", username],
    queryFn: async () => {
      if (!username) return [];
      const res = await axios.get(`/api/applications/${username}{
  params: { role: "employee" },
  console.log(res.data)
}`);
      return res.data.userApplications || [];
    },
    enabled: !!username,
  });

  const recent = applications.filter(a => a.status === "Pending");
  const past = applications.filter(a => ["Approved", "Rejected"].includes(a.status));

  // if (isLoading) return <p>Loading...</p>;

  return (
    <div className="apply_page apply_status_page">
    {isLoading && <Loader />}
      <Header currentNotificationCount={notificationCount} pageTitle="My Applications" />
      <div className="container">
        <section className="applications">
          <h2>Recent Applications</h2>
          <ul>
            {recent.length > 0 ? recent.map(a => (
              <li key={a._id}>
                <div className="detail">
                  <p id="leave_type">{a.type === "Leave" ? a.leaveType : `Permission for ${a.hours==="0.5"?"half an":a.hours} hr`}</p>
                  <p id="date">
  {a.type === "Leave"
    ? `${new Date(a.date).toLocaleDateString("en-GB")} to ${new Date(
        a.toDate
      ).toLocaleDateString("en-GB")}`
    : `${new Date(a.date).toLocaleDateString("en-GB")} - ${a.time}`}
</p>
                  <p id="reason">{a.reason}</p>
                  {a.fileUrl && (
                    <a id="medical_certificate" href={a.fileUrl} target="_blank" rel="noopener noreferrer">View Medical Certificate</a>
                  )}
                </div>
                <div className="common_btn pending">{a.status}</div>
              </li>
            )) : <p className="txts">No pending applications.</p>}
          </ul>
        </section>

        <section className="applications past_applications">
          <h2>Past Applications</h2>
          {past.length > 0 ? (
            <ul>
              {past.map(a => (
                <li key={a._id}>
                  <div className="detail">
                    <p id="leave_type">{a.type === "Leave" ? a.leaveType : "Permission"}</p>
                    <p id="date">
                      {a.type === "Leave"
                        ? `${new Date(a.date).toLocaleDateString("en-GB")} to ${new Date(a.toDate).toLocaleDateString("en-GB")}`
                        : new Date(a.date).toLocaleDateString("en-GB")}
                    </p>
                    <p id="reason">{a.reason}</p>
                     {a.fileUrl && (
                    <a id="medical_certificate" href={a.fileUrl} target="_blank" rel="noopener noreferrer">View Medical Certificate</a>
                  )}
                  </div>
                  <div className={`common_btn ${a.status.toLowerCase()}`}>{a.status}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="txts">No past applications.</p>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
