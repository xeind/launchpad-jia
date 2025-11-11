"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Step1Dropdown from "./Step1Dropdown";
import FormField from "./FormField";
import FormLabel from "./FormLabel";
import FormRow from "./FormRow";

interface QuestionCardProps {
  id: string;
  question: string;
  type: "short-answer" | "long-answer" | "dropdown" | "checkboxes" | "range";
  options?: string[];
  minValue?: number;
  maxValue?: number;
  onUpdateAction: (updates: {
    question?: string;
    type?: "short-answer" | "long-answer" | "dropdown" | "checkboxes" | "range";
    options?: string[];
    minValue?: number;
    maxValue?: number;
  }) => void;
  onDeleteAction: () => void;
  isNew?: boolean;
  isQuestionLocked?: boolean;
}

const questionTypeList = [
  { name: "Short Answer" },
  { name: "Long Answer" },
  { name: "Dropdown" },
  { name: "Checkboxes" },
  { name: "Range" },
];

const getTypeDisplayName = (type: string) => {
  const typeMap: Record<string, string> = {
    "short-answer": "Short Answer",
    "long-answer": "Long Answer",
    dropdown: "Dropdown",
    checkboxes: "Checkboxes",
    range: "Range",
  };
  return typeMap[type] || type;
};

const getTypeValue = (displayName: string) => {
  const typeMap: Record<string, string> = {
    "Short Answer": "short-answer",
    "Long Answer": "long-answer",
    Dropdown: "dropdown",
    Checkboxes: "checkboxes",
    Range: "range",
  };
  return typeMap[displayName] || displayName;
};

export default function QuestionCard({
  id,
  question,
  type,
  options = [],
  minValue = 0,
  maxValue = 100,
  onUpdateAction,
  onDeleteAction,
  isNew = false,
  isQuestionLocked = false,
}: QuestionCardProps) {
  const [localOptions, setLocalOptions] = useState<string[]>(() => {
    // If options are provided and have values, use them
    if (options.length >= 2) {
      return options;
    }
    // If options are provided but incomplete, keep existing values and add defaults
    if (options.length === 1) {
      return options[0] ? [...options, "2"] : ["1", "2"];
    }
    // Default: Auto-populate with numbers 1, 2, 3 for new questions
    return ["1", "2", "3"];
  });
  const [localMinValue, setLocalMinValue] = useState(minValue.toString());
  const [localMaxValue, setLocalMaxValue] = useState(maxValue.toString());
  const [rangeError, setRangeError] = useState<string>("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const addOption = () => {
    const nextNumber = (localOptions.length + 1).toString();
    const newOptions = [...localOptions, nextNumber];
    setLocalOptions(newOptions);
    onUpdateAction({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...localOptions];
    newOptions[index] = value;
    setLocalOptions(newOptions);
    onUpdateAction({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = localOptions.filter((_, i) => i !== index);
    const finalOptions = newOptions.length >= 2 ? newOptions : ["", ""];
    setLocalOptions(finalOptions);
    onUpdateAction({ options: finalOptions });
  };

  const handleTypeChange = (displayName: string) => {
    const newType = getTypeValue(displayName) as typeof type;
    onUpdateAction({ type: newType });
  };

  const handleMinValueChange = (value: string) => {
    setLocalMinValue(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const maxNum = parseInt(localMaxValue);
      if (!isNaN(maxNum) && numValue >= maxNum) {
        setRangeError("Minimum value must be less than maximum value");
      } else {
        setRangeError("");
      }
      onUpdateAction({ minValue: numValue });
    }
  };

  const handleMaxValueChange = (value: string) => {
    setLocalMaxValue(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const minNum = parseInt(localMinValue);
      if (!isNaN(minNum) && numValue <= minNum) {
        setRangeError("Maximum value must be greater than minimum value");
      } else {
        setRangeError("");
      }
      onUpdateAction({ maxValue: numValue });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-white shadow-sm ${isNew ? "border-2 border-blue-500" : "border-gray-200"}`}
    >
      <div className="flex items-stretch">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex w-10 cursor-grab items-center justify-center rounded-l-lg border-r border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100 active:cursor-grabbing"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-400"
          >
            <circle cx="6" cy="4" r="1" fill="currentColor" />
            <circle cx="10" cy="4" r="1" fill="currentColor" />
            <circle cx="6" cy="8" r="1" fill="currentColor" />
            <circle cx="10" cy="8" r="1" fill="currentColor" />
            <circle cx="6" cy="12" r="1" fill="currentColor" />
            <circle cx="10" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>

        {/* Card Content */}
        <div className="flex-1">
          {/* Gray Header Section - Question + Type Row */}
          <div className="border-b border-gray-200 bg-gray-50 p-2">
            <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
              {/* Question Field - 70% width */}
              <div style={{ flex: "0 0 70%" }}>
                <input
                  value={question}
                  className={`form-control ${isQuestionLocked ? "cursor-not-allowed !border-0 !bg-gray-50" : ""}`}
                  placeholder="Enter your question"
                  onChange={(e) => onUpdateAction({ question: e.target.value })}
                  disabled={isQuestionLocked}
                />
              </div>
              {/* Type Dropdown - 30% width */}
              <div style={{ flex: "0 0 calc(30% - 12px)" }}>
                <Step1Dropdown
                  onSelectSetting={handleTypeChange}
                  screeningSetting={getTypeDisplayName(type)}
                  settingList={questionTypeList}
                  placeholder="Choose question type"
                  disabled={isQuestionLocked}
                />
              </div>
            </div>
          </div>

          {/* White Body Section - Options/Range */}
          <div className="bg-white p-4">
            {/* Options Section - For Dropdown and Checkboxes */}
            {(type === "dropdown" || type === "checkboxes") && (
              <div style={{ marginBottom: 16 }}>
                <div className="space-y-3">
                  {localOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-stretch gap-2">
                      {/* Unified Input with Numbered Box */}
                      <div className="flex flex-1 items-stretch overflow-hidden rounded border border-gray-300">
                        {/* Numbered Box - Inside Input - Full Height */}
                        <div className="flex w-10 flex-shrink-0 items-center justify-center border-r border-gray-300 bg-gray-100 text-xs font-medium text-gray-600">
                          {idx + 1}
                        </div>
                        {/* Option Input */}
                        <input
                          value={opt}
                          className="flex-1 border-0 px-3 py-2 focus:outline-none focus:ring-0"
                          placeholder={`Option ${idx + 1}`}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          style={{ boxShadow: "none" }}
                        />
                      </div>
                      {/* Delete Button - Rightmost */}
                      {localOptions.length > 2 && (
                        <button
                          className="flex-shrink-0 cursor-pointer border-none bg-transparent p-1 text-red-500 transition-colors hover:text-red-700"
                          onClick={() => removeOption(idx)}
                        >
                          <i className="la la-times text-xl"></i>
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    className="text-md flex cursor-pointer items-center rounded-md bg-transparent px-3 py-2 font-medium text-gray-500 transition-colors hover:bg-blue-50"
                    onClick={addOption}
                  >
                    <i className="la la-plus mr-1 text-sm"></i>
                    Add Option
                  </button>
                </div>
              </div>
            )}

            {/* Range Section - For Range type */}
            {type === "range" && (
              <div style={{ marginBottom: 16 }}>
                <FormRow>
                  <FormField>
                    <FormLabel>Minimum Value</FormLabel>
                    <input
                      type="number"
                      value={localMinValue}
                      className="form-control"
                      placeholder="0"
                      onChange={(e) => handleMinValueChange(e.target.value)}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>Maximum Value</FormLabel>
                    <input
                      type="number"
                      value={localMaxValue}
                      className="form-control"
                      placeholder="100"
                      onChange={(e) => handleMaxValueChange(e.target.value)}
                    />
                  </FormField>
                </FormRow>
                {rangeError && (
                  <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                    {rangeError}
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <hr className="my-4 border-t border-gray-300" />

            {/* Delete Button */}
            <div className="flex justify-end">
              <button
                className="w-auto cursor-pointer rounded-full bg-transparent p-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                style={{ border: "1px solid #ef4444" }}
                onClick={onDeleteAction}
              >
                <i className="la la-trash mr-2 text-base"></i>
                Delete Question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
