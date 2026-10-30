// src/types/agent.ts
// Comprehensive Type System for AdaL Autonomous Multimodal Companion

export type StepStatus = 
  | 'PENDING'
  | 'RUNNING'
  | 'AWAITING_APPROVAL'
  | 'VERIFYING'
  | 'DONE'
  | 'FAILED'
  | 'CANCELLED';

export type PlanStatus =
  | 'IDLE'
  | 'PLANNING'
  | 'RUNNING'
  | 'PAUSED'
  | 'AWAITING_APPROVAL'
  | 'DONE'
  | 'FAILED'
  | 'CANCELLED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StepEvidence {
  type: 'readback' | 'dom' | 'file' | 'screenshot' | 'network';
  summary: string;
  sourceUrl?: string;
  verifiedAt: number;
  data?: any;
}

export interface AgentStep {
  id: string;
  order: number;
  title: string;
  description: string;
  status: StepStatus;
  riskLevel: RiskLevel;
  toolName?: string;
  toolInput?: any;
  toolOutput?: any;
  evidence?: StepEvidence;
  error?: string;
  retryCount: number;
  executedAt?: number;
  completedAt?: number;
}

export interface AgentPlan {
  id: string;
  goal: string;
  workflowType?: 'WORKFLOW_A' | 'WORKFLOW_B' | 'CUSTOM';
  status: PlanStatus;
  steps: AgentStep[];
  currentStepIndex: number;
  manualTakeover: boolean;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  artifacts?: Array<{
    name: string;
    path: string;
    type: 'spreadsheet' | 'gtm_pack' | 'screenshot' | 'document';
    size?: string;
    summary?: string;
  }>;
}

export interface AgentLogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success' | 'action';
  source: 'planner' | 'router' | 'verifier' | 'policy' | 'cdp' | 'user';
  message: string;
  data?: any;
}

export interface ApprovalRequest {
  id: string;
  stepId: string;
  actionType: 'publish' | 'send' | 'delete' | 'submit' | 'purchase';
  title: string;
  description: string;
  riskLevel: 'HIGH';
  previewData: any;
  createdAt: number;
}
