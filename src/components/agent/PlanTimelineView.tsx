// src/components/agent/PlanTimelineView.tsx
// Transparent Execution & Step-by-Step Plan View with Outcome Verification Badges

import React, { useState } from 'react';
import { useAgent } from '../../context/AgentContext';
import { AgentStep, StepStatus, RiskLevel } from '../../types/agent';
import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles, 
  FileCheck, 
  RotateCcw, 
  Edit3, 
  ChevronRight, 
  ChevronDown,
  Eye,
  Check,
  X,
  Play
} from 'lucide-react';

export const PlanTimelineView: React.FC = () => {
  const { plan, updateStep, executePlanStepByStep } = useAgent();
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  if (!plan) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 select-none">
        <Sparkles className="w-10 h-10 text-sky-400/40 mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold text-white mb-1">No Active Execution Plan</h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Type an instruction below or select a flagship workflow preset to generate an editable step-by-step plan.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: StepStatus) => {
    switch (status) {
      case 'DONE':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VERIFIED DONE</span>
          </span>
        );
      case 'RUNNING':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-400 bg-sky-950/70 border border-sky-400/40 px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>RUNNING</span>
          </span>
        );
      case 'VERIFYING':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 bg-indigo-950/70 border border-indigo-500/40 px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VERIFYING READ-BACK</span>
          </span>
        );
      case 'AWAITING_APPROVAL':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>AWAITING APPROVAL</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/70 border border-rose-500/40 px-2.5 py-0.5 rounded-full shadow-sm">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>FAILED</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded-full shadow-sm">
            <X className="w-3.5 h-3.5" />
            <span>CANCELLED</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-900/60 border border-slate-700 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 text-[10px] font-mono font-semibold">HIGH RISK</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold">MEDIUM RISK</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-500/30 text-sky-300 text-[10px] font-mono font-semibold">LOW RISK</span>;
    }
  };

  const handleStartEdit = (step: AgentStep) => {
    setEditingStepId(step.id);
    setEditedTitle(step.title);
  };

  const handleSaveEdit = (stepId: string) => {
    if (editedTitle.trim()) {
      updateStep(stepId, { title: editedTitle.trim() });
    }
    setEditingStepId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar select-text">
      {/* Plan Header Summary */}
      <div className="p-3.5 rounded-2xl bg-[#091122]/90 border border-sky-500/20 shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase text-sky-400 font-bold tracking-wider">
            {plan.workflowType || 'Autonomous'} Workflow Plan
          </span>
          <h4 className="text-xs font-semibold text-white mt-0.5 line-clamp-1">
            {plan.goal}
          </h4>
        </div>
        <div className="text-right shrink-0 ml-3">
          <span className="text-[11px] font-mono text-slate-300 font-bold">
            {plan.steps.filter(s => s.status === 'DONE').length} / {plan.steps.length} Steps
          </span>
        </div>
      </div>

      {/* Launch Execution Banner */}
      {plan.status === 'PLANNING' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/90 to-indigo-950/90 border border-sky-400/40 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-white block">Plan Ready for Review</span>
            <span className="text-[11px] text-slate-300">Edit any step below, then start autonomous execution.</span>
          </div>
          <button
            type="button"
            onClick={executePlanStepByStep}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-950/50 flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Execution</span>
          </button>
        </div>
      )}

      {/* Step Cards List */}
      <div className="space-y-2.5">
        {plan.steps.map((step, idx) => {
          const isExpanded = expandedStepId === step.id;
          const isEditing = editingStepId === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                step.status === 'RUNNING' || step.status === 'VERIFYING'
                  ? 'bg-[#0E1A36] border-sky-400/60 shadow-lg shadow-sky-950/50 ring-1 ring-sky-400/30'
                  : step.status === 'DONE'
                  ? 'bg-[#091526]/80 border-emerald-500/30'
                  : step.status === 'AWAITING_APPROVAL'
                  ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/50'
                  : 'bg-[#0A1224]/70 border-white/5 hover:border-white/10'
              }`}
            >
              {/* Step Card Header */}
              <div className="p-3.5 flex items-start gap-3">
                {/* Step Number Circle */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                  step.status === 'DONE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : step.status === 'RUNNING'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/40'
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}>
                  {idx + 1}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {getStatusBadge(step.status)}
                    {getRiskBadge(step.riskLevel)}
                    {step.toolName && (
                      <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-slate-300">
                        tool: {step.toolName}
                      </span>
                    )}
                  </div>

                  {/* Title (or Inline Editor) */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-black/60 border border-sky-400 text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(step.id)}
                        className="p-1 rounded bg-sky-600 text-white hover:bg-sky-500"
                        title="Save Edit"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingStepId(null)}
                        className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <h5 className="text-xs font-bold text-white tracking-tight">
                        {step.title}
                      </h5>
                      {plan.status === 'PLANNING' && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(step)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-sky-300 transition-opacity"
                          title="Edit step description"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                    {step.description}
                  </p>

                  {/* Failure / Error Banner */}
                  {step.error && (
                    <div className="mt-2 p-2 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{step.error}</span>
                    </div>
                  )}
                </div>

                {/* Expand Toggle */}
                {step.evidence && (
                  <button
                    type="button"
                    onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Evidence & Verification Disclosure Section */}
              {isExpanded && step.evidence && (
                <div className="px-4 pb-3.5 pt-1 border-t border-white/5 bg-black/40 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
                    <span className="flex items-center gap-1 font-bold">
                      <FileCheck className="w-3 h-3" />
                      VERIFIED EVIDENCE ({step.evidence.type.toUpperCase()})
                    </span>
                    <span className="text-slate-400">
                      {new Date(step.evidence.verifiedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-mono bg-black/60 p-2.5 rounded-xl border border-white/10 leading-relaxed">
                    {step.evidence.summary}
                  </p>
                  {step.evidence.sourceUrl && (
                    <div className="text-[10px] text-sky-400 truncate">
                      Source: <a href={step.evidence.sourceUrl} target="_blank" rel="noreferrer" className="underline">{step.evidence.sourceUrl}</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
