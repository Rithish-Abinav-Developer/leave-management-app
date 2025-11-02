"use client";
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import rightArrow from "@/app/src/right-arrow.svg";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Page() {
  const { data: allApplications, isLoading } = useQuery({
    queryKey: ["allApplications"],
    queryFn: async () => {
      const res = await axios.get("/api/applications");
      console.log(res.data.userApplications);
      return res.data.userApplications;
    },
  });

  // ✅ Function to export selected data
  const exportToExcel = () => {
    if (!allApplications || allApplications.length === 0) {
      alert("No data to export");
      return;
    }

    // Select only specific fields
const exportData = allApplications.map((a) => ({
  Name: a.name,
  Type: a.type === "Leave" ? a.leaveType : "Permission",
  Date:
    a.type === "Leave"
      ? `${new Date(a.date).toLocaleDateString()} - ${new Date(
          a.toDate
        ).toLocaleDateString()}`
      : new Date(a.date).toLocaleDateString(),
  Reason: a.reason || "-",
  Status: a.status,
  ...(a.leaveType === "Sick Leave" && { File: a.fileUrl || "-" }) 
}));


    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save file
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "applications.xlsx");
  };

  return (
    <div className="all_leaves">
      <Header pageTitle="Applications" />

      <div className="container">
        <section className="applications">
          <div className="top_sec">
            <h3>All Leaves</h3>
            <button onClick={exportToExcel} className="export-btn">
              Export
              <Image
                src={rightArrow}
                alt="right-arrow"
                width={16}
                height={16}
              />
            </button>
          </div>

          <ul className="all_leave_applications">
            {allApplications &&
              allApplications.map((application) => (
                <li key={application._id} className={`leave ${
        application.status === "Approved"
          ? "approved"
          : application.status === "Rejected"
          ? "rejected"
          : "pending"
      }`}>
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
                        : new Date(application.date).toLocaleDateString(
                            "en-GB"
                          )}
                    </p>
                    <p id="reason">{application.reason}</p>
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
                  </div>
                  <div
                    className={`common_btn ${application.status.toLowerCase()}`}
                  >
                    {application.status}
                  </div>
                </li>
              ))}
          </ul>
        </section>
      </div>

      <Footer />
    </div>
  );
}
