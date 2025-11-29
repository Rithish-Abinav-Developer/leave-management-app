"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import rightArrow from "@/app/src/right-arrow.svg";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Loader from "../components/Loader";

export default function Page() {
  const [adminName, setAdminName] = useState("");
  const [role, setRole] = useState("");
  const [isClient, setIsClient] = useState(false); 

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setAdminName(parsed.name);
      setRole(parsed.role);
    }
    setIsClient(true); 
  }, []);

  useEffect(() => {
    if (!adminName) return;
    const updateStatus = async () => {
      try {
        await axios.put(`/api/login/update-status/${adminName}`, { hasSeen: 0 });
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    };
    updateStatus();
  }, [adminName, isClient]);

  const { data: allApplications = [], isLoading } = useQuery({
    queryKey: ["adminApplications", adminName],
    queryFn: async () => {
      let res;
      if (role === "Manager") {
        res = await axios.get(`/api/applications?admin=${adminName}`);
      } else {
        res = await axios.get(`/api/applications`);
      }
      return res.data.userApplications || [];
    },
    enabled: !!adminName && !!role && isClient,
  });

  // ------------------------------
  function format(d) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB");
  }

  function calculatePeriod(a) {
    if (a.type !== "Leave") return 0;
    const start = new Date(a.date);
    const end = a.toDate ? new Date(a.toDate) : null;

    if (!end) return a.fromPeriod || 1;

    const totalDays = (end - start) / (1000 * 60 * 60 * 24) + 1;
    if (totalDays <= 1) return a.fromPeriod || 1;

    const middleDays = Math.max(totalDays - 2, 0);
    return (a.fromPeriod || 1) + middleDays + (a.toPeriod || 1);
  }

  const applicationsWithPeriod = allApplications.map(a => ({
    ...a,
    period: calculatePeriod(a),
  }));

  function formatDateRow(a) {
    const start = format(a.date);
    if (a.type === "Leave") {
      if (a.toDate) return `${start} - ${format(a.toDate)}`;
      return start;
    }
    return `${start} - ${a.time}`;
  }

  function exportToExcel() {
    const exportData = applicationsWithPeriod.map(a => ({
      Name: a.name,
      "Leave Period": a.period || "-",
      Type: a.type === "Leave" ? a.leaveType : "Permission",
      Date: formatDateRow(a),
      Reason: a.reason || "-",
      Status: a.status || "-",
      ...(a.leaveType === "Sick Leave" && { File: a.fileUrl || "-" }),
      ...(a.type === "Permission" && { Hours: `${a.hours} hrs` }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Applications");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "applications.xlsx");
  }

  // ------------------------------
  return (
    <div className="all_leaves">
      {isLoading && <Loader />}
      <Header pageTitle="Applications" currentNotificationCount={0} />

      <div className="container">
        <section className="applications">
          <div className="top_sec">
            <h3>All Leaves</h3>
            <button onClick={exportToExcel} className="export-btn">
              Export
              <Image src={rightArrow} alt="right-arrow" width={16} height={16} />
            </button>
          </div>

          {!allApplications || allApplications.length === 0 ? (
            <p className="txts">No applications found.</p>
          ) : (
            <ul className="all_leave_applications">
              {applicationsWithPeriod.map(application => (
                <li
                  key={application._id}
                  className={`leave ${
                    application.status === "Approved"
                      ? "approved"
                      : application.status === "Rejected"
                      ? "rejected"
                      : "pending"
                  }`}
                >
                  <div className="detail">
                    <p id="leave_type">
                      {application.name} -{" "}
                      {application.type === "Leave"
                        ? application.leaveType
                        : `Permission for ${
                            application.hours === "0.5" ? "half an" : application.hours
                          } hr`}
                    </p>

                    <p id="date">
  {application.type === "Leave"
    ? application.toDate
      ? `${format(application.date)} to ${format(application.toDate)}`
      : `${format(application.date)} (${application.fromPeriod === 0.5 ? "half day" : "full day"})`
    : `${format(application.date)} - ${application.time}`}
</p>


                    <p id="reason">{application.reason}</p>

                    {!!application.fileUrl && (
                      <a
                        id="medical_certificate"
                        href={application.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Medical Certificate
                      </a>
                    )}
                  </div>

                  <div className={`common_btn ${application.status?.toLowerCase() || ""}`}>
                    {application.status || "-"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
