"use client";

import { useState, useEffect } from "react";
import styles from "@/lib/styles/screens/applicationFlow.module.scss";

interface PreScreeningQuestion {
  id: string;
  question: string;
  type: "short-answer" | "long-answer" | "dropdown" | "checkboxes" | "range";
  options?: string[];
  minValue?: number;
  maxValue?: number;
  required?: boolean;
}

interface ApplicationFlowModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSubmitAction: (answers: Record<string, any>) => void;
  selectedCareer: any;
}

export default function ApplicationFlowModal({
  isOpen,
  onCloseAction,
  onSubmitAction,
  selectedCareer,
}: ApplicationFlowModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ["Submit CV", "Pre-Screening Questions", "Review"];
  const preScreeningQuestions: PreScreeningQuestion[] =
    selectedCareer?.preScreeningQuestions || [];

  useEffect(() => {
    if (isOpen) {
      // Skip Step 1 (Submit CV) automatically
      setCurrentStep(1);
      setAnswers({});
      setErrors({});
    }
  }, [isOpen]);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      // Validate pre-screening questions
      preScreeningQuestions.forEach((q) => {
        if (q.required) {
          const answer = answers[q.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0)) {
            newErrors[q.id] = "This question is required";
          }
          if (typeof answer === "string" && !answer.trim()) {
            newErrors[q.id] = "This question is required";
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Submit
        onSubmitAction(answers);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Don't allow going back to step 0
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    // Clear error for this question
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
  };

  const renderQuestion = (question: PreScreeningQuestion) => {
    const answer = answers[question.id];
    const error = errors[question.id];

    switch (question.type) {
      case "short-answer":
        return (
          <div key={question.id} className={styles.questionContainer}>
            <label>
              {question.question}
              {question.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type="text"
              value={answer || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Your answer"
              className={error ? styles.inputError : ""}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case "long-answer":
        return (
          <div key={question.id} className={styles.questionContainer}>
            <label>
              {question.question}
              {question.required && <span className={styles.required}>*</span>}
            </label>
            <textarea
              value={answer || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Your answer"
              rows={4}
              className={error ? styles.inputError : ""}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case "dropdown":
        return (
          <div key={question.id} className={styles.questionContainer}>
            <label>
              {question.question}
              {question.required && <span className={styles.required}>*</span>}
            </label>
            <select
              value={answer || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className={error ? styles.inputError : ""}
            >
              <option value="">Select an option</option>
              {question.options?.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case "checkboxes":
        return (
          <div key={question.id} className={styles.questionContainer}>
            <label>
              {question.question}
              {question.required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.checkboxGroup}>
              {question.options?.map((option, idx) => (
                <label key={idx} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={(answer || []).includes(option)}
                    onChange={(e) => {
                      const currentAnswers = answer || [];
                      if (e.target.checked) {
                        handleAnswerChange(question.id, [
                          ...currentAnswers,
                          option,
                        ]);
                      } else {
                        handleAnswerChange(
                          question.id,
                          currentAnswers.filter((a: string) => a !== option),
                        );
                      }
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case "range":
        return (
          <div key={question.id} className={styles.questionContainer}>
            <label>
              {question.question}
              {question.required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.rangeContainer}>
              <input
                type="number"
                value={answer || question.minValue || 0}
                onChange={(e) =>
                  handleAnswerChange(question.id, parseInt(e.target.value))
                }
                min={question.minValue}
                max={question.maxValue}
                className={error ? styles.inputError : ""}
              />
              <span className={styles.rangeLabel}>
                Range: {question.minValue} - {question.maxValue}
              </span>
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Step 1: Submit CV (This should be auto-skipped)
        return (
          <div className={styles.stepContent}>
            <div className={styles.placeholderStep}>
              <p>This step is currently disabled.</p>
            </div>
          </div>
        );

      case 1:
        // Step 2: Pre-Screening Questions
        return (
          <div className={styles.stepContent}>
            <h2>Pre-Screening Questions</h2>
            <p className={styles.stepDescription}>
              Please answer the following questions to help us understand your
              qualifications better.
            </p>
            {preScreeningQuestions.length === 0 ? (
              <p>No pre-screening questions for this position.</p>
            ) : (
              <div className={styles.questionsContainer}>
                {preScreeningQuestions.map(renderQuestion)}
              </div>
            )}
          </div>
        );

      case 2:
        // Step 3: Review
        return (
          <div className={styles.stepContent}>
            <h2>Review Your Answers</h2>
            <p className={styles.stepDescription}>
              Please review your answers before submitting your application.
            </p>
            <div className={styles.reviewContainer}>
              {preScreeningQuestions.map((question) => (
                <div key={question.id} className={styles.reviewItem}>
                  <h4>{question.question}</h4>
                  <p>
                    {Array.isArray(answers[question.id])
                      ? answers[question.id].join(", ")
                      : answers[question.id] || "No answer provided"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onCloseAction}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.jobInfo}>
            <h3>{selectedCareer?.jobTitle}</h3>
            {selectedCareer?.organization?.name && (
              <p>{selectedCareer.organization.name}</p>
            )}
          </div>
          <button className={styles.closeButton} onClick={onCloseAction}>
            ×
          </button>
        </div>

        <div className={styles.stepIndicator}>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`${styles.stepItem} ${
                index === currentStep ? styles.active : ""
              } ${index < currentStep ? styles.completed : ""}`}
            >
              <div className={styles.stepCircle}>
                {index < currentStep ? "✓" : index + 1}
              </div>
              <span className={styles.stepLabel}>{step}</span>
            </div>
          ))}
        </div>

        <div className={styles.modalBody}>{renderStepContent()}</div>

        <div className={styles.modalFooter}>
          {currentStep > 1 && (
            <button className={styles.secondaryButton} onClick={handleBack}>
              Back
            </button>
          )}
          <button className={styles.primaryButton} onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Submit Application" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
