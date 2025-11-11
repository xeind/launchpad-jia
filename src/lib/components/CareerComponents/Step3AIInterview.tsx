"use client";

import { useState } from "react";
import { useCareerFormStore } from "@/lib/hooks/useCareerFormStore";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import CareerFormCard from "./CareerFormCard";
import FormLabel from "./FormLabel";
import FormSectionHeader from "./FormSectionHeader";
import FormField from "./FormField";
import AIQuestionCard from "./AIQuestionCard";
import { errorToast } from "@/lib/Utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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
    generateAllAIQuestions,
    addAIQuestion,
    updateAIQuestion,
    removeAIQuestion,
    reorderAIQuestions,
    updateQuestionsToAsk,
    nextStep,
    previousStep,
    saveDraft,
    errors,
  } = useCareerFormStore();

  const [generatingCategory, setGeneratingCategory] =
    useState<QuestionCategory | null>(null);

  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [newQuestionIndex, setNewQuestionIndex] = useState<{
    category: QuestionCategory | null;
    index: number;
  }>({ category: null, index: -1 });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent, category: QuestionCategory) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const questions = aiInterviewQuestions[category].questions;
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      reorderAIQuestions(category, reorderedQuestions);
    }
  };

  const handleGenerateQuestions = async (category: QuestionCategory) => {
    setGeneratingCategory(category);
    try {
      await generateAIQuestions(category);
    } finally {
      setGeneratingCategory(null);
    }
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    try {
      await generateAllAIQuestions();
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleAddCustomQuestion = (category: QuestionCategory) => {
    addAIQuestion(category, "");
    const newIndex = aiInterviewQuestions[category].questions.length;
    setNewQuestionIndex({ category, index: newIndex });
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
      <div className="flex w-full flex-row items-start justify-between gap-4">
        <div className="flex w-4/5 flex-col gap-2">
          <CareerFormCard heading="1. AI Interview Settings" icon="">
            <FormSectionHeader marginTop={8}>
              AI Interview Screening
            </FormSectionHeader>
            <p className="text-md md-3 font-normal text-gray-600">
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

            <hr className="mb-2 mt-2 border-t border-gray-300" />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <FormSectionHeader marginTop={0}>
                Require Video on Interview
              </FormSectionHeader>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 14, color: "#414651" }}>
                  {requireVideo ? "Required" : "Optional"}
                </span>
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
              </div>
            </div>
            <p className="text-md mb-3 font-normal text-gray-600">
              Require candidates to keep their camera on. Recordings will appear
              on their analysis page.
            </p>

            <hr className="mb-2 mt-2 border-t border-gray-300" />

            <FormSectionHeader>AI Interview Secret Prompts</FormSectionHeader>
            <p className="text-md mb-3 font-normal text-gray-700">
              Secret Prompts give you extra control over Jia&apos;s evaluation
              style, complementing her accurate assessment of requirements from
              the job description.
            </p>
            <FormField>
              <textarea
                value={aiInterviewSecretPrompt}
                className="form-control answerInput !h-20 !resize-none !overflow-y-auto text-sm"
                placeholder="Enter a secret prompt (e.g. Treat candidates who speak in Taglish, English, or Tagalog equally. Focus on clarity, coherence, and confidence rather than language preference or accent.)"
                onChange={(e) => {
                  updateField("aiInterviewSecretPrompt", e.target.value);
                }}
              />
            </FormField>
          </CareerFormCard>

          <CareerFormCard
            heading="2. AI Interview Questions"
            icon=""
            headingBadge={
              <span
                style={{
                  background: totalQuestions < 5 ? "#FEE2E2" : "#DBEAFE",
                  color: totalQuestions < 5 ? "#DC2626" : "#1E40AF",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {totalQuestions}
              </span>
            }
            headingAction={
              <button
                style={{
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  cursor:
                    isGeneratingAll || generatingCategory
                      ? "not-allowed"
                      : "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: isGeneratingAll || generatingCategory ? 0.6 : 1,
                }}
                className="rounded-full bg-black"
                onClick={handleGenerateAll}
                disabled={isGeneratingAll || !!generatingCategory}
              >
                <i className="la la-magic"></i>
                {isGeneratingAll ? "Generating..." : "Generate all questions"}
              </button>
            }
          >
            {totalQuestions < 5 && (
              <p
                style={{
                  fontSize: 14,
                  color: "#EF4444",
                  marginTop: 0,
                  marginBottom: 16,
                }}
              >
                Minimum 5 questions required ({5 - totalQuestions} more needed)
              </p>
            )}

            {(Object.keys(CATEGORY_LABELS) as QuestionCategory[]).map(
              (category, index) => (
                <div key={category}>
                  {index > 0 && (
                    <hr className="my-4 border-t border-gray-300" />
                  )}

                  {/* Category Header */}
                  <FormSectionHeader marginBottom={8}>
                    {CATEGORY_LABELS[category]}
                  </FormSectionHeader>
                  {/* Questions List */}
                  {aiInterviewQuestions[category].questions.length > 0 ? (
                    <div style={{ marginBottom: 8 }}>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, category)}
                      >
                        <SortableContext
                          items={aiInterviewQuestions[category].questions.map(
                            (q) => q.id,
                          )}
                          strategy={verticalListSortingStrategy}
                        >
                          {aiInterviewQuestions[category].questions.map(
                            (q, idx) => (
                              <AIQuestionCard
                                key={q.id}
                                id={q.id}
                                question={q.text}
                                index={idx}
                                onUpdateAction={(questionText) =>
                                  updateAIQuestion(category, q.id, questionText)
                                }
                                onDeleteAction={() =>
                                  removeAIQuestion(category, q.id)
                                }
                                startInEditMode={
                                  newQuestionIndex.category === category &&
                                  newQuestionIndex.index === idx
                                }
                              />
                            ),
                          )}
                        </SortableContext>
                      </DndContext>
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: 14,
                        color: "#9CA3AF",
                        marginBottom: 16,
                        fontStyle: "italic",
                      }}
                    >
                      No questions added yet. Generate or add manually below.
                    </p>
                  )}

                  {/* Bottom row: Generate + Add Manually on left, Questions to Ask on right */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    {/* Left side: Action buttons */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <button
                        className="flex items-center gap-2 rounded-full border border-gray-600 bg-black px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handleGenerateQuestions(category)}
                        disabled={isGeneratingAll || !!generatingCategory}
                      >
                        {generatingCategory === category ? (
                          <>
                            <i className="la la-spinner la-spin"></i>
                            Generating...
                          </>
                        ) : (
                          <>
                            <i className="la la-magic"></i>
                            Generate questions
                          </>
                        )}
                      </button>

                      <button
                        className="flex items-center gap-2 rounded-full border border-gray-600 bg-white px-4 py-2 text-sm font-bold text-black"
                        onClick={() => handleAddCustomQuestion(category)}
                      >
                        <i className="la la-plus"></i>
                        Add Manually
                      </button>
                    </div>

                    {/* Right side: Questions to Ask */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 14, color: "#374151" }}>
                        Questions to ask
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={aiInterviewQuestions[category].questions.length}
                        value={
                          aiInterviewQuestions[category].questionsToAsk === 0
                            ? ""
                            : aiInterviewQuestions[category].questionsToAsk
                        }
                        className="form-control"
                        placeholder="0"
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value);
                          const max =
                            aiInterviewQuestions[category].questions.length;
                          updateQuestionsToAsk(
                            category,
                            Math.min(Math.max(0, value), max),
                          );
                        }}
                        onFocus={(e) => e.target.select()}
                        style={{
                          width: 60,
                          textAlign: "center",
                          padding: "8px 4px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ),
            )}
          </CareerFormCard>
        </div>

        <div className="sticky top-4 flex w-1/5 flex-col gap-2 self-start">
          <CareerFormCard
            heading="Tips"
            iconBgColor="transparent"
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
            <div className="flex flex-col gap-3">
              <p className="m-0 text-sm leading-relaxed text-gray-700">
                <span className="font-semibold">Mix question types</span> –
                Balance technical, behavioral, and analytical questions for a
                comprehensive evaluation.
              </p>
              <p className="m-0 text-sm leading-relaxed text-gray-700">
                <span className="font-semibold">Use AI generation</span> – Let
                Jia generate questions based on your job description, then
                customize as needed.
              </p>
              <p className="m-0 text-sm leading-relaxed text-gray-700">
                <span className="font-semibold">Keep it focused</span> – Aim for
                5-10 questions total to respect candidate time while gathering
                sufficient insight.
              </p>
            </div>
          </CareerFormCard>
        </div>
      </div>
    </>
  );
}
