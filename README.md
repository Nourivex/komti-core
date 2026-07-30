<div align="center">

  <img src="public/logo_harkat.png" alt="Universitas Harkat Negeri Logo" width="180" />

  # 🤖 TIKA CORE — AI Holographic Assistant

  **Sistem Kecerdasan Buatan Terpadu & Holografik Universitas Harkat Negeri**

  [![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Three.js](https://img.shields.io/badge/Three.js-r170-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
  [![JavaScript](https://img.shields.io/badge/TypeScript/JS-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

  <p align="center">
    TIKA CORE adalah agen AI generasi baru berbasis web 3D yang menggabungkan <b>Holographic Avatar</b>, <b>AI Bridge Integration (9router)</b>, serta <b>Grounding Knowledge Base</b> resmi Universitas Harkat Negeri.
  </p>

</div>

---

## 🌟 Fitur Utama

- 🎨 **Futuristic Crimson Glassmorphism UI**: Antarmuka visual kelas premium berbalut tema *Dark Crimson & Rose Gold* yang responsif dan memukau.
- 🔮 **3D Holographic Avatar Orb**: Avatar interaktif yang dibangun menggunakan **Three.js**, dilengkapi pencahayaan *real-time*, efek *glow additive*, serta reaksi animasi emosi (*Idle*, *Thinking*, *Speaking*, *Bright*).
- 🌐 **9router AI Bridge Integration**: Terhubung langsung ke *local LLM bridge* (`http://localhost:20128/v1`) yang kompatibel dengan format OpenAI API (`/chat/completions`).
- 📚 **Knowledge Grounding System**: Dilengkapi dengan basis data terstruktur resmi dari **Universitas Harkat Negeri** (Informasi Kampus Mataram, Pendidikan, Kalisoga, Portal PMB, SIAKAD, & SISKERMA).
- 🛠️ **Modul Pengaturan Interaktif (`/atur`)**: Fitur modal bawaan untuk mengubah URL bridge, nama model, *temperature*, serta *max tokens* secara dinamis tanpa perlu me-reload aplikasi.
- 🔊 **Voice & Audio Feedback Engine**: Integrasi respons suara Web Speech Synthesis dan efek audio feedback kontekstual.

---

## 🛠️ Teknologi & Stack

| Layer | Teknologi |
|---|---|
| **Frontend Framework** | Vanilla JS / ES Modules dengan Vite 5 |
| **3D Graphics Engine** | Three.js (WebGL rendering loop) |
| **Styling & Theme** | Modern Glassmorphic Vanilla CSS (CSS Container Queries & Variables) |
| **Linting & Code Quality** | ESLint v9+ dengan aturan strict static analysis |
| **AI Protocol** | OpenAI Chat Completions Specification (via 9router AI Bridge) |

---

## 🚀 Panduan Memulai

### 1. Prasyarat
Pastikan sistem Anda telah terpasang:
- **Node.js** v18+ 
- **npm** v9+

### 2. Instalasi
Cloning repositori ini dan pasang semua dependensi:
```bash
git clone https://github.com/Nourivex/komti-core.git
cd komti-core
npm install
```

### 3. Menjalankan Server Pengembang
Jalankan aplikasi di lingkungan lokal:
```bash
npm run dev
```
Buka browser Anda di `http://localhost:3000` *(atau port yang ditampilkan terminal)*.

### 4. Menjalankan 9router (AI Bridge)
Untuk menggunakan kecerdasan LLM lokal penuh, pastikan server **9router** berjalan di `http://localhost:20128/v1`. 

> 💡 *Jika 9router tidak aktif, TIKA CORE akan secara otomatis menggunakan **Smart Fallback Engine** berbasis data lokal Universitas Harkat Negeri.*

---

## ⚙️ Perintah `/atur` (Modal Pengaturan)

Di dalam aplikasi chat TIKA CORE, Anda dapat mengodekan perintah `/atur` di kolom pesan:

1. Ketik `/atur` dan tekan **Enter**.
2. Pengaturan yang tersedia:
   - **URL Server**: Endpoint bridge AI (Default: `http://localhost:20128/v1`).
   - **Nama Model**: Identifier model AI (Default: `tika-model`).
   - **Temperature**: Slider penyesuaian kreativitas respons.
   - **Max Tokens**: Batas maksimal generasi karakter/token.
3. Gunakan tombol **Tes Koneksi** untuk mengecek status keterhubungan server secara *live*.

---

## 📁 Struktur Proyek

```text
komti-core/
├── public/
│   ├── logo_harkat.png      # Logo Resmi Universitas Harkat Negeri
│   ├── favicon.svg          # Asset Favicon
│   └── icons.svg            # Icon SVG Sprites
├── src/
│   ├── config.js            # Konfigurasi terpusat & Persistence LocalStorage
│   ├── main.js              # Entry point aplikasi
│   ├── styles.css           # Design System & Styling Glassmorphism
│   ├── game/
│   │   ├── avatar.js        # Rendering 3D Three.js Hologram Orb
│   │   ├── chat.js          # Integration 9router & Grounding Knowledge Base
│   │   ├── ui.js            # Komponen UI & Modal /atur
│   │   ├── voice.js         # Text-to-Speech Engine
│   │   └── audio.js         # Sound Feedback System
│   └── lib/
│       └── scene3d.js       # Utility 3D Helper Methods
├── eslint.config.js         # Konfigurasi ESLint v9
└── package.json             # Manifes Proyek & Script Build
```

---

## 📦 Build Produksi

Untuk membuat bundle produksi yang ter-minifikasi dan tervalidasi linting:
```bash
npm run build
```
Output akan dihasilkan pada direktori `dist/`.

---

<div align="center">
  <sub>Dikembangkan dengan ❤️ untuk <b>Universitas Harkat Negeri</b> oleh Tim Developer TIKA CORE.</sub>
</div>
