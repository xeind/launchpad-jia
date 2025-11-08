"use client";

import AutoSaveIndicator from "./AutoSaveIndicator";

interface CareerFormHeaderProps {
  formType: "add" | "edit";
  isSaving: boolean;
  onSaveUnpublishedAction: () => void;
  onSaveAndContinueAction: () => void;
}

export default function CareerFormHeader({
  formType,
  isSaving,
  onSaveUnpublishedAction,
  onSaveAndContinueAction,
}: CareerFormHeaderProps) {
  return (
    <>
      {/* Header with title and action buttons */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h1 className="m-0 text-2xl font-semibold">
            {formType === "edit" ? "Edit Career Details" : "Add new career"}
          </h1>
          <AutoSaveIndicator />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSaveUnpublishedAction}
            disabled={isSaving}
            className="px-5 py-2.5 border border-gray-300 rounded-md bg-white cursor-pointer text-sm font-medium transition-opacity hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save as Unpublished
          </button>
          <button
            onClick={onSaveAndContinueAction}
            disabled={isSaving}
            className="px-5 py-2.5 border-none rounded-md bg-indigo-600 text-white cursor-pointer text-sm font-medium transition-opacity hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save and Continue →
          </button>
        </div>
      </div>
    </>
  );
}
