"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import Footer from "../components/Footer";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";

export default function Page() {
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  // ✅ 1️⃣ Load user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.name);
      setUserRole(user.role);
    }
  }, []);

  // ✅ 2️⃣ Reset employee's notification count to 0 when visiting this page
  useEffect(() => {
    // only run for employees after username is loaded
    if (!username || userRole !== "employee") return;

    const resetHasSeen = async () => {
      try {
        const res = await axios.put(`/api/login/update-status/${username}`, { hasSeen: 0 });
        setNotificationCount(res.data.user.hasSeen ?? 0);
      } catch (error) {
        console.error("Error resetting hasSeen:", error);
      }
    };

    resetHasSeen();
  }, [username, userRole]);

  // ✅ 3️⃣ Fetch applications (React Query)
  const {
    data: userApplications = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userApplications", username],
    queryFn: async () => {
      if (!username) return [];
      const url =
        userRole === "employee"
          ? `/api/applications/${username}`
          : `/api/applications`;
      const response = await axios.get(url);
      return response.data.userApplications || [];
    },
    enabled: !!username,
  });

  // ✅ 4️⃣ Admin updates a user's status (increments their hasSeen)
  const updateStatus = async (applicationId, status, name) => {
  try {
    await axios.put(`/api/status/${applicationId}`, { status });
    await axios.put(`/api/login/update-status/${name}`, {
      increment: true, 
    });
    refetch();
  } catch (error) {
    console.error("Error updating status:", error);
  }
};


  // ✅ 5️⃣ Split applications
  const recentApplications = userApplications.filter((a) => a.status === "Pending");
  const pastApplications = userApplications.filter(
    (a) => a.status === "Approved" || a.status === "Rejected"
  );

  // ✅ 6️⃣ Loading & error handling
  if (isLoading)
    return (
      <div className="apply_page apply_status_page">
        <Header currentNotificationCount={notificationCount} />
        <div className="container"><p>Loading applications...</p></div>
        <Footer />
      </div>
    );

  if (isError)
    return (
      <div className="apply_page apply_status_page">
        <Header />
        <div className="container">
          <p>{error.response?.data?.message || error.message}</p>
          <button className="common_btn" onClick={() => refetch()}>Retry</button>
        </div>
        <Footer />
      </div>
    );

  
  return (
    <div className="apply_page apply_status_page">
      <Header currentNotificationCount={notificationCount} pageTitle={'Apply Status'} />
      <div className="container">
        {userRole === "employee" && (
          <div className="recent_applications applications">
            <h2>Recent Applications</h2>
            <ul>
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <li key={application._id}>
                    <div className="detail">
<p id="leave_type">
  {application.type === "Leave" ? application.leaveType : "Permission"}
</p>
                    <p id="date">
  {application.type === "Leave"
    ? `${new Date(application.date).toLocaleDateString("en-GB")} to ${new Date(application.toDate).toLocaleDateString("en-GB")}`
    : new Date(application.date).toLocaleDateString("en-GB")}
</p>

                      <p id="reason">{application.reason}</p>
                      {application.fileUrl && (
                        <a id="medical_certificate" href={application.fileUrl} target="_blank" rel="noopener noreferrer">
                          View Medical Certificate
                        </a>
                      )}
                    </div>
                    <div className="common_btn pending">{application.status}</div>
                  </li>
                ))
              ) : (
                <p className="txts">No pending applications.</p>
              )}
            </ul>
          </div>
        )}

        <div className="recent_applications past_applications applications">
          <h2>{userRole === "employee" ? "Past Applications" : "Applications"}</h2>
          <ul>
            {userRole === "admin"
              ? userApplications.map((application) => (
                  <li key={application._id}>
                    <div className="detail">
                     <p id="leave_type">{application.name} -
  {application.type === "Leave" ? application.leaveType : "Permission"}
</p>
<p id="date">
  {application.type === "Leave"
    ? `${new Date(application.date).toLocaleDateString("en-GB")} to ${new Date(application.toDate).toLocaleDateString("en-GB")}`
    : new Date(application.date).toLocaleDateString("en-GB")}
</p>
 {application.fileUrl && (
                        <a target="_self" id="medical_certificate" href={application.fileUrl} rel="noopener noreferrer">
                          View Medical Certificate
                        </a>
                      )}

                      <p id="reason">{application.reason}</p>
                    </div>
                    <Select
                      id="status_selectbox"
                      value={{ value: application.status, label: application.status }}
                      className={
                        application.status === "Approved"
                          ? "approved"
                          : application.status === "Rejected"
                          ? "rejected"
                          : "pending"
                      }
                      options={[
                        { value: "Pending", label: "Pending" },
                        { value: "Approved", label: "Approved" },
                        { value: "Rejected", label: "Rejected" },
                      ]}
                      onChange={(selected) =>
                        updateStatus(application._id, selected.value, application.name)
                      }
                    />
                  </li>
                ))
              : pastApplications.map((application) => (
                  <li key={application._id}>
                    <div className="detail">
                      <p id="leave_type">
  {application.type === "Leave" ? application.leaveType : "Permission"}
</p>
                    <p id="date">
  {application.type === "Leave"
    ? `${new Date(application.date).toLocaleDateString("en-GB")} to ${new Date(application.toDate).toLocaleDateString("en-GB")}`
    : new Date(application.date).toLocaleDateString("en-GB")}
</p>

                      <p id="reason">{application.reason}</p>
                    </div>
                    <div
                      className={`common_btn ${
                        application.status === "Approved" ? "approved" : "rejected"
                      }`}
                    >
                      {application.status}
                    </div>
                  </li>
                ))}
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
