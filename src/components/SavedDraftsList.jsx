import React, { useState } from 'react';
import { Search, HardDrive, Trash2, Eye, Calendar, Globe, AlertTriangle } from 'lucide-react';
import DraftDetailModal from './DraftDetailModal';

export default function SavedDraftsList({ drafts, onDeleteDraft, onClearAllDrafts }) {
  const [search, setSearch] = useState('');
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const filteredDrafts = drafts.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.title || '').toLowerCase().includes(q) ||
      (d.domain || '').toLowerCase().includes(q) ||
      (d.url || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 space-y-3.5">
      {/* Search & Actions Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari draf (nama web, form, domain)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all"
          />
        </div>

        {drafts.length > 0 && (
          <button
            onClick={() => setConfirmClearAll(true)}
            title="Kosongkan Semua Draf"
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/40 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Confirm Clear All Dialog */}
      {confirmClearAll && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-rose-300 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Hapus Semua Draf Formulir?</span>
          </div>
          <p className="text-[11px] text-rose-200/80">
            Tindakan ini akan menghapus permanen seluruh {drafts.length} draf formulir yang tersimpan di perangkat ini.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setConfirmClearAll(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
            >
              Batal
            </button>
            <button
              onClick={() => {
                onClearAllDrafts();
                setConfirmClearAll(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              Ya, Hapus Semua
            </button>
          </div>
        </div>
      )}

      {/* Drafts List */}
      {filteredDrafts.length > 0 ? (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-0.5">
          {filteredDrafts.map((draft) => (
            <div
              key={draft.key}
              className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-3 transition-all space-y-2 group shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                    {draft.title || 'Formulir Web'}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span className="truncate max-w-[190px]">{draft.domain || draft.url}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 text-[10px] font-bold flex-shrink-0">
                  {draft.fieldsCount || Object.keys(draft.fields || {}).length} Kolom
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(draft.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedDraft(draft)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-medium px-2"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Lihat</span>
                  </button>

                  <button
                    onClick={() => onDeleteDraft(draft.key)}
                    title="Hapus draf ini"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 hover:border-rose-800/40 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-8 text-center space-y-2">
          <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-medium text-slate-300">
            {search ? 'Tidak ada draf yang cocok dengan pencarian' : 'Belum ada draf formulir yang tersimpan'}
          </p>
          <p className="text-[11px] text-slate-500">
            {search ? 'Coba gunakan kata kunci pencarian yang lain.' : 'Setiap kali Anda mengisi form web, draf akan otomatis muncul di sini.'}
          </p>
        </div>
      )}

      {/* Modal View */}
      {selectedDraft && (
        <DraftDetailModal draft={selectedDraft} onClose={() => setSelectedDraft(null)} />
      )}
    </div>
  );
}
