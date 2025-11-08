"use client";

import { useState } from "react";
import { useCareerFormStore } from "@/lib/hooks/useCareerFormStore";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import CareerFormCard from "./CareerFormCard";
import FormLabel from "./FormLabel";
import FormSectionHeader from "./FormSectionHeader";
import FormField from "./FormField";
import { errorToast } from "@/lib/Utils";

const screeningSettingList = [
  { name: "Good Fit and above", icon: "la la-check" },
  { name: "Only Strong Fit", icon: "la la-check-double" },
  { name: "No Automatic Promotion", icon: "la la-times" },
];

type QuestionCategory =
  | "cvValidation"
  | "technical"
  | "behavioral"
  | "analytical"
  | "others";

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  cvValidation: "CV Validation / Experience",
  technical: "Technical",
  behavioral: "Behavioral",
  analytical: "Analytical",
  others: "Others",
};

export default function Step3AIInterview() {
  const {
    aiInterviewScreeningSetting,
    requireVideo,
    aiInterviewSecretPrompt,
    aiInterviewQuestions,
    updateField,
    generateAIQuestions,
    addAIQuestion,
    removeAIQuestion,
    updateQuestionsToAsk,
    nextStep,
    previousStep,
    saveDraft,
    errors,
  } = useCareerFormStore();

  const [customQuestions, setCustomQuestions] = useState<
    Record<QuestionCategory, string>
  >({
    cvValidation: "",
    technical: "",
    behavioral: "",
    analytical: "",
    others: "",
  });

  const [generatingCategory, setGeneratingCategory] =
    useState<QuestionCategory | null>(null);

  const handleGenerateQuestions = async (category: QuestionCategory) => {
    setGeneratingCategory(category);
    try {
      await generateAIQuestions(category);
    } finally {
      setGeneratingCategory(null);
    }
  };

  const handleGenerateAll = async () => {
    setGeneratingCategory("cvValidation");
    try {
      const categories: QuestionCategory[] = [
        "cvValidation",
        "technical",
        "behavioral",
        "analytical",
        "others",
      ];
      for (const category of categories) {
        setGeneratingCategory(category);
        await generateAIQuestions(category);
      }
    } finally {
      setGeneratingCategory(null);
    }
  };

  const handleAddCustomQuestion = (category: QuestionCategory) => {
    const question = customQuestions[category].trim();
    if (!question) {
      errorToast("Please enter a question", 1300);
      return;
    }
    addAIQuestion(category, question);
    setCustomQuestions({ ...customQuestions, [category]: "" });
  };

  const handleNext = async () => {
    const totalQuestions = Object.values(aiInterviewQuestions).reduce(
      (sum, cat) => sum + cat.questions.length,
      0,
    );

    if (totalQuestions < 5) {
      errorToast("Please add at least 5 interview questions in total", 1300);
      return;
    }

    await nextStep();
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleSaveDraft = () => {
    saveDraft();
  };

  const totalQuestions = Object.values(aiInterviewQuestions).reduce(
    (sum, cat) => sum + cat.questions.length,
    0,
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "80%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <CareerFormCard heading="1. AI Interview Settings" icon="">
            <FormSectionHeader marginTop={8}>
              AI Interview Screening
            </FormSectionHeader>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}>
              Jia automatically endorses candidates who meet the chosen criteria
            </p>
            <FormField>
              <CustomDropdown
                onSelectSetting={(setting: string) => {
                  updateField("aiInterviewScreeningSetting", setting);
                }}
                screeningSetting={aiInterviewScreeningSetting}
                settingList={screeningSettingList}
                placeholder="Choose screening setting"
              />
            </FormField>

            <FormSectionHeader>Require Video on Interview</FormSectionHeader>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}>
              Require candidates to keep their camera on. Recordings will appear
              on their analysis page.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <label
                className="switch"
                style={{ margin: 0, display: "flex", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  checked={requireVideo}
                  onChange={() => updateField("requireVideo", !requireVideo)}
                />
                <span className="slider round"></span>
              </label>
              <span style={{ fontSize: 14, color: "#414651" }}>
                {requireVideo ? "Required" : "Optional"}
              </span>
            </div>

            <FormSectionHeader>AI Interview Secret Prompts</FormSectionHeader>
            <FormField>
              <textarea
                value={aiInterviewSecretPrompt}
                className="form-control"
                placeholder="Enter additional instructions for Jia's interview evaluation"
                onChange={(e) => {
                  updateField("aiInterviewSecretPrompt", e.target.value);
                }}
                style={{
                  minHeight: 100,
                  resize: "vertical",
                }}
              />
            </FormField>
          </CareerFormCard>

          <CareerFormCard heading="2. AI Interview Questions" icon="">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div>
                <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
                  Total Questions: {totalQuestions}{" "}
                  {totalQuestions < 5 && (
                    <span style={{ color: "#EF4444" }}>
                      (Minimum 5 required)
                    </span>
                  )}
                </p>
              </div>
              <button
                style={{
                  background: "#10B981",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: generatingCategory ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: generatingCategory ? 0.6 : 1,
                }}
                onClick={handleGenerateAll}
                disabled={!!generatingCategory}
              >
                <i className="la la-magic" style={{ fontSize: 16 }}></i>
                {generatingCategory
                  ? "Generating..."
                  : "Generate All Questions"}
              </button>
            </div>

            {(Object.keys(CATEGORY_LABELS) as QuestionCategory[]).map(
              (category) => (
                <div
                  key={category}
                  style={{
                    marginBottom: 24,
                    padding: 16,
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    background: "#FAFAFA",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                      {CATEGORY_LABELS[category]}
                    </h4>
                    <button
                      style={{
                        background: "#3B82F6",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: generatingCategory ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                        opacity: generatingCategory ? 0.6 : 1,
                      }}
                      onClick={() => handleGenerateQuestions(category)}
                      disabled={!!generatingCategory}
                    >
                      {generatingCategory === category ? (
                        <>
                          <i
                            className="la la-spinner la-spin"
                            style={{ marginRight: 4 }}
                          ></i>
                          Generating...
                        </>
                      ) : (
                        <>
                          <i
                            className="la la-magic"
                            style={{ marginRight: 4 }}
                          ></i>
                          Generate Questions
                        </>
                      )}
                    </button>
                  </div>

                  {/* Questions List */}
                  {aiInterviewQuestions[category].questions.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      {aiInterviewQuestions[category].questions.map(
                        (q, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "#fff",
                              border: "1px solid #E5E7EB",
                              borderRadius: 6,
                              padding: 12,
                              marginBottom: 8,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 14,
                                color: "#374151",
                                flex: 1,
                              }}
                            >
                              {idx + 1}. {q}
                            </span>
                            <button
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#EF4444",
                                cursor: "pointer",
                                padding: 4,
                              }}
                              onClick={() => removeAIQuestion(category, idx)}
                            >
                              <i
                                className="la la-trash"
                                style={{ fontSize: 16 }}
                              ></i>
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {/* Add Custom Question */}
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-end",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <FormLabel>Add Custom Question</FormLabel>
                        <input
                          value={customQuestions[category]}
                          className="form-control"
                          placeholder="Type your custom question here"
                          onChange={(e) =>
                            setCustomQuestions({
                              ...customQuestions,
                              [category]: e.target.value,
                            })
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddCustomQuestion(category);
                            }
                          }}
                        />
                      </div>
                      <button
                        style={{
                          background: "#fff",
                          color: "#3B82F6",
                          border: "1px solid #3B82F6",
                          padding: "10px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: 500,
                          height: "fit-content",
                        }}
                        onClick={() => handleAddCustomQuestion(category)}
                      >
                        <i
                          className="la la-plus"
                          style={{ fontSize: 14, marginRight: 4 }}
                        ></i>
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Questions to Ask */}
                  <FormField>
                    <FormLabel>
                      # of questions to ask from this category
                    </FormLabel>
                    <input
                      type="number"
                      min="0"
                      max={aiInterviewQuestions[category].questions.length}
                      value={aiInterviewQuestions[category].questionsToAsk}
                      className="form-control"
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const max =
                          aiInterviewQuestions[category].questions.length;
                        updateQuestionsToAsk(category, Math.min(value, max));
                      }}
                      style={{ width: 120 }}
                    />
                    <p style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                      Available questions:{" "}
                      {aiInterviewQuestions[category].questions.length}
                    </p>
                  </FormField>
                </div>
              ),
            )}
          </CareerFormCard>
        </div>

        <div
          style={{
            width: "20%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <CareerFormCard
            heading="Tips"
            iconBgColor="#181D27"
            customIcon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="bulbGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#9fcaed" />
                    <stop offset="50%" stopColor="#ceb6da" />
                    <stop offset="100%" stopColor="#ebacc9" />
                  </linearGradient>
                </defs>
                <path
                  d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 6v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6Z"
                  fill="url(#bulbGradient)"
                  stroke="url(#bulbGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 0,
                  fontSize: 14,
                  color: "#414651",
                  lineHeight: 1.6,
                }}
              >
                <li style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 500 }}>Mix question types</span> –
                  Balance technical, behavioral, and analytical questions for a
                  comprehensive evaluation.
                </li>
                <li style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 500 }}>Use AI generation</span> –
                  Let Jia generate questions based on your job description, then
                  customize as needed.
                </li>
                <li>
                  <span style={{ fontWeight: 500 }}>Keep it focused</span> – Aim
                  for 5-10 questions total to respect candidate time while
                  gathering sufficient insight.
                </li>
              </ul>
            </div>
          </CareerFormCard>
        </div>
      </div>
    </>
  );
}
