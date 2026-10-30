// src/context/AgentContext.tsx
// Core React State & Execution Management for AdaL Autonomous Multimodal Companion

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { AgentPlan, AgentStep, AgentLogEntry, ApprovalRequest, StepStatus, PlanStatus } from '../types/agent';
import { AgentExecutionRunner } from '../services/agent/AgentExecutionRunner';

interface AgentContextType {
  plan: AgentPlan | null;
  logs: AgentLogEntry[];
  approvalRequest: ApprovalRequest | null;
  isPanelOpen: boolean;
  activePanelTab: 'plan' | 'timeline' | 'logs' | 'artifacts';
  manualTakeover: boolean;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setActivePanelTab: (tab: 'plan' | 'timeline' | 'logs' | 'artifacts') => void;
  submitGoal: (goalText: string, workflowType?: 'WORKFLOW_A' | 'WORKFLOW_B' | 'CUSTOM') => Promise<void>;
  updateStep: (stepId: string, updates: Partial<AgentStep>) => void;
  pausePlan: () => void;
  resumePlan: () => void;
  cancelPlan: () => void;
  toggleManualTakeover: () => void;
  resolveApproval: (approved: boolean) => void;
  addLog: (level: AgentLogEntry['level'], source: AgentLogEntry['source'], message: string, data?: any) => void;
  clearLogs: () => void;
  executePlanStepByStep: () => Promise<void>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState<'plan' | 'timeline' | 'logs' | 'artifacts'>('plan');
  const [manualTakeover, setManualTakeover] = useState(false);

  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);
  const approvalResolverRef = useRef<((approved: boolean) => void) | null>(null);

  const addLog = useCallback((level: AgentLogEntry['level'], source: AgentLogEntry['source'], message: string, data?: any) => {
    const entry: AgentLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      level,
      source,
      message,
      data
    };
    setLogs(prev => [...prev.slice(-200), entry]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const togglePanel = useCallback(() => setIsPanelOpen(prev => !prev), []);
  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  const updateStep = useCallback((stepId: string, updates: Partial<AgentStep>) => {
    setPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        steps: prev.steps.map(step => step.id === stepId ? { ...step, ...updates } : step)
      };
    });
  }, []);

  const toggleManualTakeover = useCallback(() => {
    setManualTakeover(prev => {
      const next = !prev;
      setPlan(p => p ? { ...p, manualTakeover: next } : null);
      addLog('warn', 'user', next 
        ? 'Manual Takeover ACTIVATED: Automated browser actions suspended. User has manual control of active tab.' 
        : 'Manual Takeover DEACTIVATED: Automated browser execution resumed.');
      return next;
    });
  }, [addLog]);

  const pausePlan = useCallback(() => {
    isPausedRef.current = true;
    setPlan(prev => prev ? { ...prev, status: 'PAUSED' } : null);
    addLog('warn', 'user', 'Execution PAUSED by user. Current state preserved.');
  }, [addLog]);

  const resumePlan = useCallback(() => {
    isPausedRef.current = false;
    setPlan(prev => prev ? { ...prev, status: 'RUNNING' } : null);
    addLog('info', 'user', 'Execution RESUMED by user.');
  }, [addLog]);

  const cancelPlan = useCallback(() => {
    isCancelledRef.current = true;
    setPlan(prev => prev ? { ...prev, status: 'CANCELLED', completedAt: Date.now() } : null);
    setApprovalRequest(null);
    setManualTakeover(false);
    addLog('error', 'user', 'Execution CANCELLED by user. All pending tasks terminated.');
  }, [addLog]);

  const resolveApproval = useCallback((approved: boolean) => {
    if (approvalResolverRef.current) {
      approvalResolverRef.current(approved);
      approvalResolverRef.current = null;
    }
    if (!approvalRequest) return;
    if (approved) {
      addLog('success', 'policy', `Approval GRANTED by user for action "${approvalRequest.title}". Resuming execution.`);
      setPlan(prev => prev ? { ...prev, status: 'RUNNING' } : null);
    } else {
      addLog('warn', 'policy', `Approval DENIED by user for action "${approvalRequest.title}". Step marked as cancelled.`);
      updateStep(approvalRequest.stepId, { status: 'CANCELLED', error: 'Action rejected by user at approval gate.' });
      setPlan(prev => prev ? { ...prev, status: 'RUNNING' } : null);
    }
    setApprovalRequest(null);
  }, [approvalRequest, addLog, updateStep]);

  const requestApproval = useCallback((req: ApprovalRequest): Promise<boolean> => {
    setApprovalRequest(req);
    return new Promise((resolve) => {
      approvalResolverRef.current = resolve;
    });
  }, []);

  // Submit Goal & Generate Initial Structured Plan
  const submitGoal = useCallback(async (goalText: string, workflowType?: 'WORKFLOW_A' | 'WORKFLOW_B' | 'CUSTOM') => {
    const trimmed = goalText.trim();
    if (!trimmed) return;

    isPausedRef.current = false;
    isCancelledRef.current = false;
    setIsPanelOpen(true);
    setActivePanelTab('plan');

    addLog('info', 'planner', `Received goal instruction: "${trimmed}"`);

    // Determine workflow type if not explicitly supplied
    let detectedWorkflow = workflowType;
    if (!detectedWorkflow) {
      const lower = trimmed.toLowerCase();
      if (lower.includes('startup') || lower.includes('spreadsheet') || lower.includes('pricing') || lower.includes('compare product')) {
        detectedWorkflow = 'WORKFLOW_A';
      } else if (lower.includes('marketing') || lower.includes('target audience') || lower.includes('campaign') || lower.includes('competitor')) {
        detectedWorkflow = 'WORKFLOW_B';
      } else {
        detectedWorkflow = 'CUSTOM';
      }
    }

    addLog('info', 'planner', `Synthesizing editable execution plan for archetype: ${detectedWorkflow}...`);

    let steps: AgentStep[] = [];

    if (detectedWorkflow === 'WORKFLOW_A') {
      steps = [
        {
          id: 'step-1',
          order: 1,
          title: 'Discover 10 High-Growth AI Startups',
          description: 'Query live tech discovery directories and scrape names, domains, and core category niches.',
          status: 'PENDING',
          riskLevel: 'LOW',
          toolName: 'research_query_web',
          toolInput: { query: 'leading top generative AI startups 2026 funding product' },
          retryCount: 0
        },
        {
          id: 'step-2',
          order: 2,
          title: 'Navigate & Extract Product Offerings',
          description: 'Visit each startup website via real browser tabs, extract clean product descriptions and features.',
          status: 'PENDING',
          riskLevel: 'LOW',
          toolName: 'browser_snapshot_dom',
          retryCount: 0
        },
        {
          id: 'step-3',
          order: 3,
          title: 'Locate & Verify Pricing Tiers',
          description: 'Navigate to pricing pages or public documentation. Collect verifiable dollar amounts and subscription models.',
          status: 'PENDING',
          riskLevel: 'LOW',
          toolName: 'browser_navigate',
          retryCount: 0
        },
        {
          id: 'step-4',
          order: 4,
          title: 'Flag Unknowns & Synthesize Comparative Matrix',
          description: 'Match extracted facts against strict evidence. Mark any unverified cells as "UNKNOWN (no source found)".',
          status: 'PENDING',
          riskLevel: 'LOW',
          retryCount: 0
        },
        {
          id: 'step-5',
          order: 5,
          title: 'Generate Real Spreadsheet (.xlsx & .csv)',
          description: 'Write complete comparative dataset to a structured spreadsheet with auto-width headers and styled tables.',
          status: 'PENDING',
          riskLevel: 'MEDIUM',
          toolName: 'spreadsheet_write_and_verify',
          retryCount: 0
        },
        {
          id: 'step-6',
          order: 6,
          title: 'Read-Back Outcome Verification',
          description: 'Re-read the physical spreadsheet back from disk. Verify cell integrity, row counts, and ground-truth citations.',
          status: 'PENDING',
          riskLevel: 'LOW',
          retryCount: 0
        }
      ];
    } else if (detectedWorkflow === 'WORKFLOW_B') {
      steps = [
        {
          id: 'step-1',
          order: 1,
          title: 'Analyze Target Audience & ICP Persona',
          description: 'Extract demographics, pain points, motivations, and purchasing triggers for the specified product.',
          status: 'PENDING',
          riskLevel: 'LOW',
          toolName: 'research_query_web',
          retryCount: 0
        },
        {
          id: 'step-2',
          order: 2,
          title: 'Perform Deep Competitor Benchmarking',
          description: 'Analyze 3 direct market competitors: messaging, weaknesses, and differentiation opportunities.',
          status: 'PENDING',
          riskLevel: 'LOW',
          toolName: 'browser_navigate',
          retryCount: 0
        },
        {
          id: 'step-3',
          order: 3,
          title: 'Formulate Creative Concept & Positioning',
          description: 'Craft headline hooks, value proposition narratives, and multi-channel campaign themes.',
          status: 'PENDING',
          riskLevel: 'LOW',
          retryCount: 0
        },
        {
          id: 'step-4',
          order: 4,
          title: 'Generate Supporting Creative Assets & Script',
          description: 'Produce high-fidelity creative visuals, plus a 30-second voiceover/video launch script.',
          status: 'PENDING',
          riskLevel: 'MEDIUM',
          toolName: 'gtm_generate_campaign',
          retryCount: 0
        },
        {
          id: 'step-5',
          order: 5,
          title: 'Prepare Launch Campaign Pack & Approval Gate',
          description: 'Compile copy, editorial calendar, and checklist into a launch package marked explicitly as DRAFT.',
          status: 'PENDING',
          riskLevel: 'HIGH',
          toolName: 'consequential_publish',
          retryCount: 0
        }
      ];
    } else {
      steps = [
        {
          id: 'step-1',
          order: 1,
          title: 'Initial Research & Information Gathering',
          description: `Gather requirements, relevant pages, and data sources for: "${trimmed.slice(0, 40)}..."`,
          status: 'PENDING',
          riskLevel: 'LOW',
          retryCount: 0
        },
        {
          id: 'step-2',
          order: 2,
          title: 'Execute Browser Navigation & Data Extraction',
          description: 'Navigate to target URLs and scrape structural content securely via CDP.',
          status: 'PENDING',
          riskLevel: 'LOW',
          retryCount: 0
        },
        {
          id: 'step-3',
          order: 3,
          title: 'Synthesize Findings & Prepare Deliverables',
          description: 'Assemble output artifacts with verified citations and review state.',
          status: 'PENDING',
          riskLevel: 'MEDIUM',
          retryCount: 0
        }
      ];
    }

    const newPlan: AgentPlan = {
      id: `plan-${Date.now()}`,
      goal: trimmed,
      workflowType: detectedWorkflow,
      status: 'PLANNING',
      steps,
      currentStepIndex: 0,
      manualTakeover: false,
      createdAt: Date.now()
    };

    setPlan(newPlan);
    addLog('success', 'planner', `Plan generated with ${steps.length} sequential steps ready for execution.`);
  }, [addLog]);

  const addArtifact = useCallback((art: { name: string; path: string; type: 'spreadsheet' | 'gtm_pack'; size?: string; summary?: string }) => {
    setPlan(prev => {
      if (!prev) return null;
      const existing = prev.artifacts || [];
      return {
        ...prev,
        artifacts: [...existing, art]
      };
    });
  }, []);

  // Step-By-Step Autonomous Orchestration Runner
  const executePlanStepByStep = useCallback(async () => {
    if (!plan || plan.steps.length === 0) return;
    setPlan(prev => prev ? { ...prev, status: 'RUNNING', startedAt: prev.startedAt || Date.now() } : null);
    addLog('info', 'router', 'Starting autonomous step execution...');

    const success = await AgentExecutionRunner.executePlan(plan, {
      onStepUpdate: (stepId, updates) => updateStep(stepId, updates),
      onLog: (level, source, message, data) => addLog(level, source, message, data),
      onRequestApproval: requestApproval,
      onAddArtifact: addArtifact,
      checkIsPaused: () => isPausedRef.current,
      checkIsCancelled: () => isCancelledRef.current,
      checkIsManualTakeover: () => manualTakeover
    });

    setPlan(prev => prev ? {
      ...prev,
      status: isCancelledRef.current ? 'CANCELLED' : success ? 'DONE' : 'FAILED',
      completedAt: Date.now()
    } : null);
  }, [plan, updateStep, addLog, requestApproval, addArtifact, manualTakeover]);

  return (
    <AgentContext.Provider
      value={{
        plan,
        logs,
        approvalRequest,
        isPanelOpen,
        activePanelTab,
        manualTakeover,
        togglePanel,
        openPanel,
        closePanel,
        setActivePanelTab,
        submitGoal,
        updateStep,
        pausePlan,
        resumePlan,
        cancelPlan,
        toggleManualTakeover,
        resolveApproval,
        addLog,
        clearLogs,
        executePlanStepByStep
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
