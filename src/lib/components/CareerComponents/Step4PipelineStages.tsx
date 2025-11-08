"use client";

import { useState } from "react";
import { useCareerFormStore } from "@/lib/hooks/useCareerFormStore";
import CareerFormCard from "./CareerFormCard";
import FormLabel from "./FormLabel";
import FormSectionHeader from "./FormSectionHeader";
import FormField from "./FormField";
import { errorToast } from "@/lib/Utils";

export default function Step4PipelineStages() {
  const {
    pipelineStages,
    addPipelineStage,
    removePipelineStage,
    reorderPipelineStages,
    addSubstage,
    removeSubstage,
    nextStep,
    previousStep,
    saveDraft,
  } = useCareerFormStore();

  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newSubstages, setNewSubstages] = useState<string[]>([""]);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  const handleAddStage = () => {
    if (!newStageName.trim()) {
      errorToast("Please enter a stage name", 1300);
      return;
    }

    const maxOrder = Math.max(...pipelineStages.map((s) => s.order), 0);
    const newStage = {
      id: `stage-${Date.now()}`,
      name: newStageName,
      isCore: false,
      order: maxOrder + 1,
      substages: newSubstages
        .filter((s) => s.trim())
        .map((name, idx) => ({
          id: `substage-${Date.now()}-${idx}`,
          name,
          order: idx + 1,
        })),
    };

    addPipelineStage(newStage);
    setNewStageName("");
    setNewSubstages([""]);
    setShowAddStageModal(false);
  };

  const handleAddSubstage = (stageId: string) => {
    const substageName = prompt("Enter substage name:");
    if (!substageName?.trim()) return;

    const stage = pipelineStages.find((s) => s.id === stageId);
    if (!stage) return;

    const maxOrder = Math.max(...stage.substages.map((s) => s.order), 0);
    const newSubstage = {
      id: `substage-${Date.now()}`,
      name: substageName.trim(),
      order: maxOrder + 1,
    };

    addSubstage(stageId, newSubstage);
  };

  const handleMoveStage = (stageId: string, direction: "up" | "down") => {
    const currentIndex = pipelineStages.findIndex((s) => s.id === stageId);
    if (currentIndex === -1) return;

    const stage = pipelineStages[currentIndex];
    if (stage.isCore) return; // Can't move core stages

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Don't allow moving past core stages (first 2) or out of bounds
    if (newIndex < 2 || newIndex >= pipelineStages.length) return;

    const reordered = [...pipelineStages];
    [reordered[currentIndex], reordered[newIndex]] = [
      reordered[newIndex],
      reordered[currentIndex],
    ];

    // Update order numbers
    const updatedStages = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    reorderPipelineStages(updatedStages);
  };

  const toggleStageExpanded = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  const handleNext = async () => {
    await nextStep();
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleSaveDraft = () => {
    saveDraft();
  };

  const addSubstageInput = () => {
    setNewSubstages([...newSubstages, ""]);
  };

  const updateSubstageInput = (index: number, value: string) => {
    const updated = [...newSubstages];
    updated[index] = value;
    setNewSubstages(updated);
  };

  const removeSubstageInput = (index: number) => {
    const updated = newSubstages.filter((_, i) => i !== index);
    setNewSubstages(updated.length > 0 ? updated : [""]);
  };

  const handleRestoreDefault = () => {
    if (
      confirm(
        "Are you sure you want to restore default pipeline stages? This will remove all custom stages.",
      )
    ) {
      // This would reset to default - we'd need to add this action to the store
      window.location.reload();
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "80%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <CareerFormCard heading="Customize Pipeline Stages" icon="">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 14, color: "#6B7280", margin: 0, flex: 1 }}>
                Create, modify, reorder, and delete stages and sub-stages. Core
                stages are fixed and can&apos;t be moved or edited as they are
                essential to Jia&apos;s system logic.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    background: "#fff",
                    color: "#414651",
                    border: "1px solid #D5D7DA",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                  onClick={handleRestoreDefault}
                >
                  Restore to Default
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Core Stages (first 2) */}
              {pipelineStages
                .filter((s) => s.isCore)
                .map((stage) => (
                  <div
                    key={stage.id}
                    style={{
                      border: "2px solid #3B82F6",
                      borderRadius: 8,
                      padding: 16,
                      background: "#EFF6FF",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <h4
                          style={{ fontSize: 16, fontWeight: 600, margin: 0 }}
                        >
                          {stage.name}
                        </h4>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#3B82F6",
                            background: "#DBEAFE",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          CORE STAGE
                        </span>
                      </div>
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                        }}
                        onClick={() => toggleStageExpanded(stage.id)}
                      >
                        <i
                          className={
                            expandedStages.has(stage.id)
                              ? "la la-angle-up"
                              : "la la-angle-down"
                          }
                          style={{ fontSize: 20, color: "#3B82F6" }}
                        ></i>
                      </button>
                    </div>
                    {expandedStages.has(stage.id) && (
                      <div style={{ paddingLeft: 16 }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#6B7280",
                            marginBottom: 8,
                          }}
                        >
                          Substages:
                        </p>
                        {stage.substages.map((substage) => (
                          <div
                            key={substage.id}
                            style={{
                              background: "#fff",
                              border: "1px solid #BFDBFE",
                              borderRadius: 6,
                              padding: 10,
                              marginBottom: 6,
                              fontSize: 14,
                              color: "#374151",
                            }}
                          >
                            {substage.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {/* Add Custom Stage Button */}
              <button
                style={{
                  background: "#F9FAFB",
                  border: "2px dashed #D1D5DB",
                  borderRadius: 8,
                  padding: 24,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#6B7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onClick={() => setShowAddStageModal(true)}
              >
                <i className="la la-plus" style={{ fontSize: 20 }}></i>
                Add Custom Stage
              </button>

              {/* Custom Stages */}
              {pipelineStages
                .filter((s) => !s.isCore)
                .map((stage, idx, customStages) => (
                  <div
                    key={stage.id}
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 8,
                      padding: 16,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <h4
                          style={{ fontSize: 16, fontWeight: 600, margin: 0 }}
                        >
                          {stage.name}
                        </h4>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            style={{
                              background: "transparent",
                              border: "1px solid #D1D5DB",
                              borderRadius: 4,
                              padding: "4px 8px",
                              cursor: idx === 0 ? "not-allowed" : "pointer",
                              opacity: idx === 0 ? 0.5 : 1,
                            }}
                            onClick={() => handleMoveStage(stage.id, "up")}
                            disabled={idx === 0}
                          >
                            <i
                              className="la la-angle-up"
                              style={{ fontSize: 14 }}
                            ></i>
                          </button>
                          <button
                            style={{
                              background: "transparent",
                              border: "1px solid #D1D5DB",
                              borderRadius: 4,
                              padding: "4px 8px",
                              cursor:
                                idx === customStages.length - 1
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                idx === customStages.length - 1 ? 0.5 : 1,
                            }}
                            onClick={() => handleMoveStage(stage.id, "down")}
                            disabled={idx === customStages.length - 1}
                          >
                            <i
                              className="la la-angle-down"
                              style={{ fontSize: 14 }}
                            ></i>
                          </button>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          onClick={() => toggleStageExpanded(stage.id)}
                        >
                          <i
                            className={
                              expandedStages.has(stage.id)
                                ? "la la-angle-up"
                                : "la la-angle-down"
                            }
                            style={{ fontSize: 20, color: "#6B7280" }}
                          ></i>
                        </button>
                        <button
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#EF4444",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          onClick={() => {
                            if (confirm(`Delete "${stage.name}" stage?`)) {
                              removePipelineStage(stage.id);
                            }
                          }}
                        >
                          <i
                            className="la la-trash"
                            style={{ fontSize: 18 }}
                          ></i>
                        </button>
                      </div>
                    </div>
                    {expandedStages.has(stage.id) && (
                      <div style={{ paddingLeft: 16 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#6B7280",
                              margin: 0,
                            }}
                          >
                            Substages:
                          </p>
                          <button
                            style={{
                              background: "#3B82F6",
                              color: "#fff",
                              border: "none",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                            onClick={() => handleAddSubstage(stage.id)}
                          >
                            <i
                              className="la la-plus"
                              style={{ fontSize: 12, marginRight: 4 }}
                            ></i>
                            Add Substage
                          </button>
                        </div>
                        {stage.substages.length === 0 ? (
                          <p
                            style={{
                              fontSize: 13,
                              color: "#9CA3AF",
                              fontStyle: "italic",
                            }}
                          >
                            No substages added yet
                          </p>
                        ) : (
                          stage.substages.map((substage) => (
                            <div
                              key={substage.id}
                              style={{
                                background: "#F9FAFB",
                                border: "1px solid #E5E7EB",
                                borderRadius: 6,
                                padding: 10,
                                marginBottom: 6,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span style={{ fontSize: 14, color: "#374151" }}>
                                {substage.name}
                              </span>
                              <button
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#EF4444",
                                  cursor: "pointer",
                                  padding: 4,
                                }}
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Delete "${substage.name}" substage?`,
                                    )
                                  ) {
                                    removeSubstage(stage.id, substage.id);
                                  }
                                }}
                              >
                                <i
                                  className="la la-trash"
                                  style={{ fontSize: 16 }}
                                ></i>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CareerFormCard>
        </div>

        <div
          style={{
            width: "20%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
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
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 0,
                  fontSize: 14,
                  color: "#414651",
                  lineHeight: 1.6,
                }}
              >
                <li style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 500 }}>
                    Core stages are protected
                  </span>{" "}
                  – CV Screening and AI Interview stages cannot be moved or
                  deleted as they&apos;re essential to the system.
                </li>
                <li style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 500 }}>
                    Customize your workflow
                  </span>{" "}
                  – Add stages that match your hiring process, like Technical
                  Assessment or Background Check.
                </li>
                <li>
                  <span style={{ fontWeight: 500 }}>Use substages wisely</span>{" "}
                  – Break down complex stages into clear substages to track
                  progress more granularly.
                </li>
              </ul>
            </div>
          </CareerFormCard>
        </div>
      </div>

      {/* Add Stage Modal */}
      {showAddStageModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowAddStageModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              width: "90%",
              maxWidth: 500,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              Add Custom Stage
            </h3>

            <FormField>
              <FormLabel required>Stage Name</FormLabel>
              <input
                value={newStageName}
                className="form-control"
                placeholder="e.g., Technical Assessment"
                onChange={(e) => setNewStageName(e.target.value)}
              />
            </FormField>

            <FormField>
              <FormLabel>Substages (Optional)</FormLabel>
              {newSubstages.map((substage, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    value={substage}
                    className="form-control"
                    placeholder={`Substage ${idx + 1}`}
                    onChange={(e) => updateSubstageInput(idx, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {newSubstages.length > 1 && (
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#EF4444",
                        cursor: "pointer",
                        padding: 4,
                      }}
                      onClick={() => removeSubstageInput(idx)}
                    >
                      <i className="la la-times" style={{ fontSize: 20 }}></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                style={{
                  background: "transparent",
                  color: "#3B82F6",
                  border: "1px solid #3B82F6",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  marginTop: 8,
                }}
                onClick={addSubstageInput}
              >
                <i
                  className="la la-plus"
                  style={{ fontSize: 14, marginRight: 4 }}
                ></i>
                Add Substage
              </button>
            </FormField>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 24,
              }}
            >
              <button
                style={{
                  background: "#fff",
                  color: "#414651",
                  border: "1px solid #D5D7DA",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
                onClick={() => setShowAddStageModal(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  background: "#3B82F6",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
                onClick={handleAddStage}
              >
                Add Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
