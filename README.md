# FormRescuer 🛡️
### *Real-Time Form Auto-Save & Instant Recovery Chrome Extension*
**Tugas Proyek Mata Kuliah: Pemrograman Web (Semester 5)**

FormRescuer adalah ekstensi Google Chrome berbasis **Manifest V3** yang bertindak sebagai "penyelamat" data ketikan Anda pada formulir web dan Google Forms. Ketika browser tidak sengaja tertutup (force close, crash, laptop mati, atau ketekan shortcut keluar), Anda tidak perlu lagi mengulang pengisian dari awal. Seluruh data terakhir akan langsung dipulihkan secara instan dan otomatis saat halaman dibuka kembali.

---

## 🌟 Fitur Utama & Keunggulan

1. **⚡ Real-Time Auto-Save (Debounced)**
   - Merekam setiap ketikan pada elemen `<input>`, `<textarea>`, `<select>`, radio button, checkbox, hingga elemen dinamis Google Forms.
   - Menggunakan mekanisme *debouncing* (350ms) agar performa browser tetap ringan dan hemat I/O.

2. **🔄 Instant Silent Auto-Fill (Pemulihan Instan)**
   - Saat tab/halaman dibuka kembali setelah tertutup, ekstensi langsung mengisikan kembali data ke kolom-kolom yang bersangkutan secara otomatis tanpa mewajibkan klik manual.
   - Dilengkapi notifikasi mengambang (*floating toast*) elegan yang memberi tahu pengguna berapa kolom yang berhasil diselamatkan.

3. **🔒 Keamanan & Perlindungan Privasi (Nilai Jual Dosen - UU PDP & GDPR Compliant)**
   - **Filter Anti-Rekam Sensitif**: Kolom `type="password"`, `type="hidden"`, kode OTP, nomor kartu kredit, CVV, dan PIN secara otomatis diabaikan dan TIDAK PERNAH disimpan.
   - **100% Offline & Lokal**: Seluruh data disimpan murni di `chrome.storage.local` pada perangkat laptop pengguna. Nol data dikirim ke internet, server luar, atau pihak ketiga.
   - **Blacklist Fleksibel**: Pengguna dapat menambahkan kata kunci sensitif tambahan di menu Pengaturan.

4. **🧹 Pembersihan Otomatis (Auto-Cleanup Lifecycle)**
   - Begitu pengguna menekan tombol **"Submit" / "Kirim"** atau form berhasil dikirim, draf untuk halaman tersebut langsung dihapus otomatis dari penyimpanan agar memori bersih dan draf tidak bocor ke sesi berikutnya.

5. **🎨 Antarmuka Dashboard Modern (React + Tailwind CSS)**
   - **Tab Aktif**: Menampilkan status form di website yang sedang dibuka, jumlah kolom tersimpan, preview data, tombol pulihkan manual, dan hapus draf.
   - **Semua Draf**: Vault arsip seluruh form dari berbagai website dengan fitur pencarian dan modal detail untuk menyalin teks.
   - **Pengaturan**: Kontrol penuh atas fitur auto-restore, toast, kata kunci sensitif, dan reset penyimpanan.
   - **Halaman Demo Terintegrasi**: Halaman formulir simulasi siap pakai untuk demonstrasi langsung di depan dosen atau teman kelas.

---

## 🛠️ Arsitektur Teknologi

| Komponen | Teknologi | Peran & Fungsi |
|---|---|---|
| **Ekstensi Core** | Manifest V3 | Standar arsitektur ekstensi Chrome modern & aman |
| **Content Script** | Vanilla JS (DOM & Events) | Menangkap event `input`/`change`, deteksi selektor form, dan auto-fill |
| **Background Worker** | Service Worker V3 | Sinkronisasi badge icon ekstensi dan listener status tab |
| **Penyimpanan** | `chrome.storage.local` | Penyimpanan data lokal di perangkat pengguna |
| **Antarmuka Popup** | React 18 + Vite | Single Page Application (SPA) popup yang cepat dan reaktif |
| **Styling** | Tailwind CSS v3 | Desain modern berstandar estetika tinggi (Dark Theme & Glassmorphism) |
| **Ikonografi** | Lucide React | Ikon modern dan konsisten |

---

## 🚀 Panduan Pemasangan di Google Chrome

File siap pasang sudah otomatis dibuat di dalam folder **`dist/`**.

1. Buka browser **Google Chrome** (atau Microsoft Edge / Brave).
2. Di address bar, ketik:
   ```text
   chrome://extensions
   ```
3. Aktifkan tombol **"Developer mode"** (Mode Pengembang) di pojok kanan atas.
4. Klik tombol **"Load unpacked"** (Muat yang belum dibongkar) di pojok kiri atas.
5. Pilih folder:
   ```text
   FormRescuer/dist
   ```
   *(Atau path lengkap: `D:\jokian\24311149-Nabila_logoHonda\Semester 5\Pemrograman Web\Extension-Nabila-Web\FormRescuer\dist`)*
6. Selesai! Ekstensi **FormRescuer** akan langsung muncul di daftar ekstensi dan toolbar Chrome Anda.
7. *Tip:* Sematkan (*Pin*) ikon FormRescuer di toolbar Chrome agar mudah diakses.

---

## 🧪 Cara Pengujian & Demonstrasi (Demo untuk Dosen)

### Skenario 1: Menguji Demo Form Bawaan
1. Klik ikon ekstensi FormRescuer di toolbar Chrome.
2. Di bagian bawah popup, klik link **"Buka Demo Form"** (atau buka file `demo/demo-form.html` langsung di browser Chrome).
3. Isi kolom Nama Lengkap, Email, Jurusan, dan Alamat Domisili.
4. Coba ketikkan kata sandi pada kolom **Password** (perhatikan kolom ini bertanda anti-rekam).
5. Sekarang lakukan simulasi crash/tutup browser:
   - Tekan **F5 (Refresh)** atau tutup tab tersebut, lalu buka kembali.
6. **Hasil:** Seluruh isian Nama, Email, Jurusan, dan Alamat seketika **terisi kembali otomatis**, muncul toast konfirmasi di pojok kanan bawah, dan kolom Password tetap **kosong (aman)**!
7. Klik tombol **"Kirim Formulir"**: FormRescuer akan mendeteksi pengiriman form dan seketika membersihkan draf dari penyimpanan lokal.

### Skenario 2: Menguji di Google Forms Asli
1. Buka tautan Google Form apa pun di Google Chrome (misal formulir pendaftaran, kuesioner tugas akhir, dll).
2. Isi beberapa pertanyaan.
3. Tutup tab tersebut tanpa mengirim.
4. Buka kembali tautan Google Form tadi.
5. Isian Anda akan langsung kembali ke kolom pertanyaan yang bersangkutan!

---

## 💻 Panduan Pengembangan (Development)

Jika ingin melakukan modifikasi kode sumber:

```bash
# 1. Masuk ke folder proyek
cd FormRescuer

# 2. Jalankan server pengembangan Vite untuk popup
npm run dev

# 3. Lakukan build ulang ke folder dist/ setelah mengedit kode
npm run build
```

---

## 📁 Struktur Berkas Proyek

```text
FormRescuer/
├── demo/
│   └── demo-form.html        # Halaman form pengujian interaktif untuk presentasi dosen
├── public/
│   ├── icons/                # Ikon ekstensi resolusi 16x16, 48x48, 128x128
│   └── manifest.json         # Konfigurasi Manifest V3 Chrome Extension
├── src/
│   ├── background/
│   │   └── background.js     # Service worker untuk tab listener & icon badge count
│   ├── components/
│   │   ├── CurrentTabStatus.jsx # Status form di tab aktif & kontrol pulihkan
│   │   ├── DraftDetailModal.jsx # Modal penampil rincian kolom & salin data
│   │   ├── Header.jsx           # Navigasi & indikator status perlindungan
│   │   ├── PrivacyNotice.jsx    # Halaman landasan akademik keamanan data & UU PDP
│   │   ├── SavedDraftsList.jsx  # Arsip seluruh form tersimpan antar-website
│   │   └── SettingsTab.jsx      # Pengaturan auto-restore & blacklist kata sensitif
│   ├── content/
│   │   └── content.js        # Engine pendeteksi DOM form, debounce saver, & auto-fill
│   ├── styles/
│   │   └── index.css         # Styling kustom Tailwind CSS v3 & Dark Theme
│   ├── App.jsx               # Komponen utama antarmuka popup
│   └── main.jsx              # Entry point React
├── dist/                     # Hasil kompilasi final siap pasang di Chrome
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---
*Dibuat untuk Tugas Proyek Pemrograman Web - Semester 5*
