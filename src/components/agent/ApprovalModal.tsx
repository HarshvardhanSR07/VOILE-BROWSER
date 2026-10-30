// src/components/agent/ApprovalModal.tsx
// Human-in-the-Loop Consequential Action Approval Gate (RFC/Policy Engine)

import React from 'react';
import { useAgent } from '../../context/AgentContext';
import { AlertTriangle, ShieldAlert, Check, X, Lock } from 'lucide-react';

export const ApprovalModal: React.FC = () => {
  const { approvalRequest, resolveApproval } = useAgent();

  if (!approvalRequest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-xl w-full bg-[#0C152B] border-2 border-amber-500/50 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 space-y-5 text-slate-200">
        {/* Header with Risk Warning */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase font-bold tracking-wider border border-amber-500/30">
                Action Approval Gate (HIGH RISK)
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {approvalRequest.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {approvalRequest.description}
            </p>
          </div>
        </div>

        {/* Payload / Action Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Action Type: <strong className="text-amber-400 uppercase">{approvalRequest.actionType}</strong></span>
            <span>Policy: Zero Automatic Execution</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 font-mono text-xs text-slate-300 overflow-x-auto max-h-48 no-scrollbar">
            <pre className="text-[11px] leading-relaxed">
              {typeof approvalRequest.previewData === 'string'
                ? approvalRequest.previewData
                : JSON.stringify(approvalRequest.previewData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 flex items-center gap-2.5 text-[11px] text-amber-200/90">
          <Lock className="w-4 h-4 shrink-0 text-amber-400" />
          <span>This action can modify external systems or state. Execution is suspended until you explicitly authorize it.</span>
        </div>

        {/* Decision Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => resolveApproval(false)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-all flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Deny & Cancel Step</span>
          </button>
          <button
            type="button"
            onClick={() => resolveApproval(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Approve & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};
