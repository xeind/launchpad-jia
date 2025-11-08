"use client";

import { useEffect, useState } from "react";
import { useCareerFormStore } from "@/lib/hooks/useCareerFormStore";
import { useAppContext } from "@/lib/context/AppContext";
import { successToast, errorToast } from "@/lib/Utils";
import CareerFormHeader from "./CareerFormHeader";
import StepIndicator from "./StepIndicator";
import Step1CareerDetails from "./Step1CareerDetails";
import Step2CVReview from "./Step2CVReview";
import Step3AIInterview from "./Step3AIInterview";
import Step4PipelineStages from "./Step4PipelineStages";
import Step5Review from "./Step5Review";

export default function CareerForm({
  career,
  formType,
}: {
  career?: any;
  formType: "add" | "edit";
  setShowEditModal?: (show: boolean) => void;
}) {
  const { user, orgID } = useAppContext();
  const {
    currentStep,
    initializeForm,
    updateField,
    validateStep,
    saveDraft,
    submitCareer,
    nextStep,
    saveError,
    errors,
  } = useCareerFormStore();
  const [isSaving, setIsSaving] = useState(false);

  // Handle save as unpublished
  const handleSaveUnpublished = async () => {
    setIsSaving(true);
    try {
      await saveDraft();
      // Get the latest saveError from the store after saveDraft completes
      const currentError = useCareerFormStore.getState().saveError;
      if (currentError) {
        errorToast(currentError, 3000);
      } else {
        successToast("Draft saved successfully!", 3000);
      }
    } catch (error: any) {
      errorToast(error.message || "Failed to save draft", 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save and continue (next step or publish if on last step)
  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    try {
      if (currentStep === "review") {
        // On final step, publish the career
        await submitCareer("active");
        if (saveError) {
          errorToast(saveError, 3000);
        } else {
          successToast("Career published successfully!", 3000);
        }
      } else {
        // On other steps, validate and go to next step
        const isValid = validateStep(currentStep);
        if (isValid) {
          await nextStep();
          successToast("Progress saved! Moving to next step...", 2000);
        } else {
          // Show first error message if validation fails
          const firstErrorKey = Object.keys(errors)[0];
          const firstError = errors[firstErrorKey];
          errorToast(firstError || "Please complete all required fields", 3000);
        }
      }
    } catch (error: any) {
      errorToast(error.message || "An error occurred", 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Track initialization state to prevent re-initialization
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form on mount - WAIT for orgID and user to be loaded from AppContext
  useEffect(() => {
    // Prevent re-initialization if already initialized
    if (isInitialized) {
      return;
    }

    // CRITICAL: Wait for both orgID and user.email to be loaded from AppContext
    // This prevents the race condition where the form tries to save with empty values
    // Check for both undefined/null AND empty strings
    const hasValidOrgID = orgID && orgID.trim().length > 0;
    const hasValidUser = user?.email && user.email.trim().length > 0;

    if (!hasValidOrgID || !hasValidUser) {
      console.log("⏳ CareerForm waiting for dependencies to load...", {
        hasOrgID: !!orgID,
        orgID: orgID || "(empty)",
        orgIDLength: orgID?.length || 0,
        hasUser: !!user,
        hasUserEmail: !!user?.email,
        userEmail: user?.email || "(empty)",
        userEmailLength: user?.email?.length || 0,
      });
      return; // Wait for AppContext to load data from localStorage
    }

    const init = async () => {
      console.log(
        "✅ Initializing CareerForm with orgID:",
        orgID,
        "user:",
        user?.email,
      );

      await initializeForm(
        formType,
        orgID,
        {
          name: user?.name || "",
          email: user?.email || "",
          image: user?.image || "",
        },
        career?._id,
        career, // Pass the entire career object to avoid duplicate API call
      );

      // Mark as initialized to prevent re-running
      setIsInitialized(true);
      console.log("✅ CareerForm initialization complete");
    };

    init();
  }, [orgID, user?.email, isInitialized]); // Re-run when orgID or user.email become available

  return (
    <div className="col" style={{ padding: "0 20px" }}>
      <CareerFormHeader
        formType={formType}
        isSaving={isSaving}
        onSaveUnpublishedAction={handleSaveUnpublished}
        onSaveAndContinueAction={handleSaveAndContinue}
      />

      <div style={{ marginBottom: 2 }}>
        <StepIndicator />
      </div>

      {/* Separator */}
      <hr className=" border-t border-gray-300 mt-2 mb-2" />

      {/* Step Routing */}
      {currentStep === "career-details" && <Step1CareerDetails />}
      {currentStep === "cv-review" && <Step2CVReview />}
      {currentStep === "ai-interview" && <Step3AIInterview />}
      {currentStep === "pipeline-stages" && <Step4PipelineStages />}
      {currentStep === "review" && <Step5Review />}
    </div>
  );
}
