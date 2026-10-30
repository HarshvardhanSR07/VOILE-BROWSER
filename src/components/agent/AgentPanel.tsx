// src/components/agent/AgentPanel.tsx
// Complete Transparent Execution Side-Panel for AdaL Autonomous Companion

import React, { useState } from 'react';
import { useAgent } from '../../context/AgentContext';
import { PlanTimelineView } from './PlanTimelineView';
import { LiveLogsView } from './LiveLogsView';
import { ArtifactsView } from './ArtifactsView';
import { ApprovalModal } from './ApprovalModal';
import { 
  Bot, 
  Sparkles, 
  Pause, 
  Play, 
  X, 
  Hand, 
  AlertOctagon, 
  Send, 
  Terminal, 
  ListOrdered, 
  FolderCheck,
  Zap,
  ShieldAlert
} from 'lucide-react';

export const AgentPanel: React.FC = () => {
  const {
    plan,
    isPanelOpen,
    closePanel,
    activePanelTab,
    setActivePanelTab,
    submitGoal,
    pausePlan,
    resumePlan,
    cancelPlan,
    manualTakeover,
    toggleManualTakeover,
    executePlanStepByStep
  } = useAgent();

  const [goalInput, setGoalInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isPanelOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitGoal(goalInput.trim());
      setGoalInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetSelect = async (presetType: 'WORKFLOW_A' | 'WORKFLOW_B') => {
    if (presetType === 'WORKFLOW_A') {
      await submitGoal(
        'Research 10 AI startups, compare product and pricing, and create a spreadsheet.',
        'WORKFLOW_A'
      );
    } else {
      await submitGoal(
        'Analyse target audience for product Voile, research competitors, create marketing concept, generate creative assets, and prepare a launch campaign.',
        'WORKFLOW_B'
      );
    }
  };

  return (
    <>
      {/* High-Risk Consequential Action Approval Gate Modal */}
      <ApprovalModal />

      {/* Main Companion Execution Panel Container */}
      <aside className="fixed top-12 right-0 bottom-0 z-40 w-[540px] max-w-[calc(100vw-2rem)] bg-[#070D18]/95 backdrop-blur-2xl border-l border-sky-500/25 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200 select-none">
        {/* 1. Header with Status & Control Toolbar */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#0B152A] to-[#070D18] flex items-center justify-between gap-3">
          {/* Brand & Companion Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  AdaL Companion
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-400/30 text-sky-300 font-mono text-[10px] font-semibold">
                  Autonomous Runtime
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Plan $\to$ Act $\to$ Observe $\to$ Verify Loop
              </p>
            </div>
          </div>

          {/* Action Control Toolbar: Pause / Takeover / Cancel / Close */}
          <div className="flex items-center gap-1.5">
            {plan && (
              <>
                {/* Pause / Resume */}
                <button
                  type="button"
                  onClick={plan.status === 'PAUSED' ? resumePlan : pausePlan}
                  className={`p-2 rounded-xl transition-all shadow-sm ${
                    plan.status === 'PAUSED'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                  title={plan.status === 'PAUSED' ? 'Resume Autonomous Execution' : 'Pause Execution'}
                >
                  {plan.status === 'PAUSED' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>

                {/* Manual Takeover Toggle */}
                <button
                  type="button"
                  onClick={toggleManualTakeover}
                  className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    manualTakeover
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-amber-300'
                  }`}
                  title="Manual Takeover: Suspend automation and interact directly with the tab"
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span>{manualTakeover ? 'TAKEOVER ON' : 'TAKEOVER'}</span>
                </button>

                {/* Cancel / Stop */}
                <button
                  type="button"
                  onClick={cancelPlan}
                  className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 transition-all"
                  title="Cancel Execution Plan"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Close Panel */}
            <button
              type="button"
              onClick={closePanel}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#060B14] px-3 pt-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActivePanelTab('plan')}
            className={`px-3.5 py-2 rounded-t-xl font-medium transition-all flex items-center gap-1.5 ${
              activePanelTab === 'plan'
                ? 'bg-[#091122] text-sky-400 border-t border-x border-sky-500/30 border-b-transparent font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Plan & Steps</span>
            {plan && (
              <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono flex items-center justify-center">
                {plan.steps.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActivePanelTab('logs')}
            className={`px-3.5 py-2 rounded-t-xl font-medium transition-all flex items-center gap-1.5 ${
              activePanelTab === 'logs'
                ? 'bg-[#091122] text-sky-400 border-t border-x border-sky-500/30 border-b-transparent font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Log</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePanelTab('artifacts')}
            className={`px-3.5 py-2 rounded-t-xl font-medium transition-all flex items-center gap-1.5 ${
              activePanelTab === 'artifacts'
                ? 'bg-[#091122] text-sky-400 border-t border-x border-sky-500/30 border-b-transparent font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderCheck className="w-3.5 h-3.5" />
            <span>Artifacts</span>
            {plan?.artifacts && plan.artifacts.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono flex items-center justify-center">
                {plan.artifacts.length}
              </span>
            )}
          </button>
        </div>

        {/* 3. Tab Body Viewport */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#091122]/60">
          {activePanelTab === 'plan' && <PlanTimelineView />}
          {activePanelTab === 'logs' && <LiveLogsView />}
          {activePanelTab === 'artifacts' && <ArtifactsView />}
        </div>

        {/* 4. Bottom Natural Language Goal Composer */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-b from-[#091122] to-[#060B14] space-y-2.5 shrink-0">
          {/* Flagship Preset Action Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => handlePresetSelect('WORKFLOW_A')}
              className="px-3 py-1.5 rounded-xl bg-sky-950/70 hover:bg-sky-900/90 border border-sky-500/30 text-sky-300 text-[11px] font-medium shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span>📊 10 AI Startups Spreadsheet (Workflow A)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('WORKFLOW_B')}
              className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/90 border border-purple-500/30 text-purple-300 text-[11px] font-medium shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span>🚀 GTM Campaign & Assets (Workflow B)</span>
            </button>
          </div>

          {/* Goal Input Form */}
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Give AdaL a multi-step goal (e.g. Compare 5 privacy tools)..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[#0B152A] border border-sky-500/25 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 shadow-inner"
            />
            <button
              type="submit"
              disabled={!goalInput.trim() || isSubmitting}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-sky-950/60 flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Plan Goal</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
};
