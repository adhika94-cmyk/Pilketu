# eOSIS - Aplikasi Pemilihan Ketua & Wakil Ketua OSIS Online

Sistem informasi berbasis web modern untuk pelaksanaan Pemilihan OSIS (e-Voting) yang transparan, aman, dan dapat diakses dengan mudah oleh siswa, guru, staff, serta administrator sekolah.

---

## 🚀 Panduan Menjalankan Aplikasi di Localhost Server

### 1. Prasyarat Sistem (Prerequisites)
Pastikan komputer atau server Anda sudah terinstal:
- **Node.js** (Versi 18.0.0 atau lebih baru) - [Download Node.js](https://nodejs.org/)
- **npm** (Bawaan Node.js) atau **yarn** / **pnpm**

---

### 2. Langkah-Langkah Instalasi & Jalankan Server

#### **Langkah A: Clone / Unzip Proyek**
Buka terminal (Command Prompt / PowerShell / Terminal macOS/Linux) lalu masuk ke direktori proyek:
```bash
cd eosis-app
```

#### **Langkah B: Install Dependensi**
Jalankan perintah berikut untuk menginstal seluruh package pendukung:
```bash
npm install
```

#### **Langkah C: Konfigurasi File `.env` (Opsional)**
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
*Catatan:*
- Jika Anda memiliki proyek **Supabase**, masukkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` Anda di file `.env`.
- Jika dikosongkan, aplikasi **eOSIS tetap dapat berjalan 100%** di localhost menggunakan mode *Penyimpanan Lokal Interaktif* bawaan.

---

### 3. Menjalankan Server Localhost

#### 🔹 **Mode Pengembang (Development Server)**
Untuk menjalankan server lokal dengan fitur auto-reload (Hot Module Replacement):
```bash
npm run dev
```
Akses aplikasi melalui browser di:
👉 **`http://localhost:3000`** atau **`http://127.0.0.1:3000`**

---

#### 🔹 **Mode Produksi (Production Build & Local Server)**
Untuk menguji performa siap rilis (Production Server):
1. **Build aplikasi:**
   ```bash
   npm run build
   ```
2. **Jalankan preview server lokal:**
   ```bash
   npm run preview
   # atau
   npm run serve
   ```
Akses hasil build produksi di browser di:
👉 **`http://localhost:3000`**

---

## 🔐 Akses Default Login (Local Mode)

| Role | Username / ID Login | Password / Tanggal Lahir | Keterangan |
|---|---|---|---|
| **Admin OSIS** | `admin` | `admin123` | Portal Manajemen Administrator |
| **Pemilih Siswa** | NISN (Contoh: `0051234567`) | `2008-05-15` | Bilik Suara Siswa |
| **Pemilih Guru** | NIP (Contoh: `198501152010011002`) | `1985-01-15` | Bilik Suara Guru |
| **Pemilih Staff** | ID (Contoh: `STF-2024-001`) | `1990-08-20` | Bilik Suara Staff |

---

## 🗄️ Inisialisasi Database Supabase (Opsional)
Jika Anda menggunakan Supabase sebagai database server:
1. Buka [Supabase Dashboard](https://supabase.com/).
2. Masuk ke menu **SQL Editor**.
3. Buka file skrip SQL yang tersedia di proyek ini:
   `src/assets/sql/supabase_schema.sql`
4. Copy seluruh isi skrip lalu klik **Run** untuk membuat tabel, fungsi RLS, dan RPC voting otomatis.

---

## 🛠️ Perintah Utama (Scripts Summary)

- `npm run dev` : Menjalankan server pengembang lokal di `http://localhost:3000`
- `npm run build` : Melakukan kompilasi bundle produksi ke folder `dist/`
- `npm run preview` : Menjalankan server preview produksi di `http://localhost:3000`
- `npm run lint` : Memeriksa sintaks dan tipe TypeScript
