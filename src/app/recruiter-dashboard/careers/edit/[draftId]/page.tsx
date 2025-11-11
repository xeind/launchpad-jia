"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import CareerForm from "@/lib/components/CareerComponents/CareerForm";
import Swal from "sweetalert2";

export default function EditDraftPage() {
  const { draftId } = useParams();
  const { orgID } = useAppContext();
  const [draftData, setDraftData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraft = async () => {
      if (!draftId || !orgID) return;

      try {
        setLoading(true);
        const response = await axios.post("/api/career-data", {
          id: draftId,
          orgID,
        });

        // Verify this is actually a draft
        if (
          response.data?.isDraft !== true &&
          response.data?.status !== "draft"
        ) {
          Swal.fire({
            icon: "warning",
            title: "Not a Draft",
            text: "This career is not a draft. Redirecting to careers page...",
            timer: 2000,
          }).then(() => {
            window.location.href = "/recruiter-dashboard/careers";
          });
          return;
        }

        setDraftData(response.data);
      } catch (error) {
        console.error("Error fetching draft:", error);
        if (error.response?.status === 404) {
          Swal.fire({
            title: "Draft not found",
            text: "Redirecting back to careers page...",
            timer: 1500,
          }).then(() => {
            window.location.href = "/recruiter-dashboard/careers";
          });
          return;
        }
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load draft. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDraft();
  }, [draftId, orgID]);

  if (loading) {
    return (
      <>
        <HeaderBar
          activeLink="Careers"
          currentPage="Loading draft..."
          icon="la la-suitcase"
        />
        <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
          <div className="row">
            <div className="col py-5 text-center">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!draftData) {
    return null;
  }

  return (
    <>
      <HeaderBar
        activeLink="Careers"
        currentPage={`Edit: ${draftData.jobTitle || "Draft"}`}
        icon="la la-suitcase"
      />
      <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
        <div className="row">
          <CareerForm formType="edit" career={draftData} />
        </div>
      </div>
    </>
  );
}
