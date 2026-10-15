import React, { useState } from 'react';
import { Sliders, ShieldAlert, Plus, X, RotateCcw, Check, Database, Trash2 } from 'lucide-react';

export default function SettingsTab({ settings, onUpdateSettings, onClearAllData }) {
  const [newKeyword, setNewKeyword] = useState('');
  const [savedBadge, setSavedBadge] = useState(false);

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    onUpdateSettings(updated);
    showSaved();
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    const clean = newKeyword.trim().toLowerCase();
    if (!clean) return;
    const currentList = settings.blacklistWords || [];
    if (!currentList.includes(clean)) {
      const updated = { ...settings, blacklistWords: [...currentList, clean] };
      onUpdateSettings(updated);
      setNewKeyword('');
      showSaved();
    }
  };

  const handleRemoveKeyword = (word) => {
    const currentList = settings.blacklistWords || [];
    const updated = { ...settings, blacklistWords: currentList.filter(w => w !== word) };
    onUpdateSettings(updated);
    showSaved();
  };

  const handleResetKeywords = () => {
    const defaults = ['password', 'passwd', 'pin', 'cvv', 'cvc', 'creditcard', 'kartukredit', 'token', 'secret', 'otp', 'nik', 'ktp', 'auth'];
    const updated = { ...settings, blacklistWords: defaults };
    onUpdateSettings(updated);
    showSaved();
  };

  const showSaved = () => {
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Preferensi Ekstensi</h3>
        </div>
        {savedBadge && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium animate-fadeIn">
            <Check className="w-3.5 h-3.5" /> Tersimpan
          </span>
        )}
      </div>

      {/* Toggles */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/80">
        {/* Toggle 1: Auto-Restore */}
        <div className="p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-200">Silent Auto-Fill (Otomatis)</p>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
              Langsung mengisi kembali form saat browser dibuka tanpa perlu konfirmasi manual.
            </p>
          </div>
          <button
            onClick={() => handleToggle('autoRestore')}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out flex-shrink-0 ${
              settings.autoRestore ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                settings.autoRestore ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Show Toast */}
        <div className="p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-200">Notifikasi Toast Pemulihan</p>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
              Tampilkan notifikasi mengambang kecil di pojok layar saat data berhasil dipulihkan.
            </p>
          </div>
          <button
            onClick={() => handleToggle('showToast')}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out flex-shrink-0 ${
              settings.showToast ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                settings.showToast ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sensitive Keywords Blacklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Kata Kunci Sensitif (Anti-Rekam)</span>
          </div>
          <button
            onClick={handleResetKeywords}
            title="Reset ke bawaan standar"
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          Kolom dengan nama, ID, atau placeholder yang mengandung kata-kata ini otomatis diabaikan demi privasi.
        </p>

        {/* Add keyword form */}
        <form onSubmit={handleAddKeyword} className="flex gap-1.5">
          <input
            type="text"
            placeholder="Tambah kata kunci (misal: cvv)..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
        </form>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
          {(settings.blacklistWords || []).map((word) => (
            <span
              key={word}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono"
            >
              <span>{word}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(word)}
                className="text-slate-500 hover:text-rose-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Storage Reset Action */}
      <div className="pt-1">
        <button
          onClick={onClearAllData}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/40 text-xs font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset Semua Data Penyimpanan Lokal</span>
        </button>
      </div>
    </div>
  );
}
