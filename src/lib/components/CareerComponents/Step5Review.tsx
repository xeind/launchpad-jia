"use client";

import { useState } from "react";
import { useCareerFormStore } from "@/lib/hooks/useCareerFormStore";
import CareerFormCard from "./CareerFormCard";
import FormLabel from "./FormLabel";
import { errorToast, successToast } from "@/lib/Utils";

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
    previousStep,
    saveDraft,
    submitCareer,
  } = useCareerFormStore();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["career-details"])
  );
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await submitCareer("active");
      successToast("Career published successfully!", 2000);
      // Additional logic to redirect or close modal can be added here
    } catch (error) {
      errorToast("Failed to publish career. Please try again.", 2000);
      console.error("Publish error:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const getTotalAIQuestions = () => {
    return (
      aiInterviewQuestions.cvValidation.questions.length +
      aiInterviewQuestions.technical.questions.length +
      aiInterviewQuestions.behavioral.questions.length +
      aiInterviewQuestions.analytical.questions.length +
      aiInterviewQuestions.others.questions.length
    );
  };

  const AccordionSection = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="border border-gray-200 rounded-lg mb-3">
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 rounded-lg transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isExpanded && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="mb-3">
      <div className="mb-1">
        <FormLabel>{label}</FormLabel>
      </div>
      <p className="text-gray-700">{value || "Not specified"}</p>
    </div>
  );

  return (
    <div className="row">
      {/* Main Content - 80% */}
      <div className="col-lg-9 col-md-8">
        <CareerFormCard
          heading="Review & Publish"
          icon="ni ni-eye"
        >
          {/* Section 1: Career Details */}
          <AccordionSection id="career-details" title="Career Details">
            <div className="row">
              <div className="col-md-6">
                <InfoRow label="Job Title" value={jobTitle} />
              </div>
              <div className="col-md-6">
                <InfoRow label="Employment Type" value={employmentType} />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <InfoRow label="Work Setup" value={workSetup} />
              </div>
              {workSetupRemarks && (
                <div className="col-md-6">
                  <InfoRow label="Setup Remarks" value={workSetupRemarks} />
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-md-4">
                <InfoRow label="Country" value={country} />
              </div>
              <div className="col-md-4">
                <InfoRow label="Province" value={province} />
              </div>
              <div className="col-md-4">
                <InfoRow label="City" value={city} />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <InfoRow
                  label="Salary Range"
                  value={`${currency} ${minimumSalary} - ${maximumSalary}${
                    salaryNegotiable ? " (Negotiable)" : ""
                  }`}
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="mb-1">
                <FormLabel>Job Description</FormLabel>
              </div>
              <div
                className="text-gray-700 p-3 bg-white border border-gray-200 rounded"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>

            {teamMembers.length > 0 && (
              <div className="mb-3">
                <div className="mb-2">
                  <FormLabel>Team Members</FormLabel>
                </div>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AccordionSection>


          {/* Section 2: CV Review & Pre-Screening */}
          <AccordionSection
            id="cv-review"
            title="CV Review & Pre-Screening Questions"
          >
            <InfoRow
              label="CV Screening Setting"
              value={cvScreeningSetting}
            />

            {cvSecretPrompt && (
              <div className="mb-3">
                <div className="mb-1">
                  <FormLabel>CV Secret Prompt</FormLabel>
                </div>
                <p className="text-gray-700 p-3 bg-white border border-gray-200 rounded">
                  {cvSecretPrompt}
                </p>
              </div>
            )}

            {preScreeningQuestions.length > 0 && (
              <div className="mb-3">
                <div className="mb-2">
                  <FormLabel>
                    Pre-Screening Questions ({preScreeningQuestions.length})
                  </FormLabel>
                </div>
                <div className="space-y-2">
                  {preScreeningQuestions.map((q, index) => (
                    <div
                      key={q.id}
                      className="p-3 bg-white border border-gray-200 rounded"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-800">
                          {index + 1}. {q.question}
                        </p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {q.type}
                          </span>
                          {q.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                      {q.type === "dropdown" && q.options && (
                        <p className="text-sm text-gray-600">
                          Options: {q.options.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preScreeningQuestions.length === 0 && (
              <p className="text-gray-500 italic">
                No pre-screening questions added
              </p>
            )}
          </AccordionSection>

          {/* Section 3: AI Interview Setup */}
          <AccordionSection id="ai-interview" title="AI Interview Setup">
            <div className="row">
              <div className="col-md-6">
                <InfoRow
                  label="AI Interview Screening"
                  value={aiInterviewScreeningSetting}
                />
              </div>
              <div className="col-md-6">
                <InfoRow
                  label="Video Requirement"
                  value={requireVideo ? "Required" : "Optional"}
                />
              </div>
            </div>

            {aiInterviewSecretPrompt && (
              <div className="mb-3">
                <div className="mb-1">
                  <FormLabel>AI Interview Secret Prompt</FormLabel>
                </div>
                <p className="text-gray-700 p-3 bg-white border border-gray-200 rounded">
                  {aiInterviewSecretPrompt}
                </p>
              </div>
            )}

            <div className="mb-3">
              <div className="mb-2">
                <FormLabel>
                  Interview Questions (Total: {getTotalAIQuestions()})
                </FormLabel>
              </div>

              {/* CV Validation Questions */}
              {aiInterviewQuestions.cvValidation.questions.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">
                      CV Validation Questions
                    </h4>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded">
                      Ask {aiInterviewQuestions.cvValidation.questionsToAsk} of{" "}
                      {aiInterviewQuestions.cvValidation.questions.length}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {aiInterviewQuestions.cvValidation.questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical Questions */}
              {aiInterviewQuestions.technical.questions.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">
                      Technical Questions
                    </h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                      Ask {aiInterviewQuestions.technical.questionsToAsk} of{" "}
                      {aiInterviewQuestions.technical.questions.length}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {aiInterviewQuestions.technical.questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Behavioral Questions */}
              {aiInterviewQuestions.behavioral.questions.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">
                      Behavioral Questions
                    </h4>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded">
                      Ask {aiInterviewQuestions.behavioral.questionsToAsk} of{" "}
                      {aiInterviewQuestions.behavioral.questions.length}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {aiInterviewQuestions.behavioral.questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Analytical Questions */}
              {aiInterviewQuestions.analytical.questions.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">
                      Analytical Questions
                    </h4>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded">
                      Ask {aiInterviewQuestions.analytical.questionsToAsk} of{" "}
                      {aiInterviewQuestions.analytical.questions.length}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {aiInterviewQuestions.analytical.questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Others Questions */}
              {aiInterviewQuestions.others.questions.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">
                      Other Questions
                    </h4>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      Ask {aiInterviewQuestions.others.questionsToAsk} of{" "}
                      {aiInterviewQuestions.others.questions.length}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {aiInterviewQuestions.others.questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {getTotalAIQuestions() === 0 && (
                <p className="text-gray-500 italic">
                  No interview questions added
                </p>
              )}
            </div>
          </AccordionSection>

          {/* Section 4: Pipeline Stages */}
          <AccordionSection id="pipeline-stages" title="Pipeline Stages">
            <div className="space-y-3">
              {pipelineStages.map((stage, index) => (
                <div
                  key={stage.id}
                  className={`p-4 rounded-lg ${
                    stage.isCore
                      ? "bg-blue-50 border-2 border-blue-200"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        {index + 1}. {stage.name}
                      </span>
                      {stage.isCore && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          Core Stage
                        </span>
                      )}
                    </div>
                  </div>

                  {stage.substages.length > 0 && (
                    <div className="ml-4 mt-2">
                      <p className="text-sm text-gray-600 mb-1">Substages:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {stage.substages.map((substage) => (
                          <li key={substage.id}>{substage.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {pipelineStages.length === 0 && (
              <p className="text-gray-500 italic">No pipeline stages configured</p>
            )}
          </AccordionSection>
        </CareerFormCard>
      </div>

      {/* Tips Sidebar - 20% */}
      <div className="col-lg-3 col-md-4">
        <div className="sticky-top" style={{ top: "20px" }}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">
              📋 Review Checklist
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Verify all career details are accurate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Check CV screening and pre-screening questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Review AI interview questions (min. 5 required)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Confirm pipeline stages and substages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Once published, the career will be live</span>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> You can save as draft to continue editing
                later, or publish to make the career live immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
