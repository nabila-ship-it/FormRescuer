import React from 'react';
import { X, Copy, Check, FileText, Globe, Calendar } from 'lucide-react';

export default function DraftDetailModal({ draft, onClose }) {
  const [copiedKey, setCopiedKey] = React.useState(null);

  if (!draft) return null;

  const fields = draft.fields ? Object.values(draft.fields) : [];

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(String(text));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white truncate">{draft.title || 'Draf Formulir'}</h3>
              <p className="text-[11px] text-slate-400 truncate">{draft.domain}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Meta */}
        <div className="px-3.5 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{new Date(draft.updatedAt).toLocaleString('id-ID')}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 font-semibold text-[10px]">
            {fields.length} Kolom Isian
          </span>
        </div>

        {/* Fields List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-800/40">
          {fields.map((field, idx) => {
            const val = String(field.value !== undefined ? field.value : (field.checked ? 'Ya (Centang)' : 'Tidak'));
            return (
              <div key={idx} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-300 truncate max-w-[200px]">
                    {field.label || field.name || `Kolom #${idx + 1}`}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {field.type}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800/80 text-xs">
                  <span className="font-mono text-slate-200 truncate select-all">{val}</span>
                  <button
                    onClick={() => handleCopy(idx, val)}
                    title="Salin isi data"
                    className="text-slate-400 hover:text-blue-400 p-1 rounded transition-colors flex-shrink-0"
                  >
                    {copiedKey === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
