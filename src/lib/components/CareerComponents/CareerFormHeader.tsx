"use client";

import AutoSaveIndicator from "./AutoSaveIndicator";

interface CareerFormHeaderProps {
  formType: "add" | "edit";
  isSaving: boolean;
  careerStatus?: string;
  currentStep?: string;
  onSaveUnpublishedAction: () => void;
  onSaveAndContinueAction: () => void;
  onSaveEditAction?: () => void;
  onDiscardEditAction?: () => void;
  onCloseAction?: () => void;
}

export default function CareerFormHeader({
  formType,
  isSaving,
  careerStatus,
  currentStep,
  onSaveUnpublishedAction,
  onSaveAndContinueAction,
  onSaveEditAction,
  onDiscardEditAction,
  onCloseAction,
}: CareerFormHeaderProps) {
  return (
    <>
      {/* Header with title and action buttons */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="m-0 text-2xl font-semibold">
            {formType === "edit" && careerStatus === "active"
              ? "Quick Edit Career"
              : formType === "edit"
                ? "Edit Career Details"
                : "Add new career"}
          </h1>
          <AutoSaveIndicator />
        </div>
        <div className="flex gap-3">
          {formType === "edit" && careerStatus === "active" ? (
            // Published career being edited
            <>
              <button
                onClick={onDiscardEditAction}
                disabled={isSaving}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium transition-opacity hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Discard Edit
              </button>
              {onCloseAction && (
                <button
                  onClick={onCloseAction}
                  disabled={isSaving}
                  className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium transition-opacity hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Close
                </button>
              )}
              <button
                onClick={onSaveEditAction}
                disabled={isSaving}
                className="cursor-pointer rounded-md border-none bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save Edit
              </button>
            </>
          ) : (
            // New career or draft being edited
            <>
              <button
                onClick={onSaveUnpublishedAction}
                disabled={isSaving}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium transition-opacity hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save as Unpublished
              </button>
              {currentStep === "review" ? (
                // On review step
                <>
                  {onCloseAction && (
                    <button
                      onClick={onCloseAction}
                      disabled={isSaving}
                      className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium transition-opacity hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Close
                    </button>
                  )}
                  <button
                    onClick={onSaveAndContinueAction}
                    disabled={isSaving}
                    className="cursor-pointer rounded-md border-none bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Publish
                  </button>
                </>
              ) : (
                // On other steps
                <button
                  onClick={onSaveAndContinueAction}
                  disabled={isSaving}
                  className="cursor-pointer rounded-md border-none bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next Step →
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
