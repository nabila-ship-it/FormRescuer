import React from 'react';
import { ShieldCheck, Lock, Trash2, EyeOff, CheckCircle2, GraduationCap } from 'lucide-react';

export default function PrivacyNotice() {
  const principles = [
    {
      icon: Lock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      title: 'Penyimpanan 100% Offline & Lokal',
      desc: 'Seluruh data disimpan murni di chrome.storage.local pada perangkat pengguna. Tidak ada data yang dikirim ke server eksternal, analitik pihak ketiga, ataupun cloud.'
    },
    {
      icon: EyeOff,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      title: 'Filter Privasi Berlapis (UU PDP & GDPR)',
      desc: 'Ekstensi secara otomatis mengabaikan kolom berjenis password (type="password"), kode OTP, nomor kartu kredit, CVV, dan field sensitif lainnya secara preventif.'
    },
    {
      icon: Trash2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      title: 'Pembersihan Otomatis (Auto-Cleanup)',
      desc: 'Saat pengguna mengklik tombol Submit/Kirim, draf form seketika dihapus dari penyimpanan lokal untuk mencegah penumpukan data dan kebocoran draf usang.'
    },
    {
      icon: ShieldCheck,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      title: 'Dukungan Form Dinamis & Google Forms',
      desc: 'Mampu mendeteksi form HTML5 standar maupun elemen dinamis berbasis JavaScript seperti input dan checkbox pada Google Forms modern.'
    }
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Privacy Header Banner */}
      <div className="bg-gradient-to-br from-blue-950/60 to-indigo-950/60 border border-blue-500/30 rounded-2xl p-4 text-center space-y-2">
        <div className="w-10 h-10 mx-auto rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-white tracking-wide">
            Prinsip Keamanan & Rekayasa Privasi
          </h3>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            FormRescuer dirancang mematuhi prinsip <i>Privacy by Design</i> untuk menjamin kenyamanan pengguna tanpa mengorbankan keamanan data pribadi.
          </p>
        </div>
      </div>

      {/* Principles List */}
      <div className="space-y-2.5">
        {principles.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-start gap-3 shadow-sm"
            >
              <div className={`w-7 h-7 rounded-lg ${item.bg} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Academic Project Badge */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="min-w-0 text-[11px]">
          <p className="font-semibold text-slate-200">Proyek Pemrograman Web - Semester 5</p>
          <p className="text-slate-400 truncate">FormRescuer • Chrome Extension Manifest V3</p>
        </div>
      </div>
    </div>
  );
}
