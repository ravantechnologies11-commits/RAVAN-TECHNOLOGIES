import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Save } from 'lucide-react';

export const AdminAIML: React.FC = () => {
  const { showToast } = useToast();
  const [models, setModels] = useState([
    { name: 'Ravan-LLM-70B-Sovereign', type: 'Private Fine-Tuned Transformer', status: 'Deployed', latency: '12ms / token' },
    { name: 'Neural-Graph-Logistics-v3', type: 'Reinforcement Learning Graph', status: 'Active', latency: '450us route recalculation' }
  ]);

  const handleSave = () => {
    showToast('AI/ML model specifications saved.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Configure on-premise AI models, inference clusters, and neural benchmarks.</p>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>SAVE MODELS</span>
          </button>
        </div>

        <div className="space-y-4">
          {models.map((m, i) => (
            <div key={i} className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  {m.name}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded">
                  {m.status}
                </span>
              </div>
              <div className="text-xs text-slate-400">Architecture: {m.type}</div>
              <div className="text-xs text-slate-400">Latency: {m.latency}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
