# Navigating Career in Tech — Web Presentation

Presentasi interaktif 13 slide untuk **Warda Laila × PyLadies Yogyakarta**, disusun mengikuti **Hook → Interact → Anchor** dari deck presentasi yang disetujui.

## Menjalankan

**Opsi 1 — Tanpa instalasi:** buka file `PyLadies_Navigating_Career_Interactive_Web.html` (versi single-file yang dibagikan terpisah). Browser modern dapat menjalankannya tanpa koneksi internet.

**Opsi 2 — Website project:** buka `index.html` dengan browser, atau jalankan server lokal dari direktori ini:

```bash
python3 -m http.server 5173
```

Kemudian buka `http://localhost:5173`. Semua aset lokal; tidak ada API, CDN, login, atau dependensi npm.

## Shortcut presentasi

| Kontrol | Fungsi |
|---|---|
| `→`, `Space`, `PageDown` | Tampilkan poin berikutnya, lalu lanjut slide |
| `←`, `PageUp` | Sembunyikan poin terakhir, lalu kembali slide |
| `Shift + →` | Lompat ke slide selanjutnya (melewati animasi poin) |
| `Shift + ←` | Kembali ke slide sebelumnya |
| `R` | Tampilkan semua poin di slide aktif |
| `Home` / `End` | Slide pertama / terakhir |
| `O` | Buka overview 13 slide |
| `N` | Buka/tutup catatan pembicara |
| `F` | Fullscreen |
| `?` | Bantuan singkat |

Di HP, gunakan tombol panah di bawah atau geser horizontal. Kontennya berubah menjadi layout vertikal yang bisa di-scroll.

## Interaksi H-I-A

- Slide 4: angkat tangan, timer 15 detik.
- Slide 8: diskusi studi kasus pasangan, timer 30 detik.
- Slide 10: refleksi karier, timer 20 detik.
- Slide 13: *call to action* memilih satu target, satu bukti, dan satu feedback.

Pemilihan opsi di browser hanya menyoroti jawaban di **perangkat pembuka presentasi**. Ini **bukan polling multiuser real-time**, tidak mengirim jawaban peserta ke server, dan tidak membutuhkan pihak ketiga.

**Catatan presenter** (`N`) muncul sebagai panel pada layar yang sama; jika sedang mirror layar ke proyektor, panel juga akan terlihat oleh audiens. Tutup panel sebelum memproyeksikan, atau buka salinan presentasi pada layar/perangkat pribadi untuk membaca catatan. Isi catatan berasal dari PPTX sumber, termasuk pemetaan 20 pertanyaan prioritas moderator.

## Deploy ke Vercel

1. Upload folder ini ke GitHub (root berisi `index.html`).
2. Di Vercel, buat project baru dari repository tersebut.
3. Pilih preset **Other**, tanpa build command. Gunakan root project sebagai output directory (static site).
4. Deploy. Semua navigasi dan interaksi berjalan client-side.

Atau upload folder yang diekstrak ke platform static hosting seperti Netlify atau GitHub Pages. Belum ada domain/URL publik yang dibuat dalam paket ini.

## Desain dan sumber

- Warna: warm ivory, beige, plum, burgundy lembut, gold ringan.
- Visual: aset image editorial dari versi final yang telah dipilih, mayoritas tanpa manusia.
- Isi: berdasarkan deck `PyLadies_Warda_Navigating_Career_HIA_13Slides.pptx`, Tab 2 agenda fireside chat, dan CV yang diberikan pengguna.
- Data pribadi: tidak ada formulir pengumpulan data, analytics, atau backend.
- Catatan: uraian perubahan definisi sukses pada slide 2 adalah contoh framing editorial, **bukan** klaim faktual tentang tujuan hidup pribadi pembicara.

## Struktur

```
index.html    - Struktur 13 slide web
styles.css    - Design system, responsivitas, transisi
app.js        - Navigasi, timer, overview, catatan, keyboard
notes.js      - Speaker notes dari deck sumber
assets/       - Dua gambar webp teroptimasi
README.md     - Instruksi pemakaian dan deployment
```
