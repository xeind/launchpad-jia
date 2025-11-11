// TODO (Job Portal) - Check API

"use client";

import Loader from "@/lib/components/commonV2/Loader";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import styles from "@/lib/styles/screens/uploadCV.module.scss";
import { useAppContext } from "@/lib/context/ContextV2";
import { assetConstants, pathConstants } from "@/lib/utils/constantsV2";
import { checkFile } from "@/lib/utils/helpersV2";
import { CORE_API_URL } from "@/lib/Utils";
import axios from "axios";
import Markdown from "react-markdown";
import { useCallback, useEffect, useRef, useState } from "react";

export default function () {
  const fileInputRef = useRef(null);
  const { user, setModalType } = useAppContext();
  const [buildingCV, setBuildingCV] = useState(false);
  const [screeningCV, setScreeningCV] = useState(false);
  const [transitioningToReview, setTransitioningToReview] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [digitalCV, setDigitalCV] = useState(null);
  const [editingCV, setEditingCV] = useState(null);
  const [file, setFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [screeningResult, setScreeningResult] = useState(null);
  const [userCV, setUserCV] = useState(null);
  const [preScreeningAnswers, setPreScreeningAnswers] = useState({});
  const [preScreeningErrors, setPreScreeningErrors] = useState({});
  const cvSections = [
    "Introduction",
    "Current Position",
    "Contact Info",
    "Skills",
    "Experience",
    "Education",
    "Projects",
    "Certifications",
    "Awards",
  ];
  const step = ["Submit CV", "Pre-Screening Questions", "Review"];
  const stepStatus = ["Completed", "Pending", "In Progress"];

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files);
  }

  function handleEditCV(section) {
    setEditingCV(section);

    if (section != null) {
      setTimeout(() => {
        const sectionDetails = document.getElementById(section);

        if (sectionDetails) {
          sectionDetails.focus();
        }
      }, 100);
    }
  }

  function handleFile(files) {
    const file = checkFile(files);

    if (file) {
      setFile(file);
      handleFileSubmit(file);
    }
  }

  function handleFileChange(e) {
    const files = e.target.files;

    if (files.length > 0) {
      handleFile(files);
    }
  }

  function handleModal() {
    setModalType("jobDescription");
  }

  function handleRedirection(type) {
    if (type == "dashboard") {
      window.location.href = pathConstants.dashboard;
    }

    if (type == "interview") {
      sessionStorage.setItem("interviewRedirection", pathConstants.dashboard);
      window.location.href = `/interview/${interview.interviewID}`;
    }
  }

  function handleRemoveFile(e) {
    e.stopPropagation();
    e.target.value = "";

    setFile(null);
    setHasChanges(false);
    setUserCV(null);

    const storedCV = localStorage.getItem("userCV");

    if (storedCV != "null") {
      setDigitalCV(storedCV);
    } else {
      setDigitalCV(null);
    }
  }

  function handleReviewCV() {
    const parsedUserCV = JSON.parse(digitalCV);
    const formattedCV = {};

    cvSections.forEach((section, index) => {
      formattedCV[section] = parsedUserCV.digitalCV[index].content.trim() || "";
    });

    setFile(parsedUserCV.fileInfo);
    setUserCV(formattedCV);
  }

  function handleUploadCV() {
    fileInputRef.current.click();
  }

  function handleSkipCV() {
    setCurrentStep(step[1]);
  }

  function processState(index, isAdvance = false) {
    const currentStepIndex = step.indexOf(currentStep);

    if (currentStepIndex == index) {
      if (index == stepStatus.length - 1) {
        return stepStatus[0];
      }

      return isAdvance || userCV || buildingCV ? stepStatus[2] : stepStatus[1];
    }

    if (currentStepIndex > index) {
      return stepStatus[0];
    }

    return stepStatus[1];
  }

  useEffect(() => {
    const storedSelectedCareer = sessionStorage.getItem("selectedCareer");
    const storedCV = localStorage.getItem("userCV");

    if (storedCV && storedCV != "null") {
      setDigitalCV(storedCV);
    }

    if (storedSelectedCareer) {
      const parseStoredSelectedCareer = JSON.parse(storedSelectedCareer);
      fetchInterview(parseStoredSelectedCareer.interviewID);
    } else {
      alert("No application is currently being managed.");
      window.location.href = pathConstants.dashboard;
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("hasChanges", JSON.stringify(hasChanges));
  }, [hasChanges]);

  useEffect(() => {
    const handleFocus = () => {
      if (interview?.interviewID) {
        fetchInterview(interview.interviewID);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [interview?.interviewID]); // eslint-disable-line react-hooks/exhaustive-deps

  function fetchInterview(interviewID) {
    axios({
      method: "POST",
      url: "/api/job-portal/fetch-interviews",
      data: { email: user.email, interviewID, _t: Date.now() },
    })
      .then((res) => {
        const result = res.data;

        if (result.error) {
          alert(result.error);
          window.location.href = pathConstants.dashboard;
        } else {
          if (result[0].cvStatus) {
            alert("This application has already been processed.");
            window.location.href = pathConstants.dashboard;
          } else {
            console.log("🔍 [UploadCV] Interview data:", result[0]);
            console.log("🔍 [UploadCV] Career data:", result[0].career);
            console.log(
              "🔍 [UploadCV] Pre-screening questions:",
              result[0].career?.preScreeningQuestions,
            );
            console.log(
              "🔍 [UploadCV] Interview has embedded questions:",
              result[0].preScreeningQuestions,
            );
            setCurrentStep(step[0]);
            setInterview(result[0]);

            // Initialize pre-screening answers with defaults for range questions
            const initialAnswers = {};
            result[0].career?.preScreeningQuestions?.forEach((question) => {
              if (question.type === "range") {
                initialAnswers[question.id] = question.minValue || 0;
              }
            });
            setPreScreeningAnswers(initialAnswers);

            setLoading(false);
          }
        }
      })
      .catch((err) => {
        alert("Error fetching existing applied jobs.");
        window.location.href = pathConstants.dashboard;
        console.log(err);
      });
  }

  function handleContinueToPreScreening() {
    if (editingCV != null) {
      alert("Please save the changes first.");
      return false;
    }

    if (userCV) {
      const allEmpty = Object.values(userCV).every(
        (value: any) => value.trim() == "",
      );

      if (allEmpty) {
        alert("No details to be save.");
        return false;
      }
    }

    let parsedDigitalCV = {
      errorRemarks: null,
      digitalCV: null,
    };

    if (digitalCV) {
      parsedDigitalCV = JSON.parse(digitalCV);

      if (parsedDigitalCV.errorRemarks) {
        alert(
          `Please fix the errors in the CV first.\n\n${parsedDigitalCV.errorRemarks}`,
        );
        return false;
      }
    }

    // Save CV if there are changes
    if (hasChanges && userCV) {
      const formattedUserCV = cvSections.map((section) => ({
        name: section,
        content: userCV[section]?.trim() || "",
      }));

      parsedDigitalCV.digitalCV = formattedUserCV;

      const data = {
        name: user.name,
        cvData: parsedDigitalCV,
        email: user.email,
        fileInfo: null,
      };

      if (file) {
        data.fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
        };
      }

      axios({
        method: "POST",
        url: `/api/whitecloak/save-cv`,
        data,
      })
        .then(() => {
          localStorage.setItem(
            "userCV",
            JSON.stringify({ ...data, ...data.cvData }),
          );
        })
        .catch((err) => {
          alert("Error saving CV. Please try again.");
          console.log(err);
        });
    }

    // Move to Pre-Screening Questions
    setCurrentStep(step[1]);
    setHasChanges(false);
  }

  function handleCVScreen() {
    // Validate pre-screening answers
    const requiredQuestions =
      interview?.career?.preScreeningQuestions?.filter((q) => q.required) || [];

    const missingAnswers = requiredQuestions.filter((q) => {
      const answer = preScreeningAnswers[q.id];

      // Handle different answer types
      if (!answer) return true; // No answer provided
      if (Array.isArray(answer)) return answer.length === 0; // Checkbox with no selections
      if (typeof answer === "string") return answer.trim() === ""; // Text/dropdown with empty string
      if (typeof answer === "number") return false; // Range always has a value

      return false; // Other types are considered valid if present
    });

    if (missingAnswers.length > 0) {
      alert("Please answer all required questions before continuing.");
      return false;
    }

    setScreeningCV(true);
    setHasChanges(true);

    axios({
      url: "/api/whitecloak/screen-cv",
      method: "POST",
      data: {
        interviewID: interview.interviewID,
        userEmail: user.email,
        preScreeningAnswers,
      },
    })
      .then((res) => {
        const result = res.data;

        if (result.error) {
          alert(result.message);
        } else {
          setScreeningResult(result);
          setTransitioningToReview(true);
          // Show loading for a brief moment before moving to review
          setTimeout(() => {
            setCurrentStep(step[2]); // Move to Review after success
            setTransitioningToReview(false);
          }, 1500);
        }
      })
      .catch((err) => {
        alert("Error screening CV. Please try again.");
        console.log(err);
      })
      .finally(() => {
        setScreeningCV(false);
        setHasChanges(false);
      });
  }

  function handleFileSubmit(file) {
    setBuildingCV(true);
    setHasChanges(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fName", file.name);
    formData.append("userEmail", user.email);

    axios({
      method: "POST",
      url: `${CORE_API_URL}/upload-cv`,
      data: formData,
    })
      .then((res) => {
        axios({
          method: "POST",
          url: `/api/whitecloak/digitalize-cv`,
          data: { chunks: res.data.cvChunks },
        })
          .then((res) => {
            const result = res.data.result;
            const parsedUserCV = JSON.parse(result);
            const formattedCV = {};

            cvSections.forEach((section, index) => {
              formattedCV[section] =
                parsedUserCV.digitalCV[index].content.trim();
            });

            setDigitalCV(result);
            setUserCV(formattedCV);
          })
          .catch((err) => {
            alert("Error building CV. Please try again.");
            console.log(err);
          })
          .finally(() => {
            setBuildingCV(false);
          });
      })
      .catch((err) => {
        alert("Error building CV. Please try again.");
        setBuildingCV(false);
        console.log(err);
      });
  }

  return (
    <>
      {loading && <Loader loaderData={""} loaderType={""} />}

      {interview && (
        <div className={styles.uploadCVContainer}>
          <div className={styles.uploadCVHeader}>
            {interview.organization && interview.organization.image && (
              <img alt="" src={interview.organization.image} />
            )}
            <div className={styles.textContainer}>
              <span className={styles.tag}>You're applying for</span>
              <span className={styles.title}>{interview.jobTitle}</span>
              {interview.organization && interview.organization.name && (
                <span className={styles.name}>
                  {interview.organization.name}
                </span>
              )}
              <span className={styles.description} onClick={handleModal}>
                View job description
              </span>
            </div>
          </div>

          <div className={styles.stepContainer}>
            <div className={styles.step}>
              {step.map((_, index) => (
                <div className={styles.stepBar} key={index}>
                  <img
                    alt=""
                    src={
                      assetConstants[
                        processState(index, true)
                          .toLowerCase()
                          .replace(" ", "_")
                      ]
                    }
                  />
                  {index < step.length - 1 && (
                    <hr
                      className={
                        styles[
                          processState(index).toLowerCase().replace(" ", "_")
                        ]
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <div className={styles.step}>
              {step.map((item, index) => (
                <span
                  className={`${styles.stepDetails} ${
                    styles[
                      processState(index, true).toLowerCase().replace(" ", "_")
                    ]
                  }`}
                  key={index}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {currentStep == step[0] && (
            <>
              {!buildingCV && !userCV && !file && (
                <div className={styles.cvManageContainer}>
                  <div
                    className={styles.cvContainer}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <img alt="" src={assetConstants.uploadV2} />
                    <button onClick={handleUploadCV}>Upload CV</button>
                    <span>
                      Choose or drag and drop a file here. Our AI tools will
                      automatically pre-fill your CV and also check how well it
                      matches the role.
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />

                  <div className={styles.cvContainer}>
                    <img alt="" src={assetConstants.review} />
                    <button
                      className={`${digitalCV ? "" : "disabled"}`}
                      disabled={!digitalCV}
                      onClick={handleReviewCV}
                    >
                      Review Current CV
                    </button>
                    <span>
                      Already uploaded a CV? Take a moment to review your
                      details before we proceed.
                    </span>
                  </div>

                  <div className={styles.cvContainer}>
                    <img alt="" src={assetConstants.arrow} />
                    <button onClick={handleSkipCV}>Skip CV Upload</button>
                    <span>
                      For demo purposes, skip CV upload and proceed directly to
                      pre-screening questions.
                    </span>
                  </div>
                </div>
              )}

              {buildingCV && file && (
                <div className={styles.cvDetailsContainer}>
                  <div className={styles.gradient}>
                    <div className={styles.cvDetailsCard}>
                      <span className={styles.sectionTitle}>
                        <img alt="" src={assetConstants.account} />
                        Submit CV
                      </span>
                      <div className={styles.detailsContainer}>
                        <span className={styles.fileTitle}>
                          <img alt="" src={assetConstants.completed} />
                          {file.name}
                        </span>
                        <div className={styles.loadingContainer}>
                          <img alt="" src={assetConstants.loading} />
                          <div className={styles.textContainer}>
                            <span className={styles.title}>
                              Extracting information from your CV...
                            </span>
                            <span className={styles.description}>
                              Jia is building your profile...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!buildingCV && userCV && (
                <div className={styles.cvDetailsContainer}>
                  <div className={styles.gradient}>
                    <div className={styles.cvDetailsCard}>
                      <span className={styles.sectionTitle}>
                        <img alt="" src={assetConstants.account} />
                        Submit CV
                        <div className={styles.editIcon}>
                          <img
                            alt=""
                            src={
                              file ? assetConstants.xV2 : assetConstants.save
                            }
                            onClick={file ? handleRemoveFile : handleUploadCV}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          style={{ display: "none" }}
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                      </span>

                      <div className={styles.detailsContainer}>
                        {file ? (
                          <span className={styles.fileTitle}>
                            <img alt="" src={assetConstants.completed} />
                            {file.name}
                          </span>
                        ) : (
                          <span className={styles.fileTitle}>
                            <img alt="" src={assetConstants.fileV2} />
                            You can also upload your CV and let our AI
                            automatically fill in your profile information.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {cvSections.map((section, index) => (
                    <div key={index} className={styles.gradient}>
                      <div className={styles.cvDetailsCard}>
                        <span className={styles.sectionTitle}>
                          {section}

                          <div className={styles.editIcon}>
                            <img
                              alt=""
                              src={
                                editingCV == section
                                  ? assetConstants.save
                                  : assetConstants.edit
                              }
                              onClick={() =>
                                handleEditCV(
                                  editingCV == section ? null : section,
                                )
                              }
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          </div>
                        </span>

                        <div className={styles.detailsContainer}>
                          {editingCV == section ? (
                            <textarea
                              id={section}
                              placeholder="Upload your CV to auto-fill this section."
                              value={
                                userCV && userCV[section] ? userCV[section] : ""
                              }
                              onBlur={(e) => {
                                e.target.placeholder =
                                  "Upload your CV to auto-fill this section.";
                              }}
                              onChange={(e) => {
                                setUserCV({
                                  ...userCV,
                                  [section]: e.target.value,
                                });
                                setHasChanges(true);
                              }}
                              onFocus={(e) => {
                                e.target.placeholder = "";
                              }}
                            />
                          ) : (
                            <span
                              className={`${styles.sectionDetails} ${
                                userCV &&
                                userCV[section] &&
                                userCV[section].trim()
                                  ? styles.withDetails
                                  : ""
                              }`}
                            >
                              <Markdown>
                                {userCV &&
                                userCV[section] &&
                                userCV[section].trim()
                                  ? userCV[section].trim()
                                  : "Upload your CV to auto-fill this section."}
                              </Markdown>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    className={styles.submitButton}
                    onClick={handleContinueToPreScreening}
                  >
                    Continue →
                  </button>
                </div>
              )}
            </>
          )}

          {currentStep == step[1] && (
            <div className={styles.cvDetailsContainer}>
              {transitioningToReview ? (
                <div className={styles.gradient}>
                  <div className={styles.cvDetailsCard}>
                    <span className={styles.sectionTitle}>
                      <img alt="" src={assetConstants.account} />
                      Processing Results
                    </span>
                    <div className={styles.detailsContainer}>
                      <div className={styles.loadingContainer}>
                        <img alt="" src={assetConstants.loading} />
                        <div className={styles.textContainer}>
                          <span className={styles.title}>Sit tight!</span>
                          <span className={styles.description}>
                            We're analyzing your responses and preparing your
                            results...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : screeningCV ? (
                <div className={styles.gradient}>
                  <div className={styles.cvDetailsCard}>
                    <span className={styles.sectionTitle}>
                      <img alt="" src={assetConstants.account} />
                      Pre-Screening Questions
                    </span>
                    <div className={styles.detailsContainer}>
                      <div className={styles.loadingContainer}>
                        <img alt="" src={assetConstants.loading} />
                        <div className={styles.textContainer}>
                          <span className={styles.title}>
                            Processing your answers...
                          </span>
                          <span className={styles.description}>
                            Jia is reviewing your pre-screening responses...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !interview?.career?.preScreeningQuestions ||
                interview?.career?.preScreeningQuestions?.length === 0 ? (
                <>
                  <div className={styles.gradient}>
                    <div className={styles.cvDetailsCard}>
                      <span className={styles.sectionTitle}>
                        <img alt="" src={assetConstants.account} />
                        Pre-Screening Questions
                      </span>
                      <div className={styles.detailsContainer}>
                        <p className={styles.fileTitle}>
                          No pre-screening questions are configured for this
                          position.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    className={styles.submitButton}
                    onClick={handleCVScreen}
                  >
                    Continue →
                  </button>
                </>
              ) : (
                <>
                  <h1 className="text-lg font-bold">Quick Pre-Screening</h1>
                  <p className="mb-4 text-gray-600">
                    Just a few short questions to help your recruiters assess
                    you faster. Takes less than a minute.
                  </p>

                  {interview?.career?.preScreeningQuestions?.map(
                    (question, index) => (
                      <div key={question.id} className={styles.gradient}>
                        <div className={styles.cvDetailsCard}>
                          <h3 className={styles.sectionTitle}>
                            {question.question}
                            {question.required && (
                              <span style={{ color: "red" }}> *</span>
                            )}
                          </h3>
                          <div className={styles.detailsContainer}>
                            {question.type === "short-answer" && (
                              <input
                                type="text"
                                className={`form-control ${styles.answerInput}`}
                                placeholder="Your answer..."
                                value={preScreeningAnswers[question.id] || ""}
                                onChange={(e) =>
                                  setPreScreeningAnswers({
                                    ...preScreeningAnswers,
                                    [question.id]: e.target.value,
                                  })
                                }
                                style={{ padding: 4 }}
                              />
                            )}

                            {question.type === "long-answer" && (
                              <textarea
                                className={`form-control ${styles.answerTextarea}`}
                                placeholder="Your answer..."
                                rows={4}
                                value={preScreeningAnswers[question.id] || ""}
                                onChange={(e) =>
                                  setPreScreeningAnswers({
                                    ...preScreeningAnswers,
                                    [question.id]: e.target.value,
                                  })
                                }
                                style={{ padding: 4 }}
                              />
                            )}

                            {question.type === "dropdown" && (
                              <CustomDropdown
                                onSelectSetting={(selectedValue: string) => {
                                  setPreScreeningAnswers({
                                    ...preScreeningAnswers,
                                    [question.id]: selectedValue,
                                  });
                                }}
                                screeningSetting={
                                  preScreeningAnswers[question.id] || ""
                                }
                                settingList={
                                  question.options?.map((option) => ({
                                    name: option,
                                  })) || []
                                }
                                placeholder="Select an option"
                              />
                            )}

                            {question.type === "checkboxes" && (
                              <div className="space-y-3">
                                {question.options?.map((option, i) => (
                                  <label
                                    key={i}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                                  >
                                    <input
                                      type="checkbox"
                                      value={option}
                                      checked={(
                                        preScreeningAnswers[question.id] || []
                                      ).includes(option)}
                                      onChange={(e) => {
                                        const current =
                                          preScreeningAnswers[question.id] ||
                                          [];
                                        const updated = e.target.checked
                                          ? [...current, option]
                                          : current.filter((v) => v !== option);
                                        setPreScreeningAnswers({
                                          ...preScreeningAnswers,
                                          [question.id]: updated,
                                        });
                                      }}
                                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-gray-700">
                                      {option}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {question.type === "range" && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="number"
                                    min={question.minValue || 0}
                                    max={question.maxValue || 10}
                                    step="1"
                                    value={
                                      preScreeningAnswers[question.id] ||
                                      question.minValue ||
                                      0
                                    }
                                    onChange={(e) =>
                                      setPreScreeningAnswers({
                                        ...preScreeningAnswers,
                                        [question.id]:
                                          parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="answerInput flex-1"
                                    placeholder={`Enter value (${question.minValue || 0} - ${question.maxValue || 10})`}
                                  />
                                  <span className="whitespace-nowrap text-sm text-gray-500">
                                    Range: {question.minValue || 0} -{" "}
                                    {question.maxValue || 10}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  )}

                  <button
                    className={styles.submitButton}
                    onClick={handleCVScreen}
                  >
                    Continue →
                  </button>
                </>
              )}
            </div>
          )}

          {currentStep == step[2] && screeningResult && (
            <div className={styles.cvResultContainer}>
              {screeningResult.applicationStatus == "Dropped" ? (
                <>
                  <img alt="" src={assetConstants.userRejected} />
                  <span className={styles.title}>
                    This role may not be the best match.
                  </span>
                  <span className={styles.description}>
                    Based on your CV, it looks like this position might not be
                    the right fit at the moment.
                  </span>
                  <br />
                  <span className={styles.description}>
                    Review your screening results and see recommended next
                    steps.
                  </span>
                  <div className={styles.buttonContainer}>
                    <button onClick={() => handleRedirection("dashboard")}>
                      View Dashboard
                    </button>
                  </div>
                </>
              ) : screeningResult.status == "For AI Interview" ? (
                <>
                  <img alt="" src={assetConstants.checkV3} />
                  <span className={styles.title}>
                    Hooray! You’re a strong fit for this role.
                  </span>
                  <span className={styles.description}>
                    Jia thinks you might be a great match.
                  </span>
                  <br />
                  <span className={`${styles.description} ${styles.bold}`}>
                    Ready to take the next step?
                  </span>
                  <span className={styles.description}>
                    You may start your AI interview now.
                  </span>
                  <div className={styles.buttonContainer}>
                    <button onClick={() => handleRedirection("interview")}>
                      Start AI Interview
                    </button>
                    <button
                      className="secondaryBtn"
                      onClick={() => handleRedirection("dashboard")}
                    >
                      View Dashboard
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <img alt="" src={assetConstants.userCheck} />
                  <span className={styles.title}>
                    Your CV is now being reviewed by the hiring team.
                  </span>
                  <span className={styles.description}>
                    We’ll be in touch soon with updates about your application.
                  </span>
                  <div className={styles.buttonContainer}>
                    <button onClick={() => handleRedirection("dashboard")}>
                      View Dashboard
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
