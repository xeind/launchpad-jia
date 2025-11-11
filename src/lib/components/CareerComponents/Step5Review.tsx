"use client";

import { useState } from "react";
import { useCareerFormStore } from "@/lib/hooks/useCareerFormStore";
import CareerFormCard from "./CareerFormCard";

export default function Step5Review() {
  const {
    // Step 1: Career Details
    jobTitle,
    employmentType,
    workSetup,
    workSetupRemarks,
    country,
    province,
    city,
    minimumSalary,
    maximumSalary,
    salaryNegotiable,
    currency,
    description,
    teamMembers,

    // Step 2: CV Review
    cvScreeningSetting,
    cvSecretPrompt,
    preScreeningQuestions,

    // Step 3: AI Interview
    aiInterviewScreeningSetting,
    requireVideo,
    aiInterviewSecretPrompt,
    aiInterviewQuestions,

    // Step 4: Pipeline Stages
    pipelineStages,

    // Actions
    goToStep,
  } = useCareerFormStore();

  const [expandedCards, setExpandedCards] = useState<Set<string>>(
    new Set(["career-details", "cv-review", "ai-interview", "pipeline-stages"]),
  );

  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const handleEdit = (
    step: "career-details" | "cv-review" | "ai-interview" | "pipeline-stages",
  ) => {
    goToStep(step);
  };

  const getTotalAIQuestions = () => {
    const total = aiInterviewQuestions.cvValidation.questions.length;
    aiInterviewQuestions.technical.questions.length;
    aiInterviewQuestions.behavioral.questions.length;
    aiInterviewQuestions.analytical.questions.length;
    aiInterviewQuestions.others.questions.length;
    return total;
  };

  const getQuestionBadgeStyle = (
    questionsToAsk: number,
    totalQuestions: number,
  ) => {
    if (questionsToAsk === totalQuestions) {
      return "rounded-lg bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700";
    }

    return "rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-blue-700";
  };

  const SummaryRow = ({
    label,
    value,
  }: {
    label: string | React.ReactNode;
    value: string | number | React.ReactNode;
  }) => (
    <div className="mb-1">
      <div className="mb-1 text-sm font-bold" style={{ color: "#181D27" }}>
        {label}
      </div>
      <div className="text-base font-medium" style={{ color: "#414651" }}>
        {value || <span className="italic text-gray-400">Not specified</span>}
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-row items-start justify-between gap-4">
      <div className="flex w-full flex-col gap-2">
        {/* Card 1: Career Details */}
        <CareerFormCard
          heading="1. Career Details"
          icon=""
          isExpanded={expandedCards.has("career-details")}
          onToggle={() => toggleCard("career-details")}
          headingAction={
            <button
              onClick={() => handleEdit("career-details")}
              className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent px-3 py-1.5 text-sm font-medium text-blue-500 hover:underline"
            >
              <i className="la la-pen"></i>
              Edit
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <SummaryRow label="Job Title" value={jobTitle} />
            <SummaryRow label="Employment Type" value={employmentType} />
          </div>

          <hr className="my-2 border-t border-gray-300" />

          <div className="grid grid-cols-2 gap-4">
            <SummaryRow label="Work Setup" value={workSetup} />
            {workSetupRemarks && (
              <SummaryRow label="Setup Remarks" value={workSetupRemarks} />
            )}
          </div>

          <hr className="my-2 border-t border-gray-300" />

          <div className="grid grid-cols-3 gap-4">
            <SummaryRow label="Country" value={country} />
            <SummaryRow label="Province" value={province} />
            <SummaryRow label="City" value={city} />
          </div>

          <hr className="my-2 border-t border-gray-300" />

          <SummaryRow
            label="Salary Range"
            value={`${currency} ${minimumSalary} - ${maximumSalary}${
              salaryNegotiable ? " (Negotiable)" : ""
            }`}
          />

          <hr className="my-2 border-t border-gray-300" />

          <SummaryRow
            label="Job Description"
            value={
              <div
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            }
          />

          {teamMembers.length > 0 && (
            <>
              <hr className="my-2 border-t border-gray-300" />
              <SummaryRow
                label={`Team Members (${teamMembers.length})`}
                value={
                  <div className="flex flex-col gap-2">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div>
                          <div
                            className="font-medium"
                            style={{ color: "#181D27" }}
                          >
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {member.email}
                          </div>
                        </div>
                        <span className="rounded-xl bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                }
              />
            </>
          )}
        </CareerFormCard>

        {/* Card 2: CV Review & Pre-Screening */}
        <CareerFormCard
          heading="2. CV Review & Pre-Screening Questions"
          icon=""
          isExpanded={expandedCards.has("cv-review")}
          onToggle={() => toggleCard("cv-review")}
          headingAction={
            <button
              onClick={() => handleEdit("cv-review")}
              className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent px-3 py-1.5 text-sm font-medium text-blue-500 hover:underline"
            >
              <i className="la la-pen"></i>
              Edit
            </button>
          }
        >
          <SummaryRow
            label="CV Screening Setting"
            value={
              cvScreeningSetting === "Good Fit and above" ? (
                <div>
                  Automatically endorse candidates who are{" "}
                  <span className="rounded border border-green-300 bg-green-50 px-2 py-0.5 text-sm font-medium text-green-700">
                    Good Fit
                  </span>{" "}
                  and above
                </div>
              ) : cvScreeningSetting === "Only Strong Fit" ? (
                <div>
                  Automatically endorse candidates who are{" "}
                  <span className="rounded border border-blue-300 bg-blue-50 px-2 py-0.5 text-sm font-medium text-blue-700">
                    Strong Fit
                  </span>{" "}
                  only
                </div>
              ) : (
                <div>
                  <span className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 text-sm font-medium text-gray-700">
                    No Automatic Promotion
                  </span>
                </div>
              )
            }
          />

          {cvSecretPrompt && (
            <>
              <hr className="my-2 border-t border-gray-300" />
              <SummaryRow
                label="CV Secret Prompt"
                value={<div className="text-gray-700">{cvSecretPrompt}</div>}
              />
            </>
          )}

          <hr className="my-2 border-t border-gray-300" />

          <SummaryRow
            label={
              <div className="flex items-center gap-2">
                <span>Pre-Screening Questions</span>
                <span className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700">
                  {preScreeningQuestions.length}
                </span>
              </div>
            }
            value={
              preScreeningQuestions.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {preScreeningQuestions.map((q, index) => (
                    <div
                      key={q.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="mb-1 flex items-start justify-between">
                        <div
                          className="flex-1 font-medium"
                          style={{ color: "#181D27" }}
                        >
                          {index + 1}. {q.question}
                        </div>
                        <div className="ml-3 flex flex-shrink-0 gap-1.5">
                          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {q.type}
                          </span>
                          {q.required && (
                            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                      {(q.type === "dropdown" || q.type === "checkboxes") &&
                        q.options &&
                        q.options.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {/* <div className="mb-1">Options:</div> */}
                            <ul className="text-md m-0 pl-4 leading-relaxed text-gray-700">
                              {q.options.map((option, idx) => (
                                <li key={idx}>• {option}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      {q.type === "range" && (
                        <div className="text-sm text-gray-600">
                          Range: {q.minValue} - {q.maxValue}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="italic text-gray-400">
                  No pre-screening questions added
                </span>
              )
            }
          />
        </CareerFormCard>

        {/* Card 3: AI Interview Setup */}
        <CareerFormCard
          heading="3. AI Interview Setup"
          icon=""
          isExpanded={expandedCards.has("ai-interview")}
          onToggle={() => toggleCard("ai-interview")}
          headingAction={
            <button
              onClick={() => handleEdit("ai-interview")}
              className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent px-3 py-1.5 text-sm font-medium text-blue-500 hover:underline"
            >
              <i className="la la-pen"></i>
              Edit
            </button>
          }
        >
          <SummaryRow
            label="AI Interview Screening"
            value={
              aiInterviewScreeningSetting === "Good Fit and above" ? (
                <div>
                  Automatically endorse candidates who are{" "}
                  <span className="rounded border border-green-300 bg-green-50 px-2 py-0.5 text-sm font-medium text-green-700">
                    Good Fit
                  </span>{" "}
                  and above
                </div>
              ) : aiInterviewScreeningSetting === "Only Strong Fit" ? (
                <div>
                  Automatically endorse candidates who are{" "}
                  <span className="rounded border border-blue-300 bg-blue-50 px-2 py-0.5 text-sm font-medium text-blue-700">
                    Strong Fit
                  </span>{" "}
                  only
                </div>
              ) : (
                <div>
                  <span className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 text-sm font-medium text-gray-700">
                    No Automatic Promotion
                  </span>
                </div>
              )
            }
          />

          <hr className="my-2 border-t border-gray-300" />

          <SummaryRow
            label="Video Requirement"
            value={requireVideo ? "Required" : "Optional"}
          />

          {aiInterviewSecretPrompt && (
            <>
              <hr className="my-2 border-t border-gray-300" />
              <SummaryRow
                label="AI Interview Secret Prompt"
                value={
                  <div className="text-gray-700">{aiInterviewSecretPrompt}</div>
                }
              />
            </>
          )}

          <hr className="my-2 border-t border-gray-300" />

          <SummaryRow
            label={
              <div className="flex items-center gap-2">
                <span>Interview Questions</span>
                <span className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700">
                  {getTotalAIQuestions()}
                </span>
              </div>
            }
            value={
              getTotalAIQuestions() > 0 ? (
                <div className="flex flex-col gap-4">
                  {(() => {
                    let questionNumber = 0;
                    return (
                      <>
                        {/* CV Validation Questions */}
                        {aiInterviewQuestions.cvValidation.questions.length >
                          0 && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <div
                                className="text-sm font-semibold"
                                style={{ color: "#181D27" }}
                              >
                                CV Validation / Experience
                              </div>
                              <span
                                className={getQuestionBadgeStyle(
                                  aiInterviewQuestions.cvValidation
                                    .questionsToAsk,
                                  aiInterviewQuestions.cvValidation.questions
                                    .length,
                                )}
                              >
                                Ask{" "}
                                {
                                  aiInterviewQuestions.cvValidation
                                    .questionsToAsk
                                }{" "}
                                of{" "}
                                {
                                  aiInterviewQuestions.cvValidation.questions
                                    .length
                                }
                              </span>
                            </div>
                            <ul className="text-md m-0 pl-4 leading-relaxed text-gray-700">
                              {aiInterviewQuestions.cvValidation.questions.map(
                                (q) => {
                                  questionNumber++;
                                  return (
                                    <li key={q.id}>
                                      <span className="font-bold">
                                        {questionNumber}
                                      </span>
                                      . {q.text}
                                    </li>
                                  );
                                },
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Technical Questions */}
                        {aiInterviewQuestions.technical.questions.length >
                          0 && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <div
                                className="text-sm font-semibold"
                                style={{ color: "#181D27" }}
                              >
                                Technical
                              </div>
                              <span
                                className={getQuestionBadgeStyle(
                                  aiInterviewQuestions.technical.questionsToAsk,
                                  aiInterviewQuestions.technical.questions
                                    .length,
                                )}
                              >
                                Ask{" "}
                                {aiInterviewQuestions.technical.questionsToAsk}{" "}
                                of{" "}
                                {
                                  aiInterviewQuestions.technical.questions
                                    .length
                                }
                              </span>
                            </div>
                            <ul className="text-md m-0 pl-4 leading-relaxed text-gray-700">
                              {aiInterviewQuestions.technical.questions.map(
                                (q) => {
                                  questionNumber++;
                                  return (
                                    <li key={q.id}>
                                      <span className="font-bold">
                                        {questionNumber}
                                      </span>
                                      . {q.text}
                                    </li>
                                  );
                                },
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Behavioral Questions */}
                        {aiInterviewQuestions.behavioral.questions.length >
                          0 && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <div
                                className="text-sm font-semibold"
                                style={{ color: "#181D27" }}
                              >
                                Behavioral
                              </div>
                              <span
                                className={getQuestionBadgeStyle(
                                  aiInterviewQuestions.behavioral
                                    .questionsToAsk,
                                  aiInterviewQuestions.behavioral.questions
                                    .length,
                                )}
                              >
                                Ask{" "}
                                {aiInterviewQuestions.behavioral.questionsToAsk}{" "}
                                of{" "}
                                {
                                  aiInterviewQuestions.behavioral.questions
                                    .length
                                }
                              </span>
                            </div>
                            <ul className="text-md m-0 pl-4 leading-relaxed text-gray-700">
                              {aiInterviewQuestions.behavioral.questions.map(
                                (q) => {
                                  questionNumber++;
                                  return (
                                    <li key={q.id}>
                                      <span className="font-bold">
                                        {questionNumber}
                                      </span>
                                      . {q.text}
                                    </li>
                                  );
                                },
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Analytical Questions */}
                        {aiInterviewQuestions.analytical.questions.length >
                          0 && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <div
                                className="text-sm font-semibold"
                                style={{ color: "#181D27" }}
                              >
                                Analytical
                              </div>
                              <span
                                className={getQuestionBadgeStyle(
                                  aiInterviewQuestions.analytical
                                    .questionsToAsk,
                                  aiInterviewQuestions.analytical.questions
                                    .length,
                                )}
                              >
                                Ask{" "}
                                {aiInterviewQuestions.analytical.questionsToAsk}{" "}
                                of{" "}
                                {
                                  aiInterviewQuestions.analytical.questions
                                    .length
                                }
                              </span>
                            </div>
                            <ul className="text-md m-0 pl-4 leading-relaxed text-gray-700">
                              {aiInterviewQuestions.analytical.questions.map(
                                (q) => {
                                  questionNumber++;
                                  return (
                                    <li key={q.id}>
                                      <span className="font-bold">
                                        {questionNumber}
                                      </span>
                                      . {q.text}
                                    </li>
                                  );
                                },
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Others Questions */}
                        {aiInterviewQuestions.others.questions.length > 0 && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <div
                                className="text-sm font-semibold"
                                style={{ color: "#181D27" }}
                              >
                                Others
                              </div>
                              <span
                                className={getQuestionBadgeStyle(
                                  aiInterviewQuestions.others.questionsToAsk,
                                  aiInterviewQuestions.others.questions.length,
                                )}
                              >
                                Ask {aiInterviewQuestions.others.questionsToAsk}{" "}
                                of{" "}
                                {aiInterviewQuestions.others.questions.length}
                              </span>
                            </div>
                            <ul className="text-md m-0 pl-4 leading-relaxed text-gray-700">
                              {aiInterviewQuestions.others.questions.map(
                                (q) => {
                                  questionNumber++;
                                  return (
                                    <li key={q.id}>
                                      <span className="font-bold">
                                        {questionNumber}
                                      </span>
                                      . {q.text}
                                    </li>
                                  );
                                },
                              )}
                            </ul>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <span className="italic text-gray-400">
                  No interview questions added
                </span>
              )
            }
          />
        </CareerFormCard>

        {/* Card 4: Pipeline Stages */}
        <CareerFormCard
          heading="4. Pipeline Stages"
          icon=""
          isExpanded={expandedCards.has("pipeline-stages")}
          onToggle={() => toggleCard("pipeline-stages")}
          headingAction={
            <button
              onClick={() => handleEdit("pipeline-stages")}
              className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent px-3 py-1.5 text-sm font-medium text-blue-500 hover:underline"
            >
              <i className="la la-pen"></i>
              Edit
            </button>
          }
        >
          {pipelineStages.length > 0 ? (
            <div className="flex flex-col gap-3">
              {pipelineStages.map((stage, index) => (
                <div key={stage.id}>
                  <div
                    className={`rounded-lg p-4 ${
                      stage.isCore
                        ? "border-2 border-blue-200 bg-blue-50"
                        : "border border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {index + 1}. {stage.name}
                        </span>
                        {stage.isCore && (
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            Core Stage
                          </span>
                        )}
                      </div>
                    </div>

                    {stage.substages.length > 0 && (
                      <div className="ml-4 mt-2">
                        <div className="mb-1.5 text-sm text-gray-600">
                          Substages:
                        </div>
                        <ul className="m-0 pl-5 text-sm leading-relaxed text-gray-600">
                          {stage.substages.map((substage) => (
                            <li key={substage.id}>{substage.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {index < pipelineStages.length - 1 && (
                    <hr className="my-2 border-t border-gray-300" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <span className="italic text-gray-400">
              No pipeline stages configured
            </span>
          )}
        </CareerFormCard>
      </div>
    </div>
  );
}
