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
  const { currentStep, completedSteps, visitedSteps, goToStep, setStep } = useCareerFormStore();

  const handleStepClick = async (step: Step) => {
    const stepIndex = steps.findIndex((s) => s.key === step);
    const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

    // Allow navigation to:
    // 1. Any visited step (steps the user has been to before)
    // 2. Any completed step (can revisit completed steps)
    // 3. The next step after current (forward navigation - with validation)
    const isVisited = visitedSteps.includes(step);
    const isCompleted = completedSteps.includes(step);
    const isNextStep = stepIndex === currentStepIndex + 1;
    const isCurrentStep = stepIndex === currentStepIndex;
    
    if (isVisited || isCompleted || isCurrentStep) {
      // Navigate without validation for visited/completed/current steps
      setStep(step);
    } else if (isNextStep) {
      // Navigate with validation for next step (will add to visitedSteps if validation passes)
      await goToStep(step);
    }
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
      {steps.map((step, index) => {
        const isActive = currentStep === step.key;
        const isCompleted = completedSteps.includes(step.key);
        const stepIndex = steps.findIndex((s) => s.key === step.key);
        const currentStepIndex = steps.findIndex((s) => s.key === currentStep);
        
        // Allow clicking on:
        // 1. Visited steps (steps the user has been to)
        // 2. Completed steps
        // 3. Current step
        // 4. Next step after current
        const isVisited = visitedSteps.includes(step.key);
        const isNextStep = stepIndex === currentStepIndex + 1;
        const isClickable = isVisited || isCompleted || isActive || isNextStep;

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
                  height: 2,
                  backgroundColor: isCompleted ? "#10B981" : "#E5E7EB",
                  zIndex: 0,
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
                backgroundColor: isActive
                  ? "#3B82F6"
                  : isCompleted
                    ? "#10B981"
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
