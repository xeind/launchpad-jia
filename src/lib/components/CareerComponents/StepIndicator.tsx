"use client";

import { useCareerFormStore, Step } from "@/lib/hooks/useCareerFormStore";

const steps: Array<{ key: Step; label: string; number: number }> = [
  { key: "career-details", label: "Career Details", number: 1 },
  { key: "cv-review", label: "CV Review", number: 2 },
  { key: "ai-interview", label: "AI Interview", number: 3 },
  { key: "pipeline-stages", label: "Pipeline Stages", number: 4 },
  { key: "review", label: "Review", number: 5 },
];

export default function StepIndicator() {
  const { currentStep, completedSteps, visitedSteps, goToStep, setStep } =
    useCareerFormStore();

  const handleStepClick = async (step: Step) => {
    const stepIndex = steps.findIndex((s) => s.key === step);
    const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

    // Allow navigation to:
    // 1. Any completed step (can revisit without validation)
    // 2. Current step (no-op, stays on same step)
    // 3. Previous step (backward navigation - no validation needed)
    // 4. Next step (forward navigation - requires validation)
    const isCompleted = completedSteps.includes(step);
    const isCurrentStep = stepIndex === currentStepIndex;
    const isPreviousStep = stepIndex < currentStepIndex;
    const isNextStep = stepIndex === currentStepIndex + 1;

    if (isCompleted || isCurrentStep || isPreviousStep) {
      // Navigate without validation for completed/current/previous steps
      setStep(step);
    } else if (isNextStep) {
      // Navigate with validation for next step (will add to visitedSteps if validation passes)
      await goToStep(step);
    }
    // Ignore clicks on steps that are more than one step ahead
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        marginBottom: 8,
        position: "relative",
      }}
    >
      {/* SVG Gradient Definition */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="step-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9FCAED" />
            <stop offset="33%" stopColor="#CEB6DA" />
            <stop offset="66%" stopColor="#EBACC9" />
            <stop offset="100%" stopColor="#FCCEC0" />
          </linearGradient>
        </defs>
      </svg>

      {steps.map((step, index) => {
        const isActive = currentStep === step.key;
        const isCompleted = completedSteps.includes(step.key);
        const stepIndex = steps.findIndex((s) => s.key === step.key);
        const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

        // Allow clicking on:
        // 1. Completed steps
        // 2. Current step
        // 3. Previous steps (backward navigation)
        // 4. Next step (forward navigation with validation)
        const isPreviousStep = stepIndex < currentStepIndex;
        const isNextStep = stepIndex === currentStepIndex + 1;
        const isClickable =
          isCompleted || isActive || isPreviousStep || isNextStep;

        return (
          <div
            key={step.key}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              position: "relative",
              cursor: isClickable ? "pointer" : "not-allowed",
            }}
            onClick={() => isClickable && handleStepClick(step.key)}
          >
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: "50%",
                  right: "-50%",
                  height: 4,
                  background: isCompleted
                    ? "linear-gradient(to right, #9FCAED, #CEB6DA, #EBACC9, #FCCEC0)"
                    : "#E5E7EB",
                  zIndex: 0,
                  borderRadius: 2,
                }}
              />
            )}

            {/* Step circle */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isActive
                  ? "#3B82F6"
                  : isCompleted
                    ? "linear-gradient(135deg, #9FCAED 0%, #CEB6DA 33%, #EBACC9 66%, #FCCEC0 100%)"
                    : "#E5E7EB",
                color: isActive || isCompleted ? "#FFFFFF" : "#6B7280",
                fontWeight: 600,
                fontSize: 14,
                zIndex: 1,
                position: "relative",
                transition: "all 0.2s ease",
              }}
            >
              {isCompleted ? (
                <i className="la la-check" style={{ fontSize: 16 }}></i>
              ) : (
                step.number
              )}
            </div>

            {/* Step label */}
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#181D27" : "#6B7280",
                textAlign: "center",
                maxWidth: 100,
              }}
            >
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
