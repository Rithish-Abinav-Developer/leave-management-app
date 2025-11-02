"use client";
import React, { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import Loader from "@/app/components/Loader";

export default function AdminApplicationsPage() {
  const [adminName, setAdminName] = useState("");
  const [isClient, setIsClient] = useState(false); 


  useEffect(() => {
    setIsClient(true);
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setAdminName(parsed.name);
    }
  }, []);

 
  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ["adminApplications"],
    queryFn: async () => {
      const res = await axios.get("/api/applications");
      return res.data.userApplications || [];
    },
    enabled: isClient,
  });

  const { data: adminNotifications = [], isLoading: isLoadingNotifications} = useQuery({
    queryKey: ["adminNotifications"],
    queryFn: async () => {
      const res = await axios.put(`/api/login/update-status/${ adminName }`, { hasSeen: 0 });
      return res.data || [];
    },
    enabled: isClient,
  });

  if (!isClient) return null; 

  // if (isLoading) return <p>Loading...</p>;

  const pending = applications.filter((a) => a.status === "Pending");
  const past = applications.filter(
    (a) => a.status === "Approved" || a.status === "Rejected"
  );

  const updateStatus = async (id, status, name) => {
    try {
      await axios.put(`/api/status/${id}`, { status });
      await axios.put(`/api/login/update-status/${name}`, { increment: true });
      refetch();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="apply_page apply_status_page">
      {isLoading || isLoadingNotifications && <Loader />}
      <Header pageTitle="Status" />
      <div className="container">
        {/* Pending Applications */}
        <section className="applications">
          <h2>Recent Applications</h2>
          <ul>
            {pending.length > 0 ? (
              pending.map((application) => (
                <li key={application._id}>
                  <div className="detail">
                    <p id="leave_type">
                      {application.name} -{" "}
                      {application.type === "Leave"
                        ? application.leaveType
                        : `Permission for ${application.hours==="0.5"?"half an":application.hours} hr`}

                    </p>
            <p id="date">
  {application.type === "Leave"
    ? `${new Date(application.date).toLocaleDateString("en-GB")} to ${new Date(
        application.toDate
      ).toLocaleDateString("en-GB")}`
    : `${new Date(application.date).toLocaleDateString("en-GB")} - ${application.time}`}
</p>

                    {application.fileUrl && (
                      <a
                        id="medical_certificate"
                        href={application.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Medical Certificate
                      </a>
                    )}
                    <p id="reason">{application.reason}</p>
                  </div>

                  <Select
                    id="status_selectbox"
                    value={{
                      value: application.status,
                      label: application.status,
                    }}
                    className="pending"
                    options={[
                      { value: "Pending", label: "Pending" },
                      { value: "Approved", label: "Approved" },
                      { value: "Rejected", label: "Rejected" },
                    ]}
                    onChange={(opt) =>
                      updateStatus(application._id, opt.value, application.name)
                    }
                  />
                </li>
              ))
            ) : (
              <p className="txts">No pending applications.</p>
            )}
          </ul>
        </section>

        {/* Past Applications */}
        <section className="applications past_applications">
          <h2>Past Applications</h2>
          <ul>
            {past.length > 0 ? (
              past.map((application) => (
                <li key={application._id}>
                  <div className="detail">
                    <p id="leave_type">
                      {application.name} -{" "}
                      {application.type === "Leave"
                        ? application.leaveType
                        : "Permission"}
                    </p>
                    <p id="date">
                      {application.type === "Leave"
                        ? `${new Date(
                            application.date
                          ).toLocaleDateString("en-GB")} to ${new Date(
                            application.toDate
                          ).toLocaleDateString("en-GB")}`
                        : new Date(application.date).toLocaleDateString("en-GB")}
                    </p>
                    {application.fileUrl && (
                      <a
                        id="medical_certificate"
                        href={application.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Medical Certificate
                      </a>
                    )}
                    <p id="reason">{application.reason}</p>
                  </div>

                  <Select
                    id="status_selectbox"
                    value={{
                      value: application.status,
                      label: application.status,
                    }}
                    className={
                      application.status === "Approved"
                        ? "approved"
                        : "rejected"
                    }
                    options={[
                      { value: "Pending", label: "Pending" },
                      { value: "Approved", label: "Approved" },
                      { value: "Rejected", label: "Rejected" },
                    ]}
                    onChange={(opt) =>
                      updateStatus(application._id, opt.value, application.name)
                    }
                  />
                </li>
              ))
            ) : (
              <p className="txts">No approved or rejected applications yet.</p>
            )}
          </ul>
        </section>
      </div>
      <Footer />
    </div>
  );
}
