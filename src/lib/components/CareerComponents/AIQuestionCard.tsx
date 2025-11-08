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
      className="border rounded-lg bg-white shadow-sm border-gray-200 mb-2"
    >
      <div className="flex items-stretch">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-10 bg-gray-50 border-r border-gray-200 cursor-grab active:cursor-grabbing rounded-l-lg hover:bg-gray-100 transition-colors"
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
        <div className="flex-1 flex items-start gap-3 p-3 min-w-0">
          {/* Question Number */}
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 border border-gray-300 rounded text-xs font-medium text-gray-600 flex-shrink-0">
            {index + 1}
          </div>

          {/* Question Display/Edit */}
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editValue}
              className="flex-1 border rounded px-3 py-2 text-md resize-none auto-resize"
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
              className="flex-1 m-0 text-md text-gray-600 font-normal leading-relaxed"
              style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
            >
              {question}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isEditing ? (
              <>
                <button
                  className="bg-transparent border-none text-green-600 cursor-pointer p-1 hover:text-green-800 transition-colors"
                  onClick={handleSave}
                  title="Save question"
                >
                  <i className="la la-check text-lg"></i>
                </button>
                <button
                  className="bg-transparent border-none text-gray-500 cursor-pointer p-1 hover:text-gray-700 transition-colors"
                  onClick={handleCancel}
                  title="Cancel"
                >
                  <i className="la la-times text-lg"></i>
                </button>
              </>
            ) : (
              <>
                <button
                  className="bg-transparent border-none text-gray-600 cursor-pointer p-1 hover:text-gray-400 transition-colors"
                  onClick={() => setIsEditing(true)}
                  title="Edit question"
                >
                  <i className="la la-pen text-lg"></i>
                </button>
                <button
                  className="bg-transparent border-none text-red-500 cursor-pointer p-1 hover:text-red-700 transition-colors"
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
