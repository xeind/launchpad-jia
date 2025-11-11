"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context/AppContext";
import Swal from "sweetalert2";
import { guid } from "@/lib/Utils";
import OrgInfoTag from "@/lib/components/CareerComponents/OrgInfoTag";

export default function () {
  const [jobDetails, setJobDetails] = useState(null);
  const [showPreScreening, setShowPreScreening] = useState(false);
  const [preScreeningAnswers, setPreScreeningAnswers] = useState({});
  const { slug } = useParams();
  const { user } = useAppContext();

  async function fetchJobDetails() {
    const response = await axios.post(`/api/job-details`, { jobId: slug });

    if (response.data) {
      document.title = `${response.data.jobTitle} | Job Opening | Jia`;
    }

    setJobDetails(response.data);
  }

  const applyForJob = async (job) => {
    // If job has pre-screening questions and modal is not shown yet, show the modal
    if (
      job.preScreeningQuestions &&
      job.preScreeningQuestions.length > 0 &&
      !showPreScreening
    ) {
      setShowPreScreening(true);
      return;
    }

    // Validate pre-screening answers if questions exist
    if (job.preScreeningQuestions && job.preScreeningQuestions.length > 0) {
      const validationError = validatePreScreeningAnswers(
        job.preScreeningQuestions,
      );
      if (validationError) {
        Swal.fire({
          title: "Incomplete Answers",
          text: validationError,
          icon: "warning",
        });
        return;
      }
    }

    let jobApplication = {
      ...job,
      userId: user._id,
      name: user.name,
      image: user.image,
      email: user.email,
      currentStep: "Applied",
      status: "For CV Upload",
      applicationStatus: "Ongoing",
      createdAt: new Date(),
      updatedAt: new Date(),
      interviewID: guid(),
      completedAt: null,
      preScreeningAnswers: preScreeningAnswers, // Include answers
    };

    delete jobApplication._id;

    console.log(jobApplication);

    Swal.fire({
      title: "Please wait",
      text: "We are applying for the job",
      icon: "info",
      allowOutsideClick: false,
    });

    Swal.showLoading();

    await axios
      .post("/api/apply-job", jobApplication)
      .then((res) => {
        if (res.data.error) {
          Swal.fire({
            title: res.data.error,
            text: res.data.message,
            icon: "error",
          });
          return false;
        }

        Swal.fire({
          title: "Success",
          text: `You have applied for the ${job.jobTitle} role`,
          icon: "success",
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.href = "/applicant";
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const validatePreScreeningAnswers = (questions) => {
    for (const question of questions) {
      if (question.required) {
        const answer = preScreeningAnswers[question.id];

        if (!answer) {
          return `Please answer the required question: "${question.question}"`;
        }

        // Validate based on question type
        if (
          question.type === "short-answer" ||
          question.type === "long-answer"
        ) {
          if (!answer.trim()) {
            return `Please provide an answer for: "${question.question}"`;
          }
        } else if (question.type === "checkboxes") {
          if (!Array.isArray(answer) || answer.length === 0) {
            return `Please select at least one option for: "${question.question}"`;
          }
        } else if (question.type === "dropdown") {
          if (!answer || answer === "") {
            return `Please select an option for: "${question.question}"`;
          }
        } else if (question.type === "range") {
          const numAnswer = Number(answer);
          if (isNaN(numAnswer)) {
            return `Please provide a valid number for: "${question.question}"`;
          }
          if (
            question.minValue !== undefined &&
            numAnswer < question.minValue
          ) {
            return `Answer must be at least ${question.minValue} for: "${question.question}"`;
          }
          if (
            question.maxValue !== undefined &&
            numAnswer > question.maxValue
          ) {
            return `Answer must be at most ${question.maxValue} for: "${question.question}"`;
          }
        }
      }
    }
    return null;
  };

  const handleAnswerChange = (questionId, value) => {
    setPreScreeningAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxChange = (questionId, option, checked) => {
    setPreScreeningAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...currentAnswers, option] };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter((a) => a !== option),
        };
      }
    });
  };

  useEffect(() => {
    fetchJobDetails();
  }, []);

  return (
    <div className="container-fluid mt--6">
      <div className="card shadow-1">
        {/* Job Header Sticky */}
        <div className="career-header">
          <div className="career-info-header">
            {jobDetails !== null ? (
              <div
                className="job-openings-header mt-5"
                style={{ marginLeft: "-15px", marginRight: "-15px" }}
              >
                <div className="job-info-header-left">
                  <h1>{jobDetails?.jobTitle}</h1>
                  <p>
                    {jobDetails?.hiringStatus || "Hiring"} |{" "}
                    {new Date(jobDetails?.createdAt).toLocaleDateString() ||
                      "May 2025"}
                  </p>

                  {jobDetails?.workSetup && (
                    <strong>
                      <i className="la la-map-marker text-primary mr-1"></i>{" "}
                      {jobDetails?.location} | {jobDetails?.workSetup}{" "}
                      {jobDetails?.workSetupRemarks}
                    </strong>
                  )}
                </div>
                <div className="job-info-header-right">
                  <OrgInfoTag orgID={jobDetails?.orgID} labelText="Posted By" />
                  <button
                    onClick={() => {
                      applyForJob(jobDetails);
                    }}
                    className="btn btn-primary"
                    style={{ padding: "6px 30px", fontSize: "16px" }}
                  >
                    <i className="la la-briefcase mr-1"></i> Apply Now
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginLeft: "-15px", marginRight: "-15px" }}>
                <div
                  style={{
                    width: "100%",
                    float: "left",
                    padding: "15px 15px",
                    position: "relative",
                  }}
                >
                  <div className="skeleton-bar"></div>
                  <br />
                  <div className="skeleton-bar"></div>
                </div>
                <div
                  style={{
                    width: "30%",
                    float: "left",
                    padding: "15px 15px",
                    position: "relative",
                  }}
                >
                  <div className="skeleton-bar"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Job Description */}
        <div
          style={{
            margin: "0 auto",
            width: "75%",
            maxWidth: "960px",
          }}
          className="pb-8"
        >
          <div style={{ marginLeft: "-15px", marginRight: "-15px" }}>
            {jobDetails !== null ? (
              <div
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  padding: "0 15px",
                  position: "relative",
                  marginTop: "30px",
                }}
              >
                <h2>Job Description</h2>
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {jobDetails?.description}
                </p>
              </div>
            ) : (
              <div
                style={{
                  width: "66%",
                  float: "left",
                  padding: "0 15px",
                  position: "relative",
                }}
              >
                <div className="skeleton-bar"></div>
                <br />
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="skeleton-bar"
                    style={{ width: "100%", marginBottom: "15px" }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pre-Screening Questions Modal */}
      {showPreScreening && jobDetails?.preScreeningQuestions && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowPreScreening(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "32px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "24px" }}>Pre-Screening Questions</h2>
            <p style={{ marginBottom: "24px", color: "#6B7280" }}>
              Please answer the following questions before submitting your
              application.
            </p>

            {jobDetails.preScreeningQuestions.map((question, index) => (
              <div key={question.id} style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  {index + 1}. {question.question}
                  {question.required && (
                    <span style={{ color: "red" }}> *</span>
                  )}
                </label>

                {question.type === "short-answer" && (
                  <input
                    type="text"
                    className="form-control"
                    value={preScreeningAnswers[question.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                    placeholder="Your answer"
                  />
                )}

                {question.type === "long-answer" && (
                  <textarea
                    className="form-control"
                    rows={4}
                    value={preScreeningAnswers[question.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                    placeholder="Your answer"
                  />
                )}

                {question.type === "dropdown" && (
                  <select
                    className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base font-medium text-gray-800 transition-colors duration-200 hover:bg-gray-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={preScreeningAnswers[question.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                    style={{
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                      backgroundSize: "1.25rem",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="" className="text-gray-400">
                      Select an option
                    </option>
                    {question.options?.map((option, i) => (
                      <option
                        key={i}
                        value={option}
                        className="py-2.5 font-medium text-gray-800 hover:bg-gray-100"
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === "checkboxes" && (
                  <div>
                    {question.options?.map((option, i) => (
                      <div key={i} style={{ marginBottom: "8px" }}>
                        <label
                          style={{ fontWeight: "normal", cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            checked={(
                              preScreeningAnswers[question.id] || []
                            ).includes(option)}
                            onChange={(e) =>
                              handleCheckboxChange(
                                question.id,
                                option,
                                e.target.checked,
                              )
                            }
                            style={{ marginRight: "8px" }}
                          />
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === "range" && (
                  <div>
                    <input
                      type="number"
                      className="form-control"
                      value={preScreeningAnswers[question.id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(question.id, e.target.value)
                      }
                      min={question.minValue}
                      max={question.maxValue}
                      placeholder={`${question.minValue} - ${question.maxValue}`}
                    />
                    <small style={{ color: "#6B7280" }}>
                      Range: {question.minValue} to {question.maxValue}
                    </small>
                  </div>
                )}
              </div>
            ))}

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "32px",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowPreScreening(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowPreScreening(false);
                  applyForJob(jobDetails);
                }}
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      <br />
      <br />
    </div>
  );
}
