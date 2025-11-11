"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface AIQuestionCardProps {
  id: string;
  question: string;
  index: number;
  onUpdateAction: (question: string) => void;
  onDeleteAction: () => void;
  startInEditMode?: boolean;
}

export default function AIQuestionCard({
  id,
  question,
  index,
  onUpdateAction,
  onDeleteAction,
  startInEditMode = false,
}: AIQuestionCardProps) {
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [editValue, setEditValue] = useState(question);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (isEditing) {
      adjustTextareaHeight();
    }
  }, [isEditing]);

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

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdateAction(editValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    // If it's a new empty question (started in edit mode with empty content), delete it
    if (startInEditMode && !question) {
      onDeleteAction();
    } else {
      setEditValue(question);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-2 rounded-lg border border-gray-200 bg-white shadow-sm"
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
        <div className="flex min-w-0 flex-1 items-center gap-3 p-3">
          {/* Question Number */}
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-gray-300 bg-gray-100 text-xs font-medium text-gray-600">
            {index + 1}
          </div>

          {/* Question Display/Edit */}
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editValue}
              className="form-control answerInput !h-20 !resize-none !overflow-y-auto text-sm"
              placeholder="Enter your question"
              onChange={(e) => {
                setEditValue(e.target.value);
                adjustTextareaHeight();
              }}
              rows={3}
              style={{
                minHeight: "70px",
                overflow: "hidden",
                borderColor: "#E9EAEB",
                lineHeight: "1.5",
              }}
              autoFocus
            />
          ) : (
            <p
              className="text-md m-0 flex-1 font-normal leading-relaxed text-gray-600"
              style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
            >
              {question}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {isEditing ? (
              <>
                <button
                  className="cursor-pointer border-none bg-transparent p-1 text-green-600 transition-colors hover:text-green-800"
                  onClick={handleSave}
                  title="Save question"
                >
                  <i className="la la-check text-lg"></i>
                </button>
                <button
                  className="cursor-pointer border-none bg-transparent p-1 text-gray-500 transition-colors hover:text-gray-700"
                  onClick={handleCancel}
                  title="Cancel"
                >
                  <i className="la la-times text-lg"></i>
                </button>
              </>
            ) : (
              <>
                <button
                  className="cursor-pointer border-none bg-transparent p-1 text-gray-600 transition-colors hover:text-gray-400"
                  onClick={() => setIsEditing(true)}
                  title="Edit question"
                >
                  <i className="la la-pen text-lg"></i>
                </button>
                <button
                  className="cursor-pointer border-none bg-transparent p-1 text-red-500 transition-colors hover:text-red-700"
                  onClick={onDeleteAction}
                  title="Delete question"
                >
                  <i className="la la-trash text-lg"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
