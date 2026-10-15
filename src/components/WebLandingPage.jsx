import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Download, ExternalLink, RefreshCw, CheckCircle2,
  Lock, EyeOff, Trash2, Globe, Sparkles, Terminal, ChevronRight, Github, Laptop
} from 'lucide-react';
import Header from './Header';
import CurrentTabStatus from './CurrentTabStatus';
import SavedDraftsList from './SavedDraftsList';
import SettingsTab from './SettingsTab';
import PrivacyNotice from './PrivacyNotice';

export default function WebLandingPage({
  mockData: { currentTabInfo, currentDraft, allDrafts, settings, activeTab, setActiveTab, onRestore, onDeleteCurrent, onOpenDemo, onUpdateSettings, onClearAllDrafts }
}) {
  // Web Simulator Form State
  const [simName, setSimName] = useState('');
  const [simEmail, setSimEmail] = useState('');
  const [simAddress, setSimAddress] = useState('');
  const [simMajor, setSimMajor] = useState('Sistem Informasi');
  const [simPassword, setSimPassword] = useState('');
  const [savedStatus, setSavedStatus] = useState('Menunggu isian...');
  const [restoredToast, setRestoredToast] = useState(false);

  // Restore simulated data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fr_web_demo_draft');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.name) setSimName(data.name);
        if (data.email) setSimEmail(data.email);
        if (data.address) setSimAddress(data.address);
        if (data.major) setSimMajor(data.major);
        // Notice: Password is NEVER restored (GDPR/UU PDP compliance)

        setRestoredToast(true);
        setTimeout(() => setRestoredToast(false), 4500);
      }
    } catch (e) {}
  }, []);

  // Real-time autosave simulator
  useEffect(() => {
    if (!simName && !simEmail && !simAddress) return;

    const timer = setTimeout(() => {
      try {
        const payload = {
          name: simName,
          email: simEmail,
          address: simAddress,
          major: simMajor,
          time: new Date().toLocaleTimeString('id-ID')
        };
        localStorage.setItem('fr_web_demo_draft', JSON.stringify(payload));
        setSavedStatus(`Tersimpan otomatis pukul ${payload.time}`);
      } catch (e) {}
    }, 250);

    return () => clearTimeout(timer);
  }, [simName, simEmail, simAddress, simMajor]);

  const handleSimulateRefresh = () => {
    window.location.reload();
  };

  const handleClearDemo = () => {
    localStorage.removeItem('fr_web_demo_draft');
    setSimName('');
    setSimEmail('');
    setSimAddress('');
    setSimPassword('');
    setSavedStatus('Draf telah dibersihkan');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[1.5px] shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wide text-white">FormRescuer</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  Manifest V3
                </span>
              </div>
              <p className="text-xs text-slate-400">Penyelamat Form Web & Google Forms</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/nabila-ship-it/FormRescuer"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/80 transition-all"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>

            <a
              href="/FormRescuer-Extension.zip"
              download="FormRescuer-Extension.zip"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Download Ekstensi (.zip)</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Tugas Proyek Pemrograman Web • Semester 5</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Jangan Pernah Mengulang Mengisi Form Saat <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Browser Tertutup</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            FormRescuer adalah ekstensi Google Chrome yang secara <i>real-time</i> menyimpan setiap ketikan pada formulir web & Google Forms. Ketika browser tidak sengaja tertutup atau laptop mati, seluruh isian Anda langsung dipulihkan seketika tanpa perlu mengulang dari awal.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="/FormRescuer-Extension.zip"
              download="FormRescuer-Extension.zip"
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:opacity-95 text-sm font-bold text-white shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              <span>Download FormRescuer-Extension.zip (80 KB)</span>
            </a>

            <a
              href="#simulator"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-slate-200 border border-slate-800 transition-all"
            >
              <span>Uji Coba Langsung di Bawah</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Live Interactive Simulator */}
        <section id="simulator" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span>Simulasi Interaktif FormRescuer</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Coba ketikkan form ini secara langsung di web Vercel. Lalu klik "Simulasi Refresh Halaman" untuk melihat keajaibannya!
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{savedStatus}</span>
            </div>
          </div>

          {/* Restored Toast Banner */}
          {restoredToast && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/40 text-emerald-300 flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-bounce">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">✨ Data Berhasil Dipulihkan Otomatis!</p>
                  <p className="text-[11px] text-emerald-300/80">
                    FormRescuer mendeteksi sesi sebelum halaman dimuat ulang dan mengisikan kembali data Anda. Kolom password tetap aman (tidak direkam).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRestoredToast(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* The Form Card */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Formulir Pendaftaran Mahasiswa</span>
                <span className="text-[11px] text-slate-500 font-mono">Real-time Local Sandbox</span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    placeholder="Contoh: Nabila Nur Azizah"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alamat Email Mahasiswa</label>
                  <input
                    type="email"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    placeholder="contoh: nabila@student.ac.id"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Program Studi / Jurusan</label>
                  <select
                    value={simMajor}
                    onChange={(e) => setSimMajor(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="Sistem Informasi">Sistem Informasi</option>
                    <option value="Teknik Informatika">Teknik Informatika</option>
                    <option value="Teknologi Informasi">Teknologi Informasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alamat Lengkap Domisili</label>
                  <textarea
                    rows={3}
                    value={simAddress}
                    onChange={(e) => setSimAddress(e.target.value)}
                    placeholder="Tuliskan nama jalan, kelurahan, dan kota Anda..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* SENSITIVE FIELD DEMO */}
                <div className="p-3.5 rounded-xl border border-rose-900/50 bg-rose-950/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded">
                      Fitur Privasi (Anti-Rekam)
                    </span>
                    <span className="text-[11px] text-rose-300">UU PDP No. 27/2022</span>
                  </div>
                  <label className="block text-xs font-semibold text-rose-200">
                    Kata Sandi / PIN Akun
                  </label>
                  <input
                    type="password"
                    value={simPassword}
                    onChange={(e) => setSimPassword(e.target.value)}
                    placeholder="Ketik apa pun di sini, ekstensi tidak akan pernah menyimpannya!"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-rose-900/60 focus:border-rose-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleSimulateRefresh}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Simulasi Refresh Halaman (F5)</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearDemo}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-semibold transition-all"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  <span>Bersihkan</span>
                </button>
              </div>
            </div>

            {/* Interactive Extension Popup Mockup Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Laptop className="w-4 h-4 text-blue-400" />
                <span>Pratinjau Antarmuka Ekstensi di Chrome</span>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 w-full max-w-[400px] mx-auto">
                <Header
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  activeFieldsCount={currentDraft ? 4 : 0}
                />
                <div className="min-h-[460px]">
                  {activeTab === 'current' && (
                    <CurrentTabStatus
                      currentTabInfo={currentTabInfo}
                      currentDraft={currentDraft}
                      onRestore={onRestore}
                      onDeleteCurrent={onDeleteCurrent}
                      onOpenDemo={onOpenDemo}
                    />
                  )}
                  {activeTab === 'vault' && (
                    <SavedDraftsList
                      drafts={allDrafts}
                      onDeleteDraft={() => {}}
                      onClearAllDrafts={onClearAllDrafts}
                    />
                  )}
                  {activeTab === 'settings' && (
                    <SettingsTab
                      settings={settings}
                      onUpdateSettings={onUpdateSettings}
                      onClearAllData={onClearAllDrafts}
                    />
                  )}
                  {activeTab === 'privacy' && <PrivacyNotice />}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Installation Guide */}
        <section className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Cara Pasang Ekstensi di Google Chrome</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Hanya butuh 3 langkah mudah kurang dari 1 menit agar siap digunakan di Google Chrome Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="text-sm font-bold text-white">Download & Ekstrak</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unduh berkas <code className="text-blue-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded">FormRescuer-Extension.zip</code> lalu ekstrak ke salah satu folder di laptop Anda.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="text-sm font-bold text-white">Buka chrome://extensions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Di Google Chrome, buka alamat <code className="text-indigo-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded">chrome://extensions</code> dan aktifkan sakelar <b>Developer mode</b> di pojok kanan atas.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="text-sm font-bold text-white">Load Unpacked & Selesai!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Klik tombol <b>"Load unpacked"</b> (Muat yang belum dibongkar) lalu pilih folder hasil ekstrak tadi. FormRescuer langsung aktif melindungi!
              </p>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <Lock className="w-6 h-6 text-blue-400" />
            <h4 className="text-xs font-bold text-white">100% Offline & Lokal</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Seluruh data tersimpan murni di memori lokal Chrome pengguna. Nol data dikirim ke cloud/server luar.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <EyeOff className="w-6 h-6 text-amber-400" />
            <h4 className="text-xs font-bold text-white">Anti-Rekam Sandi & OTP</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Secara preventif memfilter kata sandi, OTP, CVV, dan nomor kartu kredit demi kepatuhan UU PDP & GDPR.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <Trash2 className="w-6 h-6 text-emerald-400" />
            <h4 className="text-xs font-bold text-white">Auto-Cleanup on Submit</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Draf langsung dibersihkan otomatis setelah formulir berhasil dikirim agar memori tetap bersih.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <Globe className="w-6 h-6 text-indigo-400" />
            <h4 className="text-xs font-bold text-white">Support Google Forms</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Mampu mendeteksi struktur formulir HTML5 standar maupun elemen dinamis berbasis Google Forms modern.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-6 text-center text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300">
          FormRescuer • Real-Time Form Auto-Save & Recovery Chrome Extension
        </p>
        <p className="text-[11px]">
          Dibuat oleh Nabila untuk Proyek Mata Kuliah Pemrograman Web - Semester 5
        </p>
      </footer>
    </div>
  );
}
