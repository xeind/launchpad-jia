"use client";

import { useState } from "react";
import { useCareerFormStore } from "@/lib/hooks/useCareerFormStore";
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
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import CareerFormCard from "./CareerFormCard";
import FormSectionHeader from "./FormSectionHeader";
import FormField from "./FormField";
import QuestionCard from "./QuestionCard";

const screeningSettingList = [
  { name: "Good Fit and above", icon: "la la-check" },
  { name: "Only Strong Fit", icon: "la la-check-double" },
  { name: "No Automatic Promotion", icon: "la la-times" },
];

const SUGGESTED_QUESTIONS = [
  {
    id: "notice-period",
    header: "Notice Period",
    question: "How long is your notice period?",
    type: "dropdown" as const,
    options: ["Immediately", "Less than 30 days", "More than 30 days"],
  },
  {
    id: "work-setup",
    header: "Work Setup",
    question: "How often are you willing to report to the office each week?",
    type: "dropdown" as const,
    options: ["Fully Remote", "1-2 days", "3-4 days", "5 days (Onsite)"],
  },
  {
    id: "asking-salary",
    header: "Asking Salary",
    question: "How much is your expected monthly salary?",
    type: "short-answer" as const,
    options: [],
  },
];

export default function Step2CVReview() {
  const {
    cvScreeningSetting,
    cvSecretPrompt,
    preScreeningQuestions,
    updateField,
    addPreScreeningQuestion,
    removePreScreeningQuestion,
    updatePreScreeningQuestion,
    reorderPreScreeningQuestions,
    errors,
  } = useCareerFormStore();

  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = preScreeningQuestions.findIndex(
        (q) => q.id === active.id,
      );
      const newIndex = preScreeningQuestions.findIndex((q) => q.id === over.id);

      const newQuestions = arrayMove(preScreeningQuestions, oldIndex, newIndex);
      reorderPreScreeningQuestions(newQuestions);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `question-${Date.now()}`,
      question: "",
      type: "short-answer" as const,
      options: [],
      required: true,
    };
    addPreScreeningQuestion(newQuestion);
    setIsAddingQuestion(false);
  };

  const handleAddSuggestedQuestion = (
    suggested: (typeof SUGGESTED_QUESTIONS)[0],
  ) => {
    const newQuestion = {
      id: `${suggested.id}-${Date.now()}`,
      question: suggested.question,
      type: suggested.type,
      options: suggested.options,
      required: true,
    };
    addPreScreeningQuestion(newQuestion);
  };

  // Helper to check if a suggested question has been added
  const isQuestionAdded = (suggestedId: string) => {
    return preScreeningQuestions.some((q) => {
      const baseId = q.id.split("-").slice(0, -1).join("-");
      return baseId === suggestedId;
    });
  };

  return (
    <>
      <div className="flex flex-row justify-between w-full gap-4 items-start">
        <div className="w-4/5 flex flex-col gap-2">
          <CareerFormCard heading="1. CV Review Settings" icon="">
            <FormSectionHeader marginTop={8}>CV Screening</FormSectionHeader>
            <p className="text-md font-normal text-gray-600 mb-3">
              Jia automatically endorses candidates who meet the chosen criteria
            </p>
            <FormField>
              <CustomDropdown
                onSelectSetting={(setting: string) => {
                  updateField("cvScreeningSetting", setting);
                }}
                screeningSetting={cvScreeningSetting}
                settingList={screeningSettingList}
                placeholder="Choose screening setting"
                boldSelected={true}
              />
            </FormField>

            <hr className="border-t border-gray-300 mt-2 mb-2" />

            <FormSectionHeader>CV Secret Prompt</FormSectionHeader>
            <p className="text-md font-normal text-gray-600 mb-3">
              Secret Prompts give you extra control over Jia&apos;s evaluation
              style, complementing her accurate assessment of requirements from
              the job description.
            </p>
            <FormField>
              <textarea
                value={cvSecretPrompt}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg !resize-none !h-20 !overflow-y-auto text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Give higher fit scores to candidates who participate in hackathons or competitions"
                onChange={(e) => {
                  updateField("cvSecretPrompt", e.target.value);
                }}
              />
            </FormField>
          </CareerFormCard>

          <CareerFormCard heading="2. Pre-Screening Questions" icon="">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-md text-gray-600">
                  Required - Add at least 1 question
                </span>
                {errors.preScreeningQuestions && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.preScreeningQuestions}
                  </p>
                )}
              </div>
              <button
                className="bg-black text-white px-4 py-2 rounded-full cursor-pointer text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
                onClick={handleAddQuestion}
              >
                <i className="la la-plus text-base"></i>
                Add custom
              </button>
            </div>

            {/* <FormSectionHeader>Questions Preview</FormSectionHeader> */}

            {preScreeningQuestions.length === 0 ? (
              <div className="p-2  text-gray-400 text-md mb-4 ">
                No pre-screening questions added yet. Add at least one question
                to continue.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={preScreeningQuestions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-3 mb-4">
                    {preScreeningQuestions.map((q) => {
                      // Check if this is a suggested question by matching the base ID
                      const baseId = q.id.split("-").slice(0, -1).join("-");
                      const isSuggestedQuestion = SUGGESTED_QUESTIONS.some(
                        (sq) => sq.id === baseId,
                      );

                      return (
                        <QuestionCard
                          key={q.id}
                          id={q.id}
                          question={q.question}
                          type={q.type}
                          options={q.options}
                          minValue={q.minValue}
                          maxValue={q.maxValue}
                          onUpdateAction={(updates) =>
                            updatePreScreeningQuestion(q.id, updates)
                          }
                          onDeleteAction={() =>
                            removePreScreeningQuestion(q.id)
                          }
                          isQuestionLocked={isSuggestedQuestion}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <hr className="border-t border-gray-300 my-2" />

            <FormSectionHeader>
              Suggested Pre-screening Questions
            </FormSectionHeader>
            <div className="flex flex-col gap-2">
              {SUGGESTED_QUESTIONS.map((sq) => {
                const isAdded = isQuestionAdded(sq.id);
                return (
                  <div
                    key={sq.id}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm font-semibold ${isAdded ? 'text-gray-400' : 'text-gray-800'}`}>
                          {sq.header}
                        </span>
                        <span className={`text-sm ${isAdded ? 'text-gray-400' : 'text-gray-700'}`}>
                          {sq.question}
                        </span>
                      </div>
                      <button
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border flex-shrink-0 ${
                          isAdded
                            ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                            : "bg-white text-blue-500 border-blue-500 cursor-pointer hover:bg-blue-50"
                        } transition-colors`}
                        onClick={() => handleAddSuggestedQuestion(sq)}
                        disabled={isAdded}
                      >
                        {isAdded ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CareerFormCard>
        </div>

        <div className="w-1/5 flex flex-col gap-2">
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
            <div className="flex flex-col gap-3">
              <p className="m-0 text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold">Add a Secret Prompt</span> to
                fine-tune how Jia scores and evaluates submitted CVs.
              </p>
              <p className="m-0 text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold">
                  Pre-Screening questions are required
                </span>{" "}
                to collect key details such as notice period, work setup, or
                salary expectations. Drag to reorder questions.
              </p>
            </div>
          </CareerFormCard>
        </div>
      </div>
    </>
  );
}
