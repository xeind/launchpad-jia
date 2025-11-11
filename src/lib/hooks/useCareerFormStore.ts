import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";

export type Step =
  | "career-details" // Step 1
  | "cv-review" // Step 2
  | "ai-interview" // Step 3
  | "pipeline-stages" // Step 4
  | "review"; // Step 5

interface PreScreeningQuestion {
  id: string;
  question: string;
  type: "short-answer" | "long-answer" | "dropdown" | "checkboxes" | "range";
  options?: string[];
  required: boolean;
  minValue?: number; // For range type
  maxValue?: number; // For range type
}

interface AIQuestion {
  id: string;
  text: string;
}

interface AIQuestionCategory {
  questions: AIQuestion[];
  questionsToAsk: number;
}

interface PipelineStage {
  id: string;
  name: string;
  isCore: boolean;
  order: number;
  substages: Array<{
    id: string;
    name: string;
    order: number;
  }>;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Job Owner" | "Contributor" | "Reviewer";
}

interface User {
  name: string;
  email: string;
  image: string;
}

interface CareerFormState {
  // ============================================
  // STEP MANAGEMENT
  // ============================================
  currentStep: Step;
  completedSteps: Step[];
  visitedSteps: Step[]; // Track all steps that have been visited

  // ============================================
  // STEP 1: CAREER DETAILS
  // ============================================
  jobTitle: string;
  employmentType: string;
  workSetup: string;
  workSetupRemarks: string;
  country: string;
  province: string;
  city: string;
  minimumSalary: string;
  maximumSalary: string;
  salaryNegotiable: boolean;
  currency: string;
  description: string;
  teamMembers: TeamMember[];

  // ============================================
  // STEP 2: CV REVIEW & PRE-SCREENING
  // ============================================
  cvScreeningSetting: string;
  cvSecretPrompt: string;
  preScreeningQuestions: PreScreeningQuestion[];

  // ============================================
  // STEP 3: AI INTERVIEW SETUP
  // ============================================
  aiInterviewScreeningSetting: string;
  requireVideo: boolean;
  aiInterviewSecretPrompt: string;
  aiInterviewQuestions: {
    cvValidation: AIQuestionCategory;
    technical: AIQuestionCategory;
    behavioral: AIQuestionCategory;
    analytical: AIQuestionCategory;
    others: AIQuestionCategory;
  };

  // ============================================
  // STEP 4: PIPELINE STAGES
  // ============================================
  pipelineStages: PipelineStage[];

  // ============================================
  // DRAFT MANAGEMENT
  // ============================================
  careerId: string | null;
  isDraft: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;

  // ============================================
  // FORM METADATA
  // ============================================
  formType: "add" | "edit";
  orgID: string;
  user: User;

  // ============================================
  // VALIDATION
  // ============================================
  errors: Record<string, string>;

  // ============================================
  // ACTIONS
  // ============================================
  setStep: (step: Step) => void;
  nextStep: () => Promise<boolean>;
  previousStep: () => void;
  goToStep: (step: Step) => Promise<boolean>;

  updateField: <K extends keyof CareerFormState>(
    field: K,
    value: CareerFormState[K],
  ) => void;

  validateStep: (step: Step) => boolean;
  validateAll: () => boolean;

  saveDraft: () => Promise<void>;
  autoSave: () => Promise<void>;
  submitCareer: (status: "active" | "inactive") => Promise<void>;

  loadCareer: (id: string) => Promise<void>;
  resetForm: () => void;
  initializeForm: (
    type: "add" | "edit",
    orgID: string,
    user: User,
    careerId?: string,
    careerData?: any,
  ) => Promise<void>;

  // Pre-screening question actions
  addPreScreeningQuestion: (question: PreScreeningQuestion) => void;
  removePreScreeningQuestion: (id: string) => void;
  updatePreScreeningQuestion: (
    id: string,
    updates: Partial<PreScreeningQuestion>,
  ) => void;
  reorderPreScreeningQuestions: (questions: PreScreeningQuestion[]) => void;

  // Team member actions
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (id: string) => void;
  updateTeamMemberRole: (id: string, role: string) => void;

  // AI Interview question actions
  generateAIQuestions: (
    category: keyof CareerFormState["aiInterviewQuestions"],
  ) => Promise<void>;
  generateAllAIQuestions: () => Promise<void>;
  addAIQuestion: (
    category: keyof CareerFormState["aiInterviewQuestions"],
    questionText: string,
  ) => void;
  updateAIQuestion: (
    category: keyof CareerFormState["aiInterviewQuestions"],
    questionId: string,
    questionText: string,
  ) => void;
  removeAIQuestion: (
    category: keyof CareerFormState["aiInterviewQuestions"],
    questionId: string,
  ) => void;
  reorderAIQuestions: (
    category: keyof CareerFormState["aiInterviewQuestions"],
    questions: AIQuestion[],
  ) => void;
  updateQuestionsToAsk: (
    category: keyof CareerFormState["aiInterviewQuestions"],
    count: number,
  ) => void;

  // Pipeline stage actions
  addPipelineStage: (stage: PipelineStage) => void;
  removePipelineStage: (id: string) => void;
  reorderPipelineStages: (stages: PipelineStage[]) => void;
  addSubstage: (
    stageId: string,
    substage: { id: string; name: string; order: number },
  ) => void;
  removeSubstage: (stageId: string, substageId: string) => void;
}

const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "cv-screening",
    name: "CV Screening",
    isCore: true,
    order: 1,
    substages: [
      { id: "waiting-submission", name: "Waiting for Submission", order: 1 },
      { id: "for-review", name: "For Review", order: 2 },
    ],
  },
  {
    id: "ai-interview",
    name: "AI Interview",
    isCore: true,
    order: 2,
    substages: [
      { id: "waiting-interview", name: "Waiting Interview", order: 1 },
      { id: "for-review-ai", name: "For Review", order: 2 },
    ],
  },
  {
    id: "final-human-interview",
    name: "Final Human Interview",
    isCore: false,
    order: 3,
    substages: [
      { id: "waiting-schedule", name: "Waiting Schedule", order: 1 },
      { id: "waiting-interview-human", name: "Waiting Interview", order: 2 },
      { id: "for-review-human", name: "For Review", order: 3 },
    ],
  },
  {
    id: "job-offer",
    name: "Job Offer",
    isCore: false,
    order: 4,
    substages: [
      { id: "for-final-review", name: "For Final Review", order: 1 },
      { id: "waiting-offer", name: "Waiting Offer Acceptance", order: 2 },
      { id: "contract-signing", name: "For Contract Signing", order: 3 },
      { id: "hired", name: "Hired", order: 4 },
    ],
  },
];

// Helper function to migrate old string[] questions to AIQuestion[] format
const migrateAIQuestions = (
  questions: any,
): {
  cvValidation: AIQuestionCategory;
  technical: AIQuestionCategory;
  behavioral: AIQuestionCategory;
  analytical: AIQuestionCategory;
  others: AIQuestionCategory;
} => {
  if (!questions) {
    return {
      cvValidation: { questions: [], questionsToAsk: 0 },
      technical: { questions: [], questionsToAsk: 0 },
      behavioral: { questions: [], questionsToAsk: 0 },
      analytical: { questions: [], questionsToAsk: 0 },
      others: { questions: [], questionsToAsk: 0 },
    };
  }

  const migrateCategory = (category: any): AIQuestionCategory => {
    if (!category || !category.questions) {
      return { questions: [], questionsToAsk: 0 };
    }

    // Check if questions are already in the new format (have 'id' property)
    const hasNewFormat =
      category.questions.length > 0 &&
      typeof category.questions[0] === "object" &&
      "id" in category.questions[0];

    if (hasNewFormat) {
      return category;
    }

    // Migrate old string[] format to AIQuestion[] format
    const migratedQuestions: AIQuestion[] = category.questions.map(
      (q: any) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: typeof q === "string" ? q : q.text || "",
      }),
    );

    return {
      questions: migratedQuestions,
      questionsToAsk: category.questionsToAsk || 0,
    };
  };

  return {
    cvValidation: migrateCategory(questions.cvValidation),
    technical: migrateCategory(questions.technical),
    behavioral: migrateCategory(questions.behavioral),
    analytical: migrateCategory(questions.analytical),
    others: migrateCategory(questions.others),
  };
};

const initialState = {
  currentStep: "career-details" as Step,
  completedSteps: [] as Step[],
  visitedSteps: ["career-details"] as Step[], // Start with first step visited

  // Step 1: Career Details
  jobTitle: "",
  employmentType: "Full-Time",
  workSetup: "",
  workSetupRemarks: "",
  country: "Philippines",
  province: "",
  city: "",
  minimumSalary: "",
  maximumSalary: "",
  salaryNegotiable: true,
  currency: "PHP",
  description: "",
  teamMembers: [],

  // Step 2: CV Review
  cvScreeningSetting: "Good Fit and above",
  cvSecretPrompt: "",
  preScreeningQuestions: [],

  // Step 3: AI Interview
  aiInterviewScreeningSetting: "Good Fit and above",
  requireVideo: true,
  aiInterviewSecretPrompt: "",
  aiInterviewQuestions: {
    cvValidation: { questions: [], questionsToAsk: 0 },
    technical: { questions: [], questionsToAsk: 0 },
    behavioral: { questions: [], questionsToAsk: 0 },
    analytical: { questions: [], questionsToAsk: 0 },
    others: { questions: [], questionsToAsk: 0 },
  },

  // Step 4: Pipeline Stages
  pipelineStages: DEFAULT_PIPELINE_STAGES,

  // Draft Management
  careerId: null,
  isDraft: true,
  lastSaved: null,
  isDirty: false,
  isSaving: false,
  saveError: null,

  // Form Metadata
  formType: "add" as "add" | "edit",
  orgID: "",
  user: { name: "", email: "", image: "" },

  // Validation
  errors: {},
};

export const useCareerFormStore = create<CareerFormState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ============================================
      // STEP NAVIGATION
      // ============================================
      setStep: (step: Step) => {
        const state = get();
        set({
          currentStep: step,
          visitedSteps: [...new Set([...state.visitedSteps, step])], // Add to visited steps
        });
      },

      nextStep: async () => {
        const state = get();
        const isValid = state.validateStep(state.currentStep);

        if (!isValid) {
          return false;
        }

        const steps: Step[] = [
          "career-details",
          "cv-review",
          "ai-interview",
          "pipeline-stages",
          "review",
        ];
        const currentIndex = steps.indexOf(state.currentStep);

        if (currentIndex < steps.length - 1) {
          const nextStep = steps[currentIndex + 1];

          // FIX: Update state FIRST, BEFORE auto-saving
          // This ensures the new step is saved to the database, not the old one
          set({
            currentStep: nextStep,
            completedSteps: [
              ...new Set([...state.completedSteps, state.currentStep]),
            ],
            visitedSteps: [...new Set([...state.visitedSteps, nextStep])], // Add next step to visited
            isDirty: true, // Mark as dirty to ensure autoSave will save
          });

          // Now auto-save with the updated step
          await get().autoSave();

          return true;
        }

        return false;
      },

      previousStep: () => {
        const state = get();
        const steps: Step[] = [
          "career-details",
          "cv-review",
          "ai-interview",
          "pipeline-stages",
          "review",
        ];
        const currentIndex = steps.indexOf(state.currentStep);

        if (currentIndex > 0) {
          set({ currentStep: steps[currentIndex - 1] });
        }
      },

      goToStep: async (step: Step) => {
        const state = get();
        const isValid = state.validateStep(state.currentStep);

        if (!isValid) {
          return false;
        }

        // FIX: Update state FIRST, BEFORE auto-saving
        // This ensures the new step is saved to the database, not the old one
        set({
          currentStep: step,
          visitedSteps: [...new Set([...state.visitedSteps, step])], // Add to visited steps
          isDirty: true, // Mark as dirty to ensure autoSave will save
        });

        await get().autoSave();
        return true;
      },

      // ============================================
      // FIELD UPDATES
      // ============================================
      updateField: (field, value) => {
        set({ [field]: value, isDirty: true });
      },

      // ============================================
      // VALIDATION
      // ============================================
      validateStep: (step: Step) => {
        const state = get();
        const errors: Record<string, string> = {};

        switch (step) {
          case "career-details":
            if (!state.jobTitle.trim()) {
              errors.jobTitle = "Job title is required";
            }
            if (!state.description.trim()) {
              errors.description = "Job description is required";
            }
            if (!state.workSetup.trim()) {
              errors.workSetup = "Work arrangement is required";
            }
            if (!state.employmentType.trim()) {
              errors.employmentType = "Employment type is required";
            }
            if (!state.province.trim()) {
              errors.province = "Province is required";
            }
            if (!state.city.trim()) {
              errors.city = "City is required";
            }
            if (
              state.minimumSalary &&
              state.maximumSalary &&
              Number(state.minimumSalary) > Number(state.maximumSalary)
            ) {
              errors.salary =
                "Minimum salary cannot be greater than maximum salary";
            }
            break;

          case "cv-review":
            if (state.preScreeningQuestions.length === 0) {
              errors.preScreeningQuestions =
                "At least 1 pre-screening question is required";
            } else {
              // Validate each question has non-empty text
              for (const q of state.preScreeningQuestions) {
                if (!q.question || q.question.trim() === "") {
                  errors.preScreeningQuestions =
                    "All questions must have question text";
                  break;
                }

                // Validate dropdown/checkboxes have at least 2 options
                if (
                  (q.type === "dropdown" || q.type === "checkboxes") &&
                  q.options
                ) {
                  const validOptions = q.options.filter(
                    (opt) => opt && opt.trim() !== "",
                  );
                  if (validOptions.length < 2) {
                    errors.preScreeningQuestions =
                      "Dropdown and checkboxes questions must have at least 2 options";
                    break;
                  }
                }

                // Validate range questions have valid min < max
                if (q.type === "range") {
                  if (q.minValue === undefined || q.maxValue === undefined) {
                    errors.preScreeningQuestions =
                      "Range questions must have both minimum and maximum values";
                    break;
                  }
                  if (q.minValue >= q.maxValue) {
                    errors.preScreeningQuestions =
                      "Range minimum must be less than maximum";
                    break;
                  }
                }
              }
            }
            break;

          case "ai-interview":
            const totalQuestions = Object.values(
              state.aiInterviewQuestions,
            ).reduce((sum, cat) => sum + cat.questions.length, 0);
            if (totalQuestions < 5) {
              errors.aiInterviewQuestions =
                "Add at least 5 interview questions";
            } else {
              // Validate all questions have non-empty text
              for (const category of Object.values(
                state.aiInterviewQuestions,
              )) {
                for (const question of category.questions) {
                  if (!question.text || question.text.trim() === "") {
                    errors.aiInterviewQuestions =
                      "All interview questions must have question text";
                    break;
                  }
                }
                if (errors.aiInterviewQuestions) break;
              }
            }
            break;

          case "pipeline-stages":
            if (state.pipelineStages.length < 2) {
              errors.pipelineStages = "At least 2 core stages are required";
            }
            break;

          case "review":
            // Final review - validate all previous steps
            return get().validateAll();
        }

        set({ errors });
        return Object.keys(errors).length === 0;
      },

      validateAll: () => {
        const steps: Step[] = [
          "career-details",
          "cv-review",
          "ai-interview",
          "pipeline-stages",
        ];
        const state = get();

        for (const step of steps) {
          if (!state.validateStep(step)) {
            return false;
          }
        }

        return true;
      },

      // ============================================
      // SAVE & SUBMIT
      // ============================================
      saveDraft: async () => {
        const state = get();

        // Basic validation: require at least a job title for drafts
        // This prevents completely empty/useless drafts from being saved
        if (!state.jobTitle || !state.jobTitle.trim()) {
          set({
            saveError: "Please enter a job title before saving",
            isSaving: false,
          });
          throw new Error("Please enter a job title before saving");
        }

        set({ isSaving: true, saveError: null });

        console.log(
          "Attempting to save draft with orgID:",
          state.orgID,
          "user:",
          state.user.email,
        );

        try {
          const payload = {
            careerId: state.careerId,
            formType: state.formType,
            orgID: state.orgID,
            currentStep: state.currentStep,
            completedSteps: state.completedSteps,
            visitedSteps: state.visitedSteps,
            // Step 1: Career Details
            jobTitle: state.jobTitle,
            employmentType: state.employmentType,
            workSetup: state.workSetup,
            workSetupRemarks: state.workSetupRemarks,
            country: state.country,
            province: state.province,
            city: state.city,
            minimumSalary: state.minimumSalary,
            maximumSalary: state.maximumSalary,
            salaryNegotiable: state.salaryNegotiable,
            currency: state.currency,
            description: state.description,
            teamMembers: state.teamMembers,
            // Step 2: CV Review
            cvScreeningSetting: state.cvScreeningSetting,
            cvSecretPrompt: state.cvSecretPrompt,
            preScreeningQuestions: state.preScreeningQuestions,
            // Step 3: AI Interview
            aiInterviewScreeningSetting: state.aiInterviewScreeningSetting,
            requireVideo: state.requireVideo,
            aiInterviewSecretPrompt: state.aiInterviewSecretPrompt,
            aiInterviewQuestions: state.aiInterviewQuestions,
            // Step 4: Pipeline Stages
            pipelineStages: state.pipelineStages,
            // User info
            user: state.user,
          };

          const response = await axios.post("/api/save-career-draft", payload);

          if (response.status === 200) {
            set({
              careerId: response.data.careerId,
              lastSaved: new Date(),
              isDirty: false,
              isSaving: false,
            });
          }
        } catch (error: any) {
          set({
            saveError: error.response?.data?.error || "Failed to save draft",
            isSaving: false,
          });
        }
      },

      autoSave: async () => {
        const state = get();
        if (!state.isDirty || state.isSaving) {
          return;
        }

        await state.saveDraft();
      },

      submitCareer: async (status: "active" | "inactive") => {
        const state = get();

        // Prevent double submission
        if (state.isSaving) {
          console.warn(
            "Submission already in progress, ignoring duplicate call",
          );
          return;
        }

        if (!state.validateAll()) {
          throw new Error("Please complete all required fields");
        }

        set({ isSaving: true, saveError: null });

        try {
          const userInfoSlice = {
            image: state.user.image,
            name: state.user.name,
            email: state.user.email,
          };

          const payload = {
            _id: state.careerId,
            jobTitle: state.jobTitle,
            description: state.description,
            workSetup: state.workSetup,
            workSetupRemarks: state.workSetupRemarks,
            screeningSetting: state.cvScreeningSetting,
            requireVideo: state.requireVideo,
            salaryNegotiable: state.salaryNegotiable,
            minimumSalary: state.minimumSalary
              ? Number(state.minimumSalary)
              : null,
            maximumSalary: state.maximumSalary
              ? Number(state.maximumSalary)
              : null,
            country: state.country,
            province: state.province,
            location: state.city, // Backwards compatibility
            employmentType: state.employmentType,
            cvSecretPrompt: state.cvSecretPrompt,
            preScreeningQuestions: state.preScreeningQuestions,
            aiInterviewSecretPrompt: state.aiInterviewSecretPrompt,
            aiInterviewQuestions: state.aiInterviewQuestions,
            pipelineStages: state.pipelineStages,
            status,
            isDraft: false,
            orgID: state.orgID,
            ...(state.formType === "add"
              ? { addedBy: userInfoSlice }
              : { lastEditedBy: userInfoSlice, updatedAt: Date.now() }),
          };

          const endpoint =
            state.formType === "add" ? "/api/add-career" : "/api/update-career";

          // Get auth token from localStorage
          const authToken =
            typeof window !== "undefined"
              ? localStorage.getItem("authToken")
              : null;
          const headers = authToken
            ? { Authorization: `Bearer ${authToken}` }
            : {};

          const response = await axios.post(endpoint, payload, { headers });

          if (response.status === 200) {
            set({
              careerId: response.data.careerId || state.careerId,
              isDraft: false,
              lastSaved: new Date(),
              isDirty: false,
              isSaving: false,
            });
          }
        } catch (error: any) {
          set({
            saveError: error.response?.data?.error || "Failed to submit career",
            isSaving: false,
          });
          throw error;
        }
      },

      // ============================================
      // LOAD & INITIALIZE
      // ============================================
      loadCareer: async (id: string) => {
        try {
          const response = await axios.get(`/api/get-career?id=${id}`);
          const career = response.data;

          set({
            careerId: career._id,
            jobTitle: career.jobTitle || "",
            description: career.description || "",
            workSetup: career.workSetup || "",
            workSetupRemarks: career.workSetupRemarks || "",
            employmentType: career.employmentType || "Full-Time",
            country: career.country || "Philippines",
            province: career.province || "",
            city: career.location || "",
            minimumSalary: career.minimumSalary?.toString() || "",
            maximumSalary: career.maximumSalary?.toString() || "",
            salaryNegotiable: career.salaryNegotiable ?? true,
            cvScreeningSetting: career.screeningSetting || "Good Fit and above",
            requireVideo: career.requireVideo ?? true,
            cvSecretPrompt: career.cvSecretPrompt || "",
            preScreeningQuestions: career.preScreeningQuestions || [],
            aiInterviewSecretPrompt: career.aiInterviewSecretPrompt || "",
            aiInterviewQuestions: migrateAIQuestions(
              career.aiInterviewQuestions,
            ),
            pipelineStages: career.pipelineStages || DEFAULT_PIPELINE_STAGES,
            isDraft: career.isDraft ?? false,
            currentStep: career.currentStep || "career-details",
            completedSteps: career.completedSteps || [],
            visitedSteps: career.visitedSteps || ["career-details"],
            formType: "edit",
          });
        } catch (error) {
          console.error("Failed to load career:", error);
          throw error;
        }
      },

      resetForm: () => {
        set(initialState);
      },

      initializeForm: async (type, orgID, user, careerId, careerData) => {
        // IMPORTANT: Set orgID and user first before resetting to initialState
        // This prevents losing the orgID and user data when creating a new career

        if (type === "edit" && careerId) {
          set({ formType: type, orgID, user });

          // If careerData is provided, use it directly (avoid duplicate API call)
          if (careerData) {
            const teamMembers = careerData.teamMembers || [];
            // Ensure current user is in team members as Job Owner
            const currentUserAsOwner = {
              id: `owner-${user.email}`,
              name: user.name,
              email: user.email,
              role: "Job Owner" as const,
            };
            const hasOwner = teamMembers.some(
              (m: any) => m.role === "Job Owner",
            );
            const finalTeamMembers = hasOwner
              ? teamMembers
              : [currentUserAsOwner, ...teamMembers];

            set({
              careerId: careerData._id,
              jobTitle: careerData.jobTitle || "",
              description: careerData.description || "",
              workSetup: careerData.workSetup || "",
              workSetupRemarks: careerData.workSetupRemarks || "",
              employmentType: careerData.employmentType || "Full-Time",
              country: careerData.country || "Philippines",
              province: careerData.province || "",
              city: careerData.city || careerData.location || "",
              minimumSalary: careerData.minimumSalary?.toString() || "",
              maximumSalary: careerData.maximumSalary?.toString() || "",
              salaryNegotiable: careerData.salaryNegotiable ?? true,
              currency: careerData.currency || "PHP",
              teamMembers: finalTeamMembers,
              cvScreeningSetting:
                careerData.cvScreeningSetting ||
                careerData.screeningSetting ||
                "Good Fit and above",
              requireVideo: careerData.requireVideo ?? true,
              cvSecretPrompt: careerData.cvSecretPrompt || "",
              preScreeningQuestions: careerData.preScreeningQuestions || [],
              aiInterviewScreeningSetting:
                careerData.aiInterviewScreeningSetting || "Good Fit and above",
              aiInterviewSecretPrompt: careerData.aiInterviewSecretPrompt || "",
              aiInterviewQuestions: migrateAIQuestions(
                careerData.aiInterviewQuestions,
              ),
              pipelineStages:
                careerData.pipelineStages || DEFAULT_PIPELINE_STAGES,
              isDraft: careerData.isDraft ?? false,
              currentStep: careerData.currentStep || "career-details",
              completedSteps: careerData.completedSteps || [],
              visitedSteps: careerData.visitedSteps || ["career-details"],
              formType: "edit",
            });
          } else {
            // Fallback to API call if no careerData provided
            await get().loadCareer(careerId);
          }
        } else {
          // For "add" mode, reset to initialState but preserve orgID and user
          const currentUserAsOwner = {
            id: `owner-${user.email}`,
            name: user.name,
            email: user.email,
            role: "Job Owner" as const,
          };
          set({
            ...initialState,
            formType: type,
            orgID,
            user,
            teamMembers: [currentUserAsOwner],
          });
        }
      },

      // ============================================
      // PRE-SCREENING QUESTIONS
      // ============================================
      addPreScreeningQuestion: (question) => {
        const state = get();
        set({
          preScreeningQuestions: [...state.preScreeningQuestions, question],
          isDirty: true,
        });
      },

      removePreScreeningQuestion: (id) => {
        const state = get();
        set({
          preScreeningQuestions: state.preScreeningQuestions.filter(
            (q) => q.id !== id,
          ),
          isDirty: true,
        });
      },

      updatePreScreeningQuestion: (id, updates) => {
        const state = get();
        set({
          preScreeningQuestions: state.preScreeningQuestions.map((q) =>
            q.id === id ? { ...q, ...updates } : q,
          ),
          isDirty: true,
        });
      },

      reorderPreScreeningQuestions: (questions) => {
        set({
          preScreeningQuestions: questions,
          isDirty: true,
        });
      },

      // ============================================
      // AI INTERVIEW QUESTIONS
      // ============================================
      generateAIQuestions: async (category) => {
        const state = get();
        set({ isSaving: true });

        try {
          const response = await axios.post("/api/generate-questions", {
            category,
            jobTitle: state.jobTitle,
            description: state.description,
            generateAll: false, // Regular generation: 3 questions
          });

          if (response.status === 200) {
            const questionStrings: string[] = response.data.questions || [];
            // Convert string[] to AIQuestion[] with unique IDs
            const newQuestions: AIQuestion[] = questionStrings.map((text) => ({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              text,
            }));

            const currentState = get();
            const updatedQuestions = [
              ...currentState.aiInterviewQuestions[category].questions,
              ...newQuestions,
            ];

            set({
              aiInterviewQuestions: {
                ...currentState.aiInterviewQuestions,
                [category]: {
                  questions: updatedQuestions,
                  questionsToAsk: Math.min(3, updatedQuestions.length),
                },
              },
              isDirty: true,
            });
          }
        } catch (error) {
          console.error("Failed to generate questions:", error);
          set({ isSaving: false });
        }
      },

      generateAllAIQuestions: async () => {
        const state = get();
        const categories: (keyof CareerFormState["aiInterviewQuestions"])[] = [
          "cvValidation",
          "technical",
          "behavioral",
          "analytical",
          "others",
        ];

        set({ isSaving: true });

        for (const category of categories) {
          try {
            const response = await axios.post("/api/generate-questions", {
              category,
              jobTitle: state.jobTitle,
              description: state.description,
              generateAll: true, // Generate All mode: 1 question per category
            });

            if (response.status === 200) {
              const questionStrings: string[] = response.data.questions || [];
              // Convert string[] to AIQuestion[] with unique IDs
              const newQuestions: AIQuestion[] = questionStrings.map(
                (text) => ({
                  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  text,
                }),
              );

              // Use functional update to ensure we have the latest state
              set((currentState) => {
                const updatedQuestions = [
                  ...currentState.aiInterviewQuestions[category].questions,
                  ...newQuestions,
                ];

                return {
                  aiInterviewQuestions: {
                    ...currentState.aiInterviewQuestions,
                    [category]: {
                      questions: updatedQuestions,
                      questionsToAsk: Math.min(3, updatedQuestions.length),
                    },
                  },
                  isDirty: true,
                };
              });
            }
          } catch (error) {
            console.error(
              `Failed to generate questions for ${category}:`,
              error,
            );
          }
        }
        set({ isSaving: false });
      },

      addAIQuestion: (category, questionText) => {
        const state = get();
        const newQuestion: AIQuestion = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: questionText,
        };

        const updatedQuestions = [
          ...state.aiInterviewQuestions[category].questions,
          newQuestion,
        ];

        set({
          aiInterviewQuestions: {
            ...state.aiInterviewQuestions,
            [category]: {
              questions: updatedQuestions,
              questionsToAsk: Math.min(3, updatedQuestions.length),
            },
          },
          isDirty: true,
          isSaving: false,
        });
      },

      updateAIQuestion: (category, questionId, questionText) => {
        const state = get();
        const updatedQuestions = state.aiInterviewQuestions[
          category
        ].questions.map((q) =>
          q.id === questionId ? { ...q, text: questionText } : q,
        );

        set({
          aiInterviewQuestions: {
            ...state.aiInterviewQuestions,
            [category]: {
              ...state.aiInterviewQuestions[category],
              questions: updatedQuestions,
            },
          },
          isDirty: true,
        });
      },

      removeAIQuestion: (category, questionId) => {
        const state = get();
        set({
          aiInterviewQuestions: {
            ...state.aiInterviewQuestions,
            [category]: {
              ...state.aiInterviewQuestions[category],
              questions: state.aiInterviewQuestions[category].questions.filter(
                (q) => q.id !== questionId,
              ),
            },
          },
          isDirty: true,
        });
      },

      reorderAIQuestions: (category, questions) => {
        const state = get();
        set({
          aiInterviewQuestions: {
            ...state.aiInterviewQuestions,
            [category]: {
              ...state.aiInterviewQuestions[category],
              questions,
            },
          },
          isDirty: true,
        });
      },

      updateQuestionsToAsk: (category, count) => {
        const state = get();
        set({
          aiInterviewQuestions: {
            ...state.aiInterviewQuestions,
            [category]: {
              ...state.aiInterviewQuestions[category],
              questionsToAsk: count,
            },
          },
          isDirty: true,
        });
      },

      // ============================================
      // PIPELINE STAGES
      // ============================================
      addPipelineStage: (stage) => {
        const state = get();
        set({
          pipelineStages: [...state.pipelineStages, stage],
          isDirty: true,
        });
      },

      removePipelineStage: (id) => {
        const state = get();
        const stage = state.pipelineStages.find((s) => s.id === id);

        if (stage?.isCore) {
          console.error("Cannot remove core stages");
          return;
        }

        set({
          pipelineStages: state.pipelineStages.filter((s) => s.id !== id),
          isDirty: true,
        });
      },

      reorderPipelineStages: (stages) => {
        set({ pipelineStages: stages, isDirty: true });
      },

      addSubstage: (stageId, substage) => {
        const state = get();
        set({
          pipelineStages: state.pipelineStages.map((stage) =>
            stage.id === stageId
              ? { ...stage, substages: [...stage.substages, substage] }
              : stage,
          ),
          isDirty: true,
        });
      },

      removeSubstage: (stageId, substageId) => {
        const state = get();
        set({
          pipelineStages: state.pipelineStages.map((stage) =>
            stage.id === stageId
              ? {
                  ...stage,
                  substages: stage.substages.filter((s) => s.id !== substageId),
                }
              : stage,
          ),
          isDirty: true,
        });
      },

      // ============================================
      // TEAM MEMBERS
      // ============================================
      addTeamMember: (member) => {
        const state = get();
        // Prevent adding duplicate members
        if (state.teamMembers.some((m) => m.email === member.email)) {
          return;
        }
        set({
          teamMembers: [...state.teamMembers, member],
          isDirty: true,
        });
      },

      removeTeamMember: (id) => {
        const state = get();
        // Prevent removing the Job Owner
        const memberToRemove = state.teamMembers.find((m) => m.id === id);
        if (memberToRemove?.role === "Job Owner") {
          return;
        }
        set({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
          isDirty: true,
        });
      },

      updateTeamMemberRole: (id, role) => {
        const state = get();
        set({
          teamMembers: state.teamMembers.map((member) =>
            member.id === id
              ? { ...member, role: role as TeamMember["role"] }
              : member,
          ),
          isDirty: true,
        });
      },
    }),
    { name: "CareerFormStore" },
  ),
);
