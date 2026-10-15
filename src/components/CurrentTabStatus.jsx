import React, { useState } from 'react';
import { Globe, Clock, RotateCcw, Trash2, CheckCircle2, AlertCircle, FileText, ExternalLink } from 'lucide-react';

export default function CurrentTabStatus({ currentTabInfo, currentDraft, onRestore, onDeleteCurrent, onOpenDemo }) {
  const [restoring, setRestoring] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState(null);

  const handleRestoreClick = async () => {
    setRestoring(true);
    setRestoreFeedback(null);
    try {
      const res = await onRestore();
      if (res && res.success) {
        setRestoreFeedback({ type: 'success', message: `${res.count || 'Semua'} kolom berhasil dipulihkan!` });
      } else {
        setRestoreFeedback({ type: 'error', message: res?.message || 'Gagal memulihkan data.' });
      }
    } catch (e) {
      setRestoreFeedback({ type: 'error', message: 'Tidak dapat berkomunikasi dengan halaman.' });
    } finally {
      setRestoring(false);
      setTimeout(() => setRestoreFeedback(null), 3500);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Tidak diketahui';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 5) return 'Baru saja';
    if (diff < 60) return `${diff} detik yang lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const fieldsList = currentDraft?.fields ? Object.values(currentDraft.fields) : [];

  return (
    <div className="p-4 space-y-4">
      {/* Current URL Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {currentTabInfo?.title || 'Memuat halaman...'}
            </p>
            <p className="text-[11px] text-slate-400 truncate font-mono">
              {currentTabInfo?.domain || 'Lokal / Browser Tab'}
            </p>
          </div>
        </div>

        {currentDraft ? (
          <span className="flex-shrink-0 ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold rounded-full">
            {fieldsList.length} Tersimpan
          </span>
        ) : (
          <span className="flex-shrink-0 ml-2 px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 text-[11px] rounded-full">
            Kosong
          </span>
        )}
      </div>

      {/* Restore Feedback Alert */}
      {restoreFeedback && (
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
            restoreFeedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
          }`}
        >
          {restoreFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{restoreFeedback.message}</span>
        </div>
      )}

      {/* Draft Exists View */}
      {currentDraft ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Disimpan: {formatTime(currentDraft.updatedAt)}</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">Otomatis Terlindungi</span>
          </div>

          {/* List of Fields Preview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80">
            <div className="px-3.5 py-2 bg-slate-800/40 text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex justify-between">
              <span>Kolom Isian</span>
              <span>Nilai Draf</span>
            </div>
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/60">
              {fieldsList.map((field, idx) => (
                <div key={idx} className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-200 font-medium truncate">
                      {field.label || field.name || `Kolom #${idx + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                      {field.type}
                    </span>
                    <span className="text-slate-300 font-mono text-[11px] max-w-[120px] truncate bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {String(field.value || field.checked || '(terisi)')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleRestoreClick}
              disabled={restoring}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${restoring ? 'animate-spin' : ''}`} />
              <span>{restoring ? 'Memulihkan...' : 'Pulihkan Data'}</span>
            </button>

            <button
              onClick={onDeleteCurrent}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 text-xs font-semibold transition-all active:scale-[0.98]"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Hapus Draf</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-400/80" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Belum Ada Draf di Halaman Ini</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Mulai ketikkan formulir web atau Google Form apa pun. FormRescuer akan merekam secara real-time di perangkat Anda tanpa risiko hilang!
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Demo Formulir Pengujian</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
