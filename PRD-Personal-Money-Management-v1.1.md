# Product Requirements Document (PRD)

## Personal Money Management System

| | |
|---|---|
| **Versi** | 1.1 (disempurnakan dari v1.0) |
| **Status** | Siap dikembangkan (Ready for Development) |
| **Platform** | Mobile Web / PWA |
| **Pengguna** | Pribadi / Single User |
| **Tech Stack** | Next.js (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL · Recharts · Zod |
| **Hosting** | Vercel (aplikasi) + Supabase (database & autentikasi) |
| **Bahasa UI** | Bahasa Indonesia (default) |
| **Mata uang** | Rupiah (IDR), tanpa desimal |
| **Zona waktu** | Asia/Jakarta (WIB, UTC+7) |

---

## Daftar Isi

1. Ringkasan Penyempurnaan dari v1.0
2. Gambaran Produk
3. Masalah yang Diselesaikan
4. Tujuan & Prinsip Produk
5. Pengguna Target & Skenario Penggunaan
6. Ruang Lingkup MVP
7. Arsitektur Informasi & Navigasi
8. Aturan Bisnis Inti
9. Kebutuhan Fitur (Functional Requirements)
10. Model Data & Skema Prisma
11. Arsitektur Teknis & Endpoint
12. Kebutuhan UI/UX
13. Kebutuhan Non-Fungsional
14. Validasi, Error Handling & Empty State
15. Edge Case yang Harus Ditangani
16. Strategi Pengujian
17. Roadmap Pengembangan
18. Definition of Done
19. Metrik Keberhasilan
20. Risiko & Mitigasi
21. Pertanyaan Terbuka & Keputusan yang Perlu Dikonfirmasi
22. Fitur Masa Depan
23. Definisi Akhir Produk
24. Lampiran

---

## 1. Ringkasan Penyempurnaan dari v1.0

PRD v1.0 sudah kuat di sisi visi dan alur pengguna. Versi 1.1 menutup celah yang biasanya baru terasa saat coding dimulai.

| # | Area | Masalah di v1.0 | Perbaikan di v1.1 |
|---|---|---|---|
| 1 | **Transfer** | Ada fitur transfer antar-akun yang sebenarnya tidak dibutuhkan. | **Dihapus.** Transaksi hanya Income dan Expense, satu akun per transaksi. Model data dan perhitungan saldo menjadi lebih sederhana. |
| 2 | **Penyimpanan uang** | Tipe data nominal tidak ditentukan. | Nominal disimpan sebagai **integer Rupiah** (`BigInt`), tidak pernah `Float`, sehingga tidak ada selisih pembulatan. |
| 3 | **Budget total** | Dashboard menampilkan "Monthly Budget" total, tetapi data model hanya punya budget per kategori. | Total budget bulanan = jumlah seluruh budget kategori bulan itu. Dijelaskan di Aturan Bisnis. |
| 4 | **Batas status budget** | Rentang 0–70 / 70–90 / 90–100 saling tumpang tindih di angka batas. | Batas dibuat tegas (mis. 70% masuk Warning, 100% masih Critical, di atas 100% Over). |
| 5 | **Hapus kategori & akun** | Hanya disebut "tidak boleh dihapus tanpa penanganan". | Ditetapkan mekanisme **arsip (soft delete)** dan opsi pindahkan transaksi. |
| 6 | **Zona waktu** | Tidak disebut. Transaksi jam 00:30 WIB bisa masuk bulan yang salah. | Semua batas hari dan bulan dihitung dalam WIB. |
| 7 | **Database & hosting** | Strategi database dan hosting tidak dibahas. | Ditetapkan **Vercel + Supabase (PostgreSQL)**, lengkap dengan variabel env, region, RLS, dan catatan backup (bagian 11.4–11.5). |
| 8 | **Import data** | Hanya alur umum. | Ditambah validasi skema, versi backup, auto-backup sebelum import, dan proses atomik. |
| 9 | **Insight** | Aturan ada, prioritas dan batas jumlah tidak ada. | Ditambah prioritas, batas tampil, dan penanganan kasus data nol. |
| 10 | **Autentikasi** | Hanya "wajib jika online". | Login sederhana (satu akun pemilik) **wajib sejak versi pertama** karena aplikasi diakses online. |
| 11 | **Navigasi** | Diagram bottom nav menampilkan 5 elemen tetapi teksnya 4 menu, dan Settings tidak punya akses. | Disusun ulang: 4 tab + tombol `+` di tengah, Settings lewat ikon di header. |
| 12 | **Fitur yang kurang** | – | Ditambah: pencarian transaksi, salin budget bulan lalu, navigasi bulan, template transaksi cepat (opsional), pengingat backup. |
| 13 | **Teknis** | Tidak ada skema, endpoint, struktur folder, pengujian. | Ditambahkan skema Prisma, daftar endpoint, struktur folder, strategi pengujian, dan roadmap dengan estimasi. |

---

## 2. Gambaran Produk

**Personal Money Management System** adalah aplikasi web pribadi untuk mencatat, memantau, dan memahami kondisi keuangan sehari-hari. Aplikasi ini adalah alternatif sederhana dari aplikasi money management berbayar.

Fokus utama:

- Pencatatan pemasukan dan pengeluaran.
- Pemantauan saldo per akun dan total.
- Pengelolaan budget bulanan per kategori.
- Riwayat transaksi yang mudah dicari dan difilter.
- Statistik pengeluaran yang sederhana.
- Insight keuangan berbasis aturan (tanpa AI).
- Backup dan restore data secara mandiri.

Aplikasi **mobile-first**: semua aktivitas utama harus nyaman dilakukan dengan satu tangan di smartphone.

---

## 3. Masalah yang Diselesaikan

Aplikasi keuangan yang ada sering terlalu kompleks atau mengunci fitur penting di balik langganan. Pengguna membutuhkan aplikasi yang:

1. Gratis dan dimiliki sepenuhnya oleh pengguna.
2. Sederhana dan tidak butuh banyak konfigurasi.
3. Cepat untuk mencatat transaksi (target < 10 detik).
4. Mudah menunjukkan kondisi keuangan saat ini.
5. Memiliki pemantauan budget.
6. Bisa digunakan lewat smartphone.
7. Datanya dapat di-backup dan dipindahkan sendiri.

---

## 4. Tujuan & Prinsip Produk

### 4.1 Tujuan utama

> Membantu pengguna mengetahui ke mana uangnya digunakan dan apakah kondisi keuangannya masih sesuai budget.

### 4.2 Sasaran turunan

- Mempercepat pencatatan transaksi.
- Menampilkan kondisi keuangan secara sederhana.
- Membantu mengontrol pengeluaran.
- Menghilangkan ketergantungan pada aplikasi finance berbayar.

### 4.3 Prinsip produk

| Prinsip | Arti dalam praktik |
|---|---|
| **Simple** | Tidak ada fitur yang tidak dibutuhkan untuk kebutuhan personal. |
| **Mobile First** | Dirancang di layar 360–430px dulu, desktop menyusul. |
| **Fast** | Mencatat transaksi < 10 detik, halaman utama terasa instan. |
| **Private** | Data hanya tersimpan di project Supabase milik sendiri dan hanya bisa diakses setelah login; tanpa analytics/tracking. |
| **Useful over Fancy** | Fitur yang membantu keputusan uang diutamakan di atas tampilan mewah. |
| **Trustworthy** | Angka harus selalu benar. Lebih baik fitur lebih sedikit daripada saldo yang salah. |

---

## 5. Pengguna Target & Skenario Penggunaan

### 5.1 Pengguna utama

Satu orang pemilik data yang ingin mengelola pemasukan, pengeluaran, saldo, budget, dan pola penggunaan uang. Tidak ada multi-user pada MVP.

### 5.2 Tujuan pengguna

Pengguna harus bisa:

1. Mengetahui total uang yang dimiliki, dan per akun.
2. Mengetahui pemasukan dan pengeluaran bulan berjalan.
3. Mencatat transaksi dengan cepat.
4. Mengetahui pengeluaran per kategori.
5. Menentukan budget bulanan.
6. Mengetahui apakah budget hampir habis.
7. Melihat, mencari, mengedit, dan menghapus riwayat transaksi.
8. Melihat statistik sederhana dan membandingkannya dengan bulan lalu.
9. Membackup dan memulihkan data.

### 5.3 Skenario nyata

| Situasi | Yang dilakukan pengguna | Hasil yang diharapkan |
|---|---|---|
| Baru bayar makan siang di kasir | Buka app → `+` → ketik nominal → pilih kategori → Simpan | Tercatat < 10 detik, saldo langsung berkurang |
| Gajian | Catat Income "Salary" ke BCA | Saldo BCA dan income bulan ini bertambah |
| Pertengahan bulan | Lihat dashboard | Tahu sisa budget dan kategori yang hampir habis |
| Awal bulan baru | Salin budget bulan lalu, sesuaikan | Budget siap dalam beberapa ketukan |
| Ganti HP | Buka alamat aplikasi di HP baru, login, lalu install PWA | Semua data sudah ada karena tersimpan di cloud |

---

## 6. Ruang Lingkup MVP

### 6.1 Termasuk (In Scope)

- Dashboard
- Manajemen Transaksi (Income dan Expense)
- Manajemen Akun
- Manajemen Kategori
- Manajemen Budget
- Statistik
- Insight keuangan berbasis aturan
- Export / Import data (JSON, CSV)
- Dark mode
- PWA (dapat di-install)
- Pencarian transaksi *(baru)*
- Salin budget dari bulan sebelumnya *(baru)*
- Pengingat backup di dalam aplikasi *(baru)*
- Login sederhana (satu akun pemilik), **wajib** karena aplikasi diakses online *(baru)*

### 6.2 Tidak Termasuk (Out of Scope)

- Multi-user, admin dashboard, role & permission
- Bank API dan sinkronisasi transaksi otomatis, payment gateway
- Pelacakan investasi, kripto, hutang/piutang
- AI financial advisor, prediksi, forecasting kompleks
- Fitur sosial, berbagi, akun keluarga, patungan
- Gamifikasi
- Multi-mata-uang
- Transfer antar-akun (tidak dibutuhkan)
- Transaksi berulang (ditunda ke V1.1)
- Mode offline penuh dengan antrean sinkronisasi (ditunda; lihat bagian 13)

---

## 7. Arsitektur Informasi & Navigasi

```text
Money Management
│
├── Home (Dashboard)
│
├── Transaksi
│   ├── Semua
│   ├── Pemasukan
│   └── Pengeluaran
│
├── Statistik
│
├── Budget
│
└── Pengaturan  (diakses lewat ikon ⚙ di header Home)
    ├── Akun
    ├── Kategori
    ├── Backup Data (Export / Import)
    ├── Tampilan (Light / Dark / System)
    └── Keamanan (ganti password, logout)
```

### Bottom navigation (mobile)

```text
┌─────────────────────────────────────┐
│            Konten halaman           │
│                                     │
├─────────────────────────────────────┤
│  Home   Transaksi   [ + ]   Statistik   Budget │
└─────────────────────────────────────┘
```

- 4 tab: **Home, Transaksi, Statistik, Budget**.
- Tombol **`+`** berada di tengah dan menonjol, selalu terlihat di semua halaman utama.
- Pengaturan dibuka lewat ikon ⚙ di pojok kanan atas Home, karena jarang dipakai.

---

## 8. Aturan Bisnis Inti

Bagian ini adalah **sumber kebenaran** untuk semua perhitungan. Setiap perhitungan harus dilakukan di server (satu fungsi terpusat) dan diuji.

### 8.1 Aturan uang

- Semua nominal disimpan sebagai **bilangan bulat Rupiah** (tanpa desimal).
- Nominal transaksi harus **> 0**. Arah (masuk/keluar) ditentukan oleh `type`, bukan tanda minus.
- Batas wajar satu transaksi: ≤ Rp 999.999.999.999 (validasi agar tidak salah ketik).
- Tampilan: `Rp4.250.000` (pemisah titik).

### 8.2 Saldo akun

```text
Saldo Akun =
    Initial Balance
  + Σ Income        (accountId = akun ini)
  − Σ Expense       (accountId = akun ini)
```

```text
Total Saldo = Σ Saldo semua akun yang tidak diarsipkan
```

Catatan:
- Saldo akun **boleh negatif** (mis. salah input atau pinjaman), tetapi aplikasi menampilkan peringatan: *"Saldo BCA akan menjadi negatif."* Simpan tetap diizinkan.
- Akun yang diarsipkan tidak dihitung dalam Total Saldo, tetapi transaksi historisnya tetap ada.

### 8.3 Ringkasan bulanan

```text
Income Bulanan  = Σ Income dalam bulan tersebut
Expense Bulanan = Σ Expense dalam bulan tersebut
Saving          = Income Bulanan − Expense Bulanan
Saving Rate     = Saving ÷ Income Bulanan × 100   (jika Income = 0 → tampilkan "–")
```

Saving bisa negatif (defisit) dan harus ditampilkan dengan jelas, bukan disembunyikan.

### 8.4 Budget

```text
Total Budget Bulanan = Σ budget semua kategori pada bulan tersebut
Pemakaian Kategori   = Σ Expense kategori tersebut pada bulan tersebut
Persentase Pemakaian = Pemakaian ÷ Budget × 100
Sisa Budget          = Budget − Pemakaian   (bisa negatif = lewat budget)
```

Status budget (batas tegas):

| Rentang persentase | Status | Warna |
|---|---|---|
| < 70% | Safe | Hijau |
| 70% hingga < 90% | Warning | Kuning |
| 90% hingga 100% | Critical | Oranye |
| > 100% | Over Budget | Merah |

Aturan tambahan:
- Hanya kategori bertipe **EXPENSE** yang bisa diberi budget.
- Satu kategori hanya punya satu budget per bulan (unik: `categoryId + month + year`).
- Pengeluaran pada kategori **tanpa budget** tetap dihitung di total expense, tetapi tidak masuk ke "Total Budget Bulanan".
- Dashboard menampilkan *"Pemakaian budget"* = Σ expense kategori yang punya budget ÷ Total Budget.

### 8.5 Periode & zona waktu

- Satu bulan = tanggal 1 pukul 00:00 s.d. akhir bulan 23:59:59 **WIB**.
- Tanggal disimpan dalam UTC di database; konversi ke WIB dilakukan saat query dan tampilan.
- Opsi (Pengaturan): **tanggal mulai bulan** (default 1). Berguna bila gajian di tanggal 25 dan ingin periode 25–24. *Opsional, bisa ditunda setelah MVP.*

### 8.6 Aturan hapus (integritas data)

| Objek | Aturan |
|---|---|
| **Transaksi** | Hapus permanen setelah konfirmasi. Saldo dihitung ulang otomatis. |
| **Kategori yang sudah dipakai** | Tidak bisa dihapus permanen. Pilihannya: **Arsipkan** (tidak muncul di form baru, riwayat tetap utuh) atau **Pindahkan transaksi ke kategori lain lalu hapus**. |
| **Kategori default** | Hanya bisa diedit/diarsipkan, tidak dihapus. Kategori "Other" tidak boleh diarsipkan agar selalu ada tempat pindah. |
| **Akun yang punya transaksi** | Tidak bisa dihapus. Hanya **Arsipkan**. Akun tanpa transaksi boleh dihapus. |
| **Budget** | Boleh dihapus bebas, tidak memengaruhi transaksi. |

### 8.7 Perilaku default form

- Tipe = Expense
- Tanggal = hari ini (WIB)
- Akun = akun yang terakhir dipakai
- Kategori = kategori terakhir yang dipakai **untuk tipe tersebut**
- Fokus keyboard langsung ke kolom nominal, dengan keypad numerik

---

## 9. Kebutuhan Fitur (Functional Requirements)

Setiap fitur memiliki ID agar mudah dirujuk saat pengembangan dan pengujian. Prioritas: **P0** = wajib MVP, **P1** = penting, **P2** = bagus jika sempat.

### 9.1 Dashboard (FR-DASH)

Halaman utama; harus menjawab tiga pertanyaan tanpa scroll berlebihan:
1. Berapa uang saya sekarang?
2. Berapa yang sudah keluar bulan ini?
3. Apakah masih sesuai budget?

**Informasi yang ditampilkan (urutan dari atas):**

1. Sapaan singkat (sesuai waktu: pagi/siang/sore/malam) dan ikon ⚙ Pengaturan.
2. **Total Saldo** (angka besar) dan opsi ketuk untuk melihat rincian per akun.
3. Ringkasan bulan berjalan: Income, Expense, Saving.
4. **Budget bulanan** dengan progress bar dan status warna.
5. Insight (maksimal 3, lihat 9.10).
6. 5 transaksi terakhir dengan tautan "Lihat semua".

Contoh:

```text
Selamat pagi 👋                                  ⚙

Total Saldo
Rp4.250.000

Pemasukan        Pengeluaran        Tersisa
Rp5.000.000      Rp2.750.000        Rp2.250.000

Budget Oktober
Rp2.750.000 / Rp3.500.000
██████████████░░ 79%   · Warning

⚠️ Entertainment hampir habis (92%)

Transaksi Terakhir
🍜 Makan siang        Cash       -Rp35.000
🚗 Grab               BCA        -Rp25.000
💰 Freelance          BCA       +Rp500.000
```

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-DASH-1 | Menampilkan total saldo saat aplikasi dibuka | P0 |
| FR-DASH-2 | Menampilkan income, expense, saving bulan berjalan | P0 |
| FR-DASH-3 | Menampilkan progress budget total dengan status warna | P0 |
| FR-DASH-4 | Menampilkan minimal 5 transaksi terakhir | P0 |
| FR-DASH-5 | Menampilkan insight (maks. 3) | P1 |
| FR-DASH-6 | Rincian saldo per akun dapat dibuka dari kartu saldo | P1 |
| FR-DASH-7 | Dashboard dapat digunakan nyaman di layar 360px | P0 |
| FR-DASH-8 | Jika belum ada data, tampilkan empty state dengan ajakan setup | P0 |

### 9.2 Manajemen Transaksi (FR-TRX)

Dua tipe:

```text
INCOME   → uang masuk ke akun
EXPENSE  → uang keluar dari akun
```

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-TRX-1 | Membuat transaksi Income dan Expense | P0 |
| FR-TRX-2 | Mengedit seluruh field transaksi, termasuk mengubah tipe | P0 |
| FR-TRX-3 | Menghapus transaksi dengan konfirmasi | P0 |
| FR-TRX-4 | Saldo akun dan dashboard terbarui otomatis setelah simpan/edit/hapus | P0 |
| FR-TRX-5 | Tanggal transaksi dapat diisi mundur (maupun hari berikutnya dengan peringatan) | P0 |
| FR-TRX-6 | Setelah hapus, tampilkan snackbar **"Urungkan"** selama ±5 detik | P2 |
| FR-TRX-7 | Duplikat transaksi (salin transaksi ke transaksi baru) | P2 |

### 9.3 Tambah Transaksi / Quick Add (FR-ADD)

Ini adalah **fitur paling sering dipakai**. Form dibuat sependek mungkin.

```text
[ Pengeluaran ] [ Pemasukan ]

Nominal
Rp ________            ← fokus otomatis, keypad numerik

Kategori               ← grid ikon (Expense/Income)
[🍜 Food] [🚗 Transport] [🛍 Shopping] ...

Akun
[ BCA ▾ ]

Catatan (opsional)
____________________

Tanggal
Hari ini ▾

[ Simpan Transaksi ]
```

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-ADD-1 | Dibuka lewat tombol `+` dari semua halaman utama, sebagai bottom sheet | P0 |
| FR-ADD-2 | Kolom nominal otomatis fokus dan memakai keypad numerik | P0 |
| FR-ADD-3 | Format nominal otomatis dengan pemisah ribuan saat mengetik | P0 |
| FR-ADD-4 | Nilai default sesuai bagian 8.7 | P0 |
| FR-ADD-5 | Kategori dipilih dengan grid ikon (1 ketukan), bukan dropdown | P0 |
| FR-ADD-6 | Setelah simpan: tutup form, tampilkan toast "Tersimpan", dashboard terbarui | P0 |
| FR-ADD-7 | Tombol **"Simpan & tambah lagi"** untuk input beberapa transaksi berturut-turut | P1 |
| FR-ADD-8 | Pintasan nominal cepat (mis. +10rb, +50rb) *atau* kalkulator sederhana di kolom nominal | P2 |
| FR-ADD-9 | Draf form tidak hilang bila sheet tertutup tidak sengaja (tersimpan di memori sesi, bukan localStorage) | P2 |

**Acceptance criteria:** Pengguna dapat mencatat expense dengan urutan: ketuk `+` → ketik nominal → ketuk kategori → ketuk Simpan (4 aksi, < 10 detik) dengan akun dan tanggal memakai default.

### 9.4 Riwayat Transaksi (FR-HIST)

```text
Senin, 5 Oktober 2026                      -Rp60.000

🍜 Makan siang
   Food · Cash                              -Rp35.000

🚗 Grab
   Transport · BCA                          -Rp25.000

Minggu, 4 Oktober 2026                    +Rp500.000

💰 Freelance
   Freelance · BCA                         +Rp500.000
```

Transaksi dikelompokkan per hari, dengan subtotal harian.

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-HIST-1 | Daftar transaksi dikelompokkan per tanggal, terbaru di atas | P0 |
| FR-HIST-2 | Filter tipe: Semua / Income / Expense | P0 |
| FR-HIST-3 | Filter tanggal: Hari ini, Minggu ini, Bulan ini, Rentang kustom | P0 |
| FR-HIST-4 | Filter tambahan: akun dan kategori | P1 |
| FR-HIST-5 | **Pencarian** berdasarkan catatan | P1 |
| FR-HIST-6 | Ketuk transaksi → detail; dari detail dapat Edit atau Hapus | P0 |
| FR-HIST-7 | Pagination / infinite scroll (muat 30 item per halaman) | P0 |
| FR-HIST-8 | Menampilkan total filter yang sedang aktif (mis. total expense hasil pencarian) | P2 |

### 9.5 Manajemen Akun (FR-ACC)

Akun adalah sumber uang.

```text
Cash       Rp500.000
BCA        Rp3.250.000
GoPay      Rp500.000
──────────────────────
Total      Rp4.250.000
```

Tipe: **Cash, Bank, E-Wallet, Other**.
Field: `name`, `type`, `initialBalance`, `icon` (opsional), `isArchived`.

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-ACC-1 | Tambah, edit, arsipkan akun | P0 |
| FR-ACC-2 | Nama akun unik (tidak peka huruf besar/kecil) | P0 |
| FR-ACC-3 | Saldo awal dapat diatur saat membuat akun dan dapat diubah | P0 |
| FR-ACC-4 | Saldo dihitung sesuai bagian 8.2 | P0 |
| FR-ACC-5 | Akun yang memiliki transaksi tidak bisa dihapus, hanya diarsipkan | P0 |
| FR-ACC-6 | Urutan tampil akun dapat diatur *(atau urut berdasarkan pemakaian terakhir)* | P2 |
| FR-ACC-7 | **Rekonsiliasi saldo**: pengguna memasukkan saldo sebenarnya, sistem menyesuaikan **saldo awal** akun sebesar selisihnya (tidak membuat transaksi, sehingga income/expense/statistik tidak terpengaruh) | P1 |

> **Catatan perubahan saldo awal:** mengubah `initialBalance` akan mengubah semua saldo historis akun tersebut. Tampilkan peringatan sebelum menyimpan.

### 9.6 Manajemen Kategori (FR-CAT)

Kategori default disediakan sistem saat pertama kali dibuka (seed).

**Expense:** Food, Transportation, Shopping, Entertainment, Bills, Education, Health, Other
**Income:** Salary, Freelance, Gift, Other

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-CAT-1 | Tambah kategori dengan nama, tipe (Income/Expense), ikon (emoji), dan warna | P0 |
| FR-CAT-2 | Edit nama, ikon, warna kategori | P0 |
| FR-CAT-3 | Hapus/arsip kategori sesuai aturan 8.6 | P0 |
| FR-CAT-4 | Nama kategori unik dalam tipe yang sama | P0 |
| FR-CAT-5 | Kategori "Other" (Expense dan Income) tidak dapat dihapus/diarsipkan | P0 |
| FR-CAT-6 | Warna kategori dipakai konsisten di grafik statistik | P1 |

### 9.7 Manajemen Budget (FR-BUD)

Budget membatasi pengeluaran per kategori **per bulan**.

```text
Food
Rp750.000 / Rp1.500.000
██████████░░░░░░ 50%  · Safe
Sisa Rp750.000
```

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-BUD-1 | Membuat, mengubah, menghapus budget per kategori Expense per bulan | P0 |
| FR-BUD-2 | Satu kategori satu budget per bulan | P0 |
| FR-BUD-3 | Budget usage dihitung otomatis dari transaksi Expense | P0 |
| FR-BUD-4 | Status Safe / Warning / Critical / Over Budget sesuai 8.4 | P0 |
| FR-BUD-5 | Navigasi bulan (← Oktober 2026 →) untuk melihat/menyusun budget bulan lain | P0 |
| FR-BUD-6 | Kartu ringkasan total budget (total, terpakai, sisa) di atas daftar | P0 |
| FR-BUD-7 | Tombol **"Salin dari bulan lalu"** untuk mengisi budget secara massal | P1 |
| FR-BUD-8 | Menampilkan *rata-rata harian yang aman*: Sisa budget ÷ sisa hari dalam bulan | P2 |
| FR-BUD-9 | Daftar budget diurutkan: yang paling kritis di atas | P1 |

### 9.8 Statistik (FR-STAT)

Dibuat sederhana dan mudah dipahami; bukan dashboard analytics rumit.

**Ringkasan periode:** Income, Expense, Saving, Saving Rate.

**Rincian expense per kategori:**

```text
Food             Rp850.000     31%
Bills            Rp500.000     18%
Transport        Rp400.000     15%
Shopping         Rp350.000     13%
Entertainment    Rp250.000      9%
Other            Rp400.000     15%
```

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-STAT-1 | Pemilih periode: bulan (default) dengan navigasi ← → | P0 |
| FR-STAT-2 | Ringkasan Income / Expense / Saving / Saving Rate | P0 |
| FR-STAT-3 | **Donut chart** komposisi expense per kategori, beserta daftar nominal & persen | P0 |
| FR-STAT-4 | **Bar chart** income vs expense 6 bulan terakhir | P0 |
| FR-STAT-5 | Ketuk kategori pada daftar → buka riwayat transaksi terfilter kategori tersebut dan periode | P1 |
| FR-STAT-6 | Toggle tampilan Expense / Income pada donut chart | P2 |
| FR-STAT-7 | Grafik tren pengeluaran harian dalam bulan | P2 |

Pertimbangan performa: agregasi dilakukan di database/server, hanya hasil ringkas yang dikirim ke client.

### 9.9 Insight Keuangan (FR-INS)

Insight dihasilkan dari **aturan sederhana** (tanpa AI). Dihitung di server.

| Prioritas | ID | Kondisi | Pesan |
|---|---|---|---|
| 1 | INS-01 | Budget kategori > 100% | ⚠️ Budget **Food** telah terlampaui Rp120.000. |
| 2 | INS-02 | Budget kategori 90–100% | ⚠️ Budget **Entertainment** hampir habis (92%). |
| 3 | INS-03 | Total expense bulan ini lebih tinggi dari bulan lalu (pada periode hari yang sama) | 📈 Pengeluaran bulan ini naik 12% dibanding periode yang sama bulan lalu. |
| 4 | INS-04 | Kategori terbesar | 💡 Pengeluaran terbesar bulan ini adalah **Food** (31%). |
| 5 | INS-05 | Saving positif | 💰 Kamu berhasil menyisakan Rp2.250.000 bulan ini. |
| 6 | INS-06 | Saving negatif | 🔴 Pengeluaran melebihi pemasukan sebesar Rp300.000 bulan ini. |
| 7 | INS-07 | Tidak ada budget bulan ini | 🎯 Kamu belum membuat budget bulan ini. |
| 8 | INS-08 | Terakhir backup > 30 hari | 💾 Sudah 30 hari sejak backup terakhir. Backup sekarang? |

Aturan tampilan:
- Dashboard menampilkan **maksimal 3** insight dengan prioritas tertinggi; halaman Statistik menampilkan semuanya.
- Perbandingan bulan lalu (INS-03) memakai **periode yang sama** (mis. tanggal 1–5 vs tanggal 1–5 bulan lalu) agar adil di pertengahan bulan.
- Jika data bulan lalu tidak ada atau nol, INS-03 tidak ditampilkan (hindari pembagian dengan nol).
- Insight tidak boleh menyalahkan; gunakan bahasa netral dan membantu.

### 9.10 Export Data (FR-EXP)

| Format | Isi | Kegunaan |
|---|---|---|
| **JSON** | Seluruh data (accounts, categories, transactions, budgets, settings) beserta `schemaVersion` | Backup penuh & restore |
| **CSV** | Transaksi saja (kolom: tanggal, tipe, kategori, akun, nominal, catatan) | Dibuka di Excel/Google Sheets |

Nama file:

```text
money-management-backup-2026-10-05.json
money-management-transactions-2026-10-05.csv
```

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-EXP-1 | Export JSON penuh dalam satu ketukan | P0 |
| FR-EXP-2 | Export CSV transaksi (dengan filter rentang tanggal opsional) | P0 |
| FR-EXP-3 | JSON memuat `schemaVersion`, `exportedAt`, `appVersion` | P0 |
| FR-EXP-4 | CSV memakai UTF-8 dengan BOM agar terbuka benar di Excel | P1 |
| FR-EXP-5 | Mencatat tanggal backup terakhir untuk pengingat (INS-08) | P1 |

### 9.11 Import Data (FR-IMP)

```text
Pengaturan → Backup Data → Import
        ↓
Pilih file backup (.json)
        ↓
Validasi file (format, versi, integritas relasi)
        ↓
Preview: jumlah akun, kategori, transaksi, budget + rentang tanggal
        ↓
Peringatan: "Data saat ini akan DITIMPA"
        ↓
Konfirmasi (ketik "IMPORT" atau tombol dua langkah)
        ↓
Auto-backup data lama → Import dalam satu transaksi database
        ↓
Selesai / atau dibatalkan penuh jika ada error
```

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-IMP-1 | Hanya menerima JSON hasil export aplikasi ini | P0 |
| FR-IMP-2 | Validasi struktur dengan Zod; tolak file rusak dengan pesan jelas | P0 |
| FR-IMP-3 | Cek kompatibilitas `schemaVersion` | P0 |
| FR-IMP-4 | Cek relasi: setiap transaksi merujuk akun/kategori yang ada di file | P0 |
| FR-IMP-5 | Preview ringkasan sebelum menimpa | P0 |
| FR-IMP-6 | Konfirmasi eksplisit sebelum data lama ditimpa | P0 |
| FR-IMP-7 | **Backup otomatis** data lama diunduh/disimpan sebelum import berjalan | P1 |
| FR-IMP-8 | Import berjalan **atomik**: berhasil seluruhnya atau tidak sama sekali | P0 |

### 9.12 Dark Mode (FR-THEME)

Mode: **Light / Dark / System**. Default: **System**.

- Pilihan disimpan di database (tabel Settings) atau cookie agar tidak berkedip saat dimuat (hindari flash of wrong theme).
- Warna status budget dan grafik harus tetap terbaca di kedua mode (kontras ≥ WCAG AA).

### 9.13 PWA (FR-PWA)

```text
Buka Browser → Add to Home Screen → Ikon "Money" di layar utama → Terbuka layar penuh
```

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-PWA-1 | `manifest.webmanifest` (nama, ikon 192/512 dan maskable, `display: standalone`, theme color) | P0 |
| FR-PWA-2 | Service worker untuk cache aset statis (app shell) agar app terbuka cepat; **tidak** meng-cache respons API/data keuangan | P1 |
| FR-PWA-3 | Layar offline sederhana bila server tak terjangkau, dengan pesan jelas | P1 |
| FR-PWA-4 | Splash screen & ikon yang rapi di Android dan iOS | P1 |
| FR-PWA-5 | Layout aman terhadap notch dan bottom bar (safe-area insets) | P0 |

### 9.14 Keamanan Akses (FR-SEC)

Aplikasi berjalan online (Vercel) dengan data di Supabase, sehingga **login wajib sejak versi pertama**. Karena single-user, cukup satu akun pemilik.

**Pendekatan yang direkomendasikan:** Supabase Auth dengan satu akun email + password, dan **pendaftaran publik dinonaktifkan** (akun dibuat sekali lewat dashboard Supabase). Dengan begitu tidak perlu menulis logika sesi dan hash password sendiri.

**Alternatif lebih ringan:** satu password pemilik yang di-hash dan disimpan di environment variable, dengan sesi berbasis cookie bertanda tangan. Pilih salah satu; jangan menggabungkan keduanya.

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-SEC-1 | Login wajib sebelum mengakses halaman atau API apa pun; belum login diarahkan ke `/login` | P0 |
| FR-SEC-2 | Hanya satu akun pemilik; pendaftaran publik dinonaktifkan | P0 |
| FR-SEC-3 | Sesi memakai cookie `httpOnly`, `secure`, `sameSite=lax`; tersedia tombol logout | P0 |
| FR-SEC-4 | **Setiap** route handler dan server action memverifikasi sesi di server (tidak cukup hanya middleware atau menyembunyikan UI) | P0 |
| FR-SEC-5 | Row Level Security (RLS) aktif di semua tabel Supabase **tanpa policy**, sehingga API publik Supabase tidak bisa membaca data. Prisma tetap bekerja karena terhubung dari server dengan connection string database | P0 |
| FR-SEC-6 | Connection string dan secret hanya di environment server; **tidak** memakai awalan `NEXT_PUBLIC_` | P0 |
| FR-SEC-7 | Pembatasan percobaan login (rate limit) | P1 |
| FR-SEC-8 | Sesi kedaluwarsa setelah lama tidak aktif; opsi kunci otomatis | P2 |
| FR-SEC-9 | Verifikasi dua langkah (MFA) untuk login | P2 |
---

## 10. Model Data & Skema Prisma

### 10.1 Entitas

```text
Account · Category · Transaction · Budget · Setting
```

`User` tidak diperlukan pada MVP karena aplikasi single-user.

### 10.2 Relasi

```text
ACCOUNT 1 ───< N TRANSACTION (accountId, wajib)
CATEGORY 1 ──< N TRANSACTION (categoryId, wajib)
CATEGORY 1 ──< N BUDGET
```

### 10.3 Skema Prisma (acuan)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // koneksi pooler (runtime)
  directUrl = env("DIRECT_URL")     // koneksi langsung (migrasi)
}

enum AccountType {
  CASH
  BANK
  EWALLET
  OTHER
}

enum CategoryType {
  INCOME
  EXPENSE
}

enum TransactionType {
  INCOME
  EXPENSE
}

model Account {
  id             String      @id @default(cuid())
  name           String      @unique
  type           AccountType
  initialBalance BigInt      @default(0)
  icon           String?
  isArchived     Boolean     @default(false)
  sortOrder      Int         @default(0)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  transactions   Transaction[]
}

model Category {
  id         String       @id @default(cuid())
  name       String
  type       CategoryType
  icon       String?
  color      String?
  isDefault  Boolean      @default(false)
  isArchived Boolean      @default(false)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  transactions Transaction[]
  budgets      Budget[]

  @@unique([name, type])
}

model Transaction {
  id         String          @id @default(cuid())
  type       TransactionType
  amount     BigInt                      // selalu > 0
  note       String?
  date       DateTime                    // disimpan UTC, ditampilkan WIB
  accountId  String
  categoryId String
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt

  account  Account  @relation(fields: [accountId], references: [id], onDelete: Restrict)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  @@index([date])
  @@index([accountId, date])
  @@index([categoryId, date])
  @@index([type, date])
}

model Budget {
  id         String   @id @default(cuid())
  categoryId String
  amount     BigInt                       // > 0
  month      Int                          // 1–12
  year       Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  @@unique([categoryId, month, year])
  @@index([year, month])
}

model Setting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}
```

> **Catatan Prisma:** PostgreSQL mendukung enum secara native. Tipe `BigInt` perlu dikonversi ke `number`/`string` saat dikirim sebagai JSON (nilai Rupiah personal aman dalam `Number.MAX_SAFE_INTEGER`). Pada Prisma versi terbaru, lokasi konfigurasi URL koneksi bisa berbeda (mis. `prisma.config.ts`); ikuti dokumentasi versi yang dipakai.

### 10.4 Aturan konsistensi (divalidasi di server)

| Tipe | `accountId` | `categoryId` | Syarat kategori |
|---|---|---|---|
| INCOME | wajib | wajib | tipe kategori = INCOME |
| EXPENSE | wajib | wajib | tipe kategori = EXPENSE |

Aturan lain:
- `amount > 0` dan bilangan bulat.
- Akun yang diarsipkan tidak bisa dipilih untuk transaksi baru (tetap tampil di riwayat lama).
- Kategori yang diarsipkan tidak muncul di form baru.

### 10.5 Settings yang disimpan

| Key | Nilai | Default |
|---|---|---|
| `theme` | `light` / `dark` / `system` | `system` |
| `lastBackupAt` | ISO datetime | kosong |
| `lastUsedAccountId` | id akun | kosong |
| `lastUsedCategory.EXPENSE` / `.INCOME` | id kategori | kosong |
| `monthStartDay` | 1–28 | 1 |
| `onboardingDone` | `true`/`false` | `false` |

### 10.6 Data awal (seed)

- 8 kategori Expense dan 4 kategori Income default (`isDefault = true`) dengan ikon emoji.
- Tidak ada akun default; pengguna membuat akun pertama saat onboarding.

Ikon default yang disarankan: Food 🍜, Transportation 🚗, Shopping 🛍️, Entertainment 🎬, Bills 🧾, Education 📚, Health 💊, Other 📦, Salary 💼, Freelance 💻, Gift 🎁.

### 10.7 Format file backup JSON

```json
{
  "app": "money-management",
  "schemaVersion": 1,
  "appVersion": "1.0.0",
  "exportedAt": "2026-10-05T09:11:00.000Z",
  "accounts": [],
  "categories": [],
  "transactions": [],
  "budgets": [],
  "settings": []
}
```

---

## 11. Arsitektur Teknis & Endpoint

### 11.1 Keputusan arsitektur

| Aspek | Keputusan |
|---|---|
| Framework | Next.js App Router, TypeScript strict |
| Data mutation | Server Actions atau Route Handlers; **semua logika bisnis di server** |
| Validasi | Zod di server (dan di client untuk umpan balik cepat) |
| Database | PostgreSQL di Supabase, diakses lewat Prisma **dari server** (bukan dari browser) |
| Hosting | Vercel: satu project Next.js, UI dan backend (route handler/server action) dalam satu repo |
| Autentikasi | Supabase Auth, satu akun pemilik (lihat 9.14) |
| Styling | Tailwind CSS; komponen sendiri atau shadcn/ui |
| Chart | Recharts (di-load dinamis agar bundle awal ringan) |
| State client | Minimal; manfaatkan Server Components dan revalidasi |
| Format uang & tanggal | Satu util terpusat (`formatRupiah`, `toWIB`, `monthRange`) |

### 11.2 Struktur folder

```text
src/
├── middleware.ts                    # arahkan ke /login bila belum ada sesi
├── app/
│   ├── (main)/
│   │   ├── page.tsx                 # Home / Dashboard
│   │   ├── transactions/page.tsx
│   │   ├── statistics/page.tsx
│   │   ├── budget/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── accounts/page.tsx
│   │       ├── categories/page.tsx
│   │       ├── backup/page.tsx
│   │       └── appearance/page.tsx
│   ├── login/page.tsx
│   ├── api/                         # route handlers (export/import)
│   ├── manifest.ts
│   └── layout.tsx
├── components/                      # UI reusable (Sheet, BudgetBar, ...)
├── features/
│   ├── transactions/ (actions, queries, schema, components)
│   ├── accounts/
│   ├── categories/
│   ├── budgets/
│   ├── statistics/
│   ├── insights/
│   └── backup/
├── lib/
│   ├── db.ts                        # Prisma client singleton
│   ├── supabase/                    # klien Supabase Auth (server & browser)
│   ├── money.ts                     # format & parse Rupiah
│   ├── date.ts                      # util WIB & rentang bulan
│   └── calc.ts                      # saldo, saving, budget usage (diuji unit)
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

### 11.3 Daftar endpoint / action

| Domain | Operasi |
|---|---|
| Transactions | `list(filter, cursor)`, `get(id)`, `create`, `update`, `delete` |
| Accounts | `list`, `create`, `update`, `archive`, `delete` (hanya tanpa transaksi), `reconcile` |
| Categories | `list(type)`, `create`, `update`, `archive`, `deleteWithReassign` |
| Budgets | `listByMonth(year, month)`, `upsert`, `delete`, `copyFromPreviousMonth` |
| Dashboard | `getSummary(year, month)` → saldo, income, expense, budget, recent, insights |
| Statistics | `getMonthly(year, month)`, `getCategoryBreakdown`, `getLastNMonths(n)` |
| Backup | `GET /api/export/json`, `GET /api/export/csv`, `POST /api/import/preview`, `POST /api/import/commit` |
| Auth | `login`, `logout`, `getSession` (via Supabase Auth) |

### 11.4 Deployment (Vercel + Supabase)

**Satu repo, satu project Next.js di Vercel.** Frontend dan backend tidak perlu dipisah: route handler dan server action Next.js berjalan sebagai serverless function di Vercel, dan Supabase hanya menjadi database (plus autentikasi).

#### Environment variables (Vercel dan `.env.local`)

| Variabel | Fungsi | Catatan |
|---|---|---|
| `DATABASE_URL` | Connection string **pooler** Supabase, dipakai saat runtime | Wajib lewat pooler karena serverless membuka banyak koneksi singkat; tambahkan parameter pooling sesuai dokumentasi Prisma |
| `DIRECT_URL` | Connection string langsung ke database | Hanya untuk `prisma migrate` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | Publik, hanya untuk Supabase Auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` (atau *publishable key*) | Kunci publik Supabase | Publik; aman karena RLS aktif tanpa policy |

> `DATABASE_URL` dan `DIRECT_URL` **tidak boleh** memakai awalan `NEXT_PUBLIC_` (nilai ber-awalan itu terkirim ke browser). Jangan membuat atau memakai *service role key* pada MVP ini; tidak dibutuhkan.

#### Langkah setup

1. Buat project Supabase; pilih region terdekat (mis. Singapura) untuk latensi rendah dari Indonesia.
2. Atur region Vercel Functions agar berdekatan dengan region Supabase (setiap request melakukan query database, jadi jarak berpengaruh).
3. Isi environment variables di Vercel dan di `.env.local`.
4. Jalankan migrasi Prisma secara terkontrol (dari lokal atau langkah build) memakai `DIRECT_URL`, lalu seed kategori default.
5. **Aktifkan RLS di semua tabel** (tanpa policy) dan pastikan tabel tidak dapat diakses lewat API publik Supabase.
6. Nonaktifkan pendaftaran publik di Supabase Auth, lalu buat satu akun pemilik.
7. Deploy, buka lewat HTTPS (otomatis di Vercel), lalu install PWA di HP.

#### Pemisahan lingkungan

Gunakan project Supabase terpisah untuk pengembangan, atau Supabase lokal. Jangan menjalankan percobaan dan migrasi yang belum teruji langsung di database yang berisi data keuangan asli.

#### Biaya dan batasan paket

Paket gratis umumnya cukup untuk penggunaan pribadi, tetapi cek kebijakan terbaru Supabase dan Vercel: batas penggunaan, **penjedaan project yang lama tidak aktif**, dan ketersediaan backup bergantung pada paket.

### 11.5 Backup & ketersediaan data

- **Export JSON manual** (FR-EXP) tetap menjadi backup utama yang Anda kendalikan sendiri, lengkap dengan pengingat 30 hari.
- Jangan mengandalkan backup bawaan Supabase sebelum memastikan paket Anda menyediakannya dan Anda pernah mencoba memulihkannya.
- Opsional: jadwalkan `pg_dump` berkala ke penyimpanan pribadi.
- Pemakaian harian membuat project tidak dijeda, tetapi tetap simpan backup terbaru di luar Supabase.
---

## 12. Kebutuhan UI/UX

### 12.1 Target perangkat

- Utama: layar **360–430px** (Android & iPhone).
- Desktop tetap responsif (konten dibatasi lebar maksimum ±480px di tengah) tetapi bukan prioritas.

### 12.2 Gaya visual

**Minimal Personal Finance SaaS** — bersih, modern, sederhana, kartu membulat, angka besar, tipografi jelas, warna minim, spasi lega. Jangan terlalu banyak kartu.

### 12.3 Pedoman desain

| Elemen | Pedoman |
|---|---|
| Warna semantik | Income = hijau, Expense = merah/rose. Jangan hanya mengandalkan warna: sertakan tanda `+` / `−` dan ikon. |
| Angka | Font tabular (`tabular-nums`) agar rata dan mudah dibandingkan |
| Target sentuh | Minimal 44×44px |
| Jangkauan jempol | Aksi utama di bagian bawah layar |
| Form | Bottom sheet, bukan halaman penuh, untuk quick add |
| Umpan balik | Toast/snackbar singkat; loading skeleton, bukan spinner penuh layar |
| Aksesibilitas | Label pada tombol ikon, kontras AA, mendukung ukuran font besar |
| Haptic/animasi | Animasi singkat (≤200ms), hormati `prefers-reduced-motion` |
| Bahasa | Konsisten Bahasa Indonesia, nada ramah dan singkat |

### 12.4 Onboarding (pertama kali pakai)

```text
Selamat datang
   ↓
Buat akun pertama (nama, tipe, saldo awal)
   ↓
(Opsional) Tambah akun lain
   ↓
Kategori default sudah siap — bisa disesuaikan nanti
   ↓
(Opsional) Atur budget bulan ini  [Lewati]
   ↓
Dashboard
```

Target: setup awal selesai dalam **kurang dari 2 menit**, dan semua langkah selain "buat akun pertama" bisa dilewati.

### 12.5 Alur harian

```text
Buka app → lihat saldo → ketuk + → nominal → kategori → Simpan → Dashboard terbarui
```

### 12.6 Alur bulanan

```text
Awal bulan: Salin/atur budget
   ↓
Sepanjang bulan: catat transaksi, pantau budget
   ↓
Akhir bulan: lihat Statistik, tinjau pengeluaran
   ↓
Backup data → atur budget bulan berikutnya
```

---

## 13. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|---|---|
| **Performa** | Dashboard terbuka < 1 detik pada koneksi normal; query memakai index dan agregasi di database; riwayat dipaginasi; chart tidak memuat dataset besar; Recharts di-lazy-load. |
| **Keandalan** | Tidak boleh ada saldo salah atau budget salah hitung. Operasi multi-langkah memakai transaksi database. |
| **Integritas data** | Foreign key `Restrict`; validasi server untuk semua input; tidak ada penghapusan yang meninggalkan relasi menggantung. |
| **Keamanan** | Validasi input server (Zod); hanya Prisma (hindari raw SQL); tidak ada secret di source code (gunakan `.env.local` dan Environment Variables di Vercel; `.env*` masuk `.gitignore`); tidak menyimpan data finansial di `localStorage`; header keamanan dasar; autentikasi wajib karena aplikasi online; RLS aktif di semua tabel Supabase. |
| **Privasi** | Tanpa analytics pihak ketiga, tanpa tracker, tanpa font/CDN eksternal yang membocorkan data; semua data hanya ada di project Supabase milik pengguna. |
| **Kompatibilitas** | Chrome & Safari mobile versi 2 tahun terakhir; layar 360px ke atas. |
| **Aksesibilitas** | Kontras AA, label ARIA pada kontrol ikon, navigasi keyboard di desktop. |
| **Offline** | MVP: app shell ter-cache dan ada layar offline. Pencatatan offline dengan antrean sinkronisasi **bukan** bagian MVP. |
| **Pemeliharaan** | TypeScript strict, ESLint + Prettier, logika hitung dipisah di `lib/calc.ts` dan diuji. |
| **Backup** | Backup eksplisit oleh pengguna; pengingat setiap 30 hari. |

---

## 14. Validasi, Error Handling & Empty State

### 14.1 Pesan validasi

| Kondisi | Pesan |
|---|---|
| Nominal kosong / 0 / negatif | "Nominal harus lebih besar dari Rp0." |
| Nominal terlalu besar | "Nominal terlalu besar. Periksa kembali angkanya." |
| Kategori belum dipilih | "Pilih kategori terlebih dahulu." |
| Akun belum dipilih | "Pilih sumber uang." |
| Nama akun/kategori duplikat | "Nama sudah dipakai." |
| Saldo akan negatif | "Saldo BCA akan menjadi negatif. Lanjutkan?" |
| Budget ≤ 0 | "Budget harus lebih besar dari Rp0." |
| File import tidak valid | "File backup tidak valid atau rusak." |
| File import versi tidak cocok | "Versi backup tidak didukung oleh aplikasi ini." |
| Gagal menyimpan (server) | "Gagal menyimpan. Coba lagi." (data form tidak hilang) |

### 14.2 Konfirmasi tindakan berisiko

| Aksi | Dialog |
|---|---|
| Hapus transaksi | "Hapus transaksi Rp50.000?" → `Batal` · `Hapus` |
| Arsipkan akun | "Akun tidak akan muncul di pilihan baru. Riwayat tetap tersimpan." |
| Hapus kategori terpakai | "12 transaksi memakai kategori ini. Pindahkan ke kategori lain?" |
| Import data | "Data saat ini akan **ditimpa**. Backup otomatis akan dibuat dulu." |
| Ubah saldo awal | "Mengubah saldo awal akan mengubah seluruh saldo historis akun ini." |

### 14.3 Empty state

| Halaman | Teks | Aksi |
|---|---|---|
| Transaksi kosong | "Belum ada transaksi. Mulai catat uangmu hari ini." | `+ Tambah Transaksi` |
| Budget kosong | "Kamu belum membuat budget. Tentukan budget bulanan untuk mulai memantau." | `Buat Budget` · `Salin dari bulan lalu` |
| Statistik kosong | "Belum ada data untuk periode ini." | `+ Tambah Transaksi` |
| Hasil pencarian kosong | "Tidak ada transaksi yang cocok." | `Hapus filter` |
| Belum ada akun | "Tambahkan akun pertamamu (mis. Cash atau BCA)." | `Tambah Akun` |

---

## 15. Edge Case yang Harus Ditangani

| # | Kasus | Perilaku yang diharapkan |
|---|---|---|
| 1 | Transaksi dicatat pukul 23:50 WIB di akhir bulan | Masuk bulan tersebut (bukan bulan berikutnya karena konversi UTC) |
| 2 | Transaksi diinput dengan tanggal mundur ke bulan lalu | Budget & statistik bulan tersebut ikut berubah, bulan berjalan tidak |
| 3 | Edit transaksi dari Income menjadi Expense | Kategori harus dipilih ulang karena tipe kategori berbeda |
| 4 | Arsipkan akun dengan saldo ≠ 0 | Peringatan: saldo akun tidak lagi dihitung di Total Saldo |
| 5 | Dua kali ketuk tombol Simpan | Hanya satu transaksi tercipta (nonaktifkan tombol saat proses, atau idempotency key) |
| 6 | Budget dibuat untuk kategori yang kemudian diarsipkan | Budget tetap tampil di bulan tersebut; tidak bisa dibuat budget baru untuk kategori arsip |
| 7 | Bulan tanpa income | Saving rate ditampilkan "–", bukan error pembagian nol |
| 8 | Bulan lalu tanpa transaksi | Insight perbandingan tidak ditampilkan |
| 9 | Expense melebihi budget | Persentase > 100% tetap ditampilkan (mis. 125%), bar penuh dengan warna merah |
| 10 | Nominal sangat besar / salah ketik | Ditolak oleh batas wajar; peringatan |
| 11 | File import berisi transaksi yang merujuk akun tak ada | Import ditolak seluruhnya dengan penjelasan |
| 12 | Import gagal di tengah proses | Rollback; data lama utuh |
| 13 | Saldo awal akun diubah | Seluruh saldo akun berubah; peringatan ditampilkan |
| 14 | Dua tab/perangkat membuka app bersamaan | Data selalu dimuat ulang dari server; tidak ada cache lokal yang usang |
| 15 | Layar kecil (360px) dengan nominal sangat panjang (miliaran) | Angka tidak terpotong; font mengecil otomatis atau format ringkas |
| 16 | Mengubah zona waktu perangkat | Perhitungan bulan tetap WIB (berdasarkan setting server/app, bukan perangkat) |

---

## 16. Strategi Pengujian

Karena angka keuangan harus selalu benar, **logika perhitungan wajib punya unit test**.

### 16.1 Unit test (wajib)

| Area | Contoh kasus |
|---|---|
| Saldo akun | Initial + income − expense; edit dan hapus transaksi memperbarui saldo |
| Ringkasan bulan | Batas awal & akhir bulan WIB; saving positif dan negatif |
| Budget | Persentase tepat di 69%, 70%, 89%, 90%, 100%, 101%; kategori tanpa budget |
| Saving & rate | Income 0; saving negatif |
| Insight | Setiap aturan INS-01 s.d. INS-08, prioritas & batas 3 item |
| Format uang | `1000000` → `Rp1.000.000`; parse input "1.500.000" → `1500000` |
| Validasi | Skema Zod untuk tiap tipe transaksi (lihat tabel 10.4) |

### 16.2 Integration test

- Buat → edit → hapus transaksi, lalu cek saldo di tiap langkah.
- Arsip akun/kategori dan pengaruhnya pada form & riwayat.
- Export lalu import menghasilkan data identik (round-trip).
- Import file rusak/tidak kompatibel ditolak tanpa mengubah data.

### 16.3 Uji manual di perangkat

- Install PWA di Android dan iPhone, buka dalam mode standalone.
- Uji kecepatan quick add (stopwatch): target < 10 detik.
- Uji layar 360px, 390px, 430px; light & dark mode.
- Uji dengan keyboard virtual terbuka (form tidak tertutup).

### 16.4 Skenario regresi saldo (checklist cepat)

1. Akun A (saldo awal 1.000.000), Akun B (saldo awal 500.000).
2. Expense 100.000 dari A → A = 900.000, total = 1.400.000.
3. Income 500.000 ke A → A = 1.400.000, total = 1.900.000.
4. Expense 50.000 dari B → B = 450.000, total = 1.850.000.
5. Hapus expense langkah 2 → A = 1.500.000, total = 1.950.000.
6. Income bulan ini = 500.000, expense bulan ini = 50.000.

---

## 17. Roadmap Pengembangan

Estimasi untuk satu developer paruh waktu; sesuaikan dengan ketersediaan waktu.

| Fase | Isi | Estimasi |
|---|---|---|
| **1. Setup** | Init Next.js + TS + Tailwind, Prisma + Supabase (PostgreSQL), login pemilik (Supabase Auth) + RLS, seed kategori, util `money`/`date`/`calc` + unit test, struktur folder, layout & bottom nav | 2–3 hari |
| **2. Core** | Akun, Kategori, Transaksi (CRUD + validasi), Quick Add (bottom sheet), Riwayat + filter + pencarian, Dashboard dasar, Onboarding | 5–7 hari |
| **3. Budget** | CRUD budget, navigasi bulan, status & warna, salin dari bulan lalu, budget di dashboard | 3 hari |
| **4. Statistik** | Ringkasan bulanan, donut & bar chart, detail kategori, insight berbasis aturan | 3–4 hari |
| **5. Data** | Export JSON/CSV, Import dengan preview & validasi, auto-backup sebelum import, pengingat backup | 2–3 hari |
| **6. Polish** | Dark mode, PWA (manifest, ikon, service worker, layar offline), empty state, error handling, safe-area, optimasi performa | 3–5 hari |
| **7. Rilis pribadi** | Deploy ke Vercel (env, region, migrasi), cek RLS, uji backup & restore, uji di HP, perbaikan akhir | 1–2 hari |

**Total perkiraan:** ±3–4 minggu paruh waktu.

### Urutan prioritas jika waktu terbatas

1. Transaksi + Akun + Kategori + Dashboard (aplikasi sudah berguna).
2. Budget.
3. Export/Import (agar data aman).
4. Statistik & insight.
5. PWA, dark mode, dan polish.

---

## 18. Definition of Done

MVP dianggap selesai bila seluruh poin berikut terpenuhi:

**Fungsional**
- [ ] Pengguna dapat menambah, mengedit, dan mengarsipkan akun.
- [ ] Pengguna dapat menambah, mengedit, dan mengarsipkan kategori.
- [ ] Pengguna dapat mencatat income dan expense.
- [ ] Saldo akun dan total saldo diperbarui otomatis dan **benar** sesuai aturan 8.2.
- [ ] Pengguna dapat melihat, memfilter, dan mencari riwayat transaksi.
- [ ] Pengguna dapat mengedit dan menghapus transaksi.
- [ ] Pengguna dapat membuat budget bulanan per kategori dan menyalinnya dari bulan lalu.
- [ ] Budget usage dan status dihitung otomatis dengan batas yang benar.
- [ ] Dashboard menjawab tiga pertanyaan kunci tanpa pindah halaman.
- [ ] Statistik menampilkan pengeluaran per kategori dan tren 6 bulan.
- [ ] Insight berbasis aturan bekerja dan tidak menampilkan lebih dari 3 di dashboard.
- [ ] Data dapat di-export (JSON & CSV) dan di-import dengan preview & konfirmasi.
- [ ] Round-trip export → import menghasilkan data identik.

**Non-fungsional**
- [ ] Dark mode (Light/Dark/System) bekerja tanpa flash.
- [ ] PWA dapat di-install di Android dan iPhone dan terbuka standalone.
- [ ] Tampilan nyaman di layar 360–430px.
- [ ] Quick add dapat diselesaikan < 10 detik (diuji manual).
- [ ] Unit test untuk seluruh logika hitung lulus.
- [ ] Tidak ada data hilang setelah refresh atau restart server.
- [ ] Login wajib aktif, pendaftaran publik dinonaktifkan, dan RLS aktif di semua tabel Supabase.
- [ ] Connection string database tidak ber-awalan `NEXT_PUBLIC_` dan tidak ada secret di repo.
- [ ] Backup pertama sudah dilakukan dan diuji pulih.

---

## 19. Metrik Keberhasilan

Karena aplikasi dipakai pribadi, metrik dibuat sederhana.

### 19.1 Kegunaan

| Metrik | Target |
|---|---|
| Waktu mencatat transaksi | < 10 detik |
| Langkah mencatat transaksi (default dipakai) | ≤ 4 ketukan |
| Waktu setup awal | < 2 menit |

### 19.2 Visibilitas

Pengguna dapat menjawab hanya dari dashboard:
1. Berapa uang saya sekarang?
2. Berapa yang sudah saya keluarkan bulan ini?
3. Apakah pengeluaran saya masih sesuai budget?

### 19.3 Keandalan (tidak boleh terjadi)

- Saldo salah.
- Budget salah menghitung transaksi.
- Data transaksi hilang setelah refresh.
- Transaksi masuk ke bulan yang salah karena zona waktu.

### 19.4 Kebiasaan (indikator pemakaian nyata)

- Aplikasi dibuka dan transaksi dicatat setiap hari selama 30 hari berturut-turut.
- Jumlah hari dalam sebulan yang memiliki minimal satu transaksi ≥ 80%.
- Budget disusun di awal bulan, bukan di tengah/akhir.

---

## 20. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Lupa mencatat transaksi karena terlalu repot | Data tidak lengkap, app ditinggalkan | Quick add < 10 detik, default cerdas, PWA di home screen |
| Data hilang (project Supabase terhapus/rusak atau tanpa backup) | Kehilangan seluruh riwayat | Export JSON berkala + pengingat, cek kebijakan backup Supabase, uji pulih |
| Koneksi database habis di lingkungan serverless | Error acak saat banyak request | Pakai connection pooler Supabase untuk `DATABASE_URL` |
| Saldo tidak cocok dengan saldo asli | Kehilangan kepercayaan | Fitur rekonsiliasi saldo, aturan hitung terpusat dan teruji |
| Kebocoran data bila diakses online | Data finansial terekspos | Login wajib, RLS aktif, secret hanya di env server, rate limit, cookie aman |
| Project Supabase gratis dijeda karena lama tidak aktif | Aplikasi tidak bisa dibuka sementara | Pemakaian rutin, ingat langkah pemulihan, simpan backup terbaru |
| Scope creep (menambah fitur terus) | MVP tidak selesai | Patuhi daftar Out of Scope; fitur baru masuk backlog |
| Zona waktu salah | Transaksi masuk bulan keliru | Util WIB terpusat + unit test batas bulan |
| Bug saat import menimpa data | Data rusak | Validasi ketat, backup otomatis, import atomik |
| PWA iOS terbatas (notifikasi, storage) | Fitur tertentu tidak jalan | Tidak bergantung pada notifikasi push; pengingat dalam app |

---

## 21. Pertanyaan Terbuka & Keputusan yang Perlu Dikonfirmasi

Berikut asumsi default yang dipakai dokumen ini. Silakan ubah bila tidak sesuai.

| # | Pertanyaan | Asumsi default di PRD ini |
|---|---|---|
| 1 | Di mana aplikasi akan dijalankan? | Vercel (aplikasi) + Supabase (database) |
| 2 | Apakah perlu login? | Ya, wajib karena online; Supabase Auth dengan satu akun pemilik |
| 3 | Apakah periode bulan dimulai tanggal 1? | Ya (opsi tanggal mulai bulan ditunda) |
| 4 | Apakah saldo akun boleh negatif? | Boleh, dengan peringatan |
| 5 | Apakah budget total dihitung dari jumlah budget kategori? | Ya (tidak ada budget total terpisah) |
| 6 | Bagaimana mencatat perpindahan uang antar-akun (tarik tunai, top up e-wallet)? | Tidak ada fitur transfer. Biaya admin dicatat sebagai Expense; bila saldo akun tidak cocok, gunakan rekonsiliasi saldo |
| 7 | Apakah perlu lampiran foto struk? | Tidak di MVP |
| 8 | Bahasa UI | Bahasa Indonesia saja |
| 9 | Apakah sisa budget dibawa ke bulan berikutnya (rollover)? | Tidak di MVP |
| 10 | Library UI | Tailwind + komponen sendiri (shadcn/ui boleh dipakai) |
| 11 | Paket Supabase dan Vercel yang dipakai? | Gratis dulu; cek kebijakan backup dan penjedaan project sebelum mulai |

---

## 22. Fitur Masa Depan

Setelah MVP stabil dan benar-benar dipakai:

### V1.1 — Otomatisasi ringan
- Transaksi berulang (gaji, langganan, cicilan, tagihan bulanan).
- Pengingat tagihan.
- Template transaksi favorit ("Kopi pagi", "Bensin").
- Tanggal mulai bulan kustom (gajian tanggal 25).
- Dashboard dapat disesuaikan.

### V1.2 — Offline & keamanan lanjutan
- Mode offline dengan antrean sinkronisasi (database sudah di cloud sejak MVP).
- Verifikasi dua langkah (MFA) untuk login.

### V1.3 — Asisten cerdas
- Input transaksi bahasa natural.

  > "Tadi makan di warung 25 ribu."

  Menghasilkan otomatis:

  ```text
  Expense · Food · Rp25.000 · Hari ini
  ```

- Ringkasan bulanan yang ditulis otomatis.

### Ide lain (belum dijadwalkan)
- Tujuan tabungan (savings goals).
- Pencatatan hutang/piutang.
- Lampiran foto struk.
- Widget layar utama / pintasan (shortcut) ke Quick Add.
- Rollover sisa budget.

> Semua fitur di atas **bukan bagian MVP**.

---

## 23. Definisi Akhir Produk

> **Aplikasi personal money management berbasis Next.js yang memungkinkan pengguna mencatat pemasukan dan pengeluaran, mengelola saldo dan budget, serta melihat statistik keuangan melalui antarmuka mobile-first yang sederhana, cepat, dan privat.**

**Core stack**

```text
Next.js · TypeScript · Tailwind CSS · Prisma · PostgreSQL (Supabase) · Vercel · Recharts · Zod · PWA
```

**Core modules**

```text
Dashboard · Transactions · Accounts · Categories · Budget · Statistics · Insights · Data Backup
```

**Core philosophy**

```text
Simple · Fast · Private · Mobile-first · Personal · Free · Trustworthy
```

> **Target akhirnya bukan membuat aplikasi finansial paling lengkap, tetapi membuat aplikasi yang benar-benar nyaman kamu buka setiap kali mengeluarkan uang.**

---

## 24. Lampiran

### A. Glosarium

| Istilah | Arti |
|---|---|
| Account | Tempat uang disimpan (Cash, rekening bank, e-wallet) |
| Transaction | Catatan pergerakan uang: income atau expense |
| Budget | Batas pengeluaran per kategori dalam satu bulan |
| Saving | Selisih income dan expense pada suatu periode |
| Saving Rate | Persentase saving terhadap income |
| Arsip | Menyembunyikan akun/kategori dari pilihan baru tanpa menghapus riwayat |
| PWA | Web app yang dapat di-install di layar utama HP |
| WIB | Waktu Indonesia Barat (UTC+7) |
| Rekonsiliasi | Mencocokkan saldo di aplikasi dengan saldo sebenarnya |

### B. Format CSV transaksi

```csv
tanggal,tipe,kategori,akun,nominal,catatan
2026-10-05,EXPENSE,Food,Cash,35000,Makan siang
2026-10-05,EXPENSE,Transportation,BCA,25000,Grab
2026-10-04,INCOME,Freelance,BCA,500000,Proyek website
```

### C. Checklist tampilan per layar (QA visual)

- [ ] Tidak ada scroll horizontal di 360px.
- [ ] Tombol `+` tidak tertutup bottom bar/keyboard.
- [ ] Angka besar tidak terpotong.
- [ ] Warna status budget terbaca di light & dark.
- [ ] Safe-area terpenuhi di iPhone bernotch.
- [ ] Empty state tampil untuk setiap halaman utama.

### D. Riwayat versi dokumen

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | – | Draf awal PRD |
| 1.1 | 5 Oktober 2026 | Penyempurnaan: aturan bisnis, skema Prisma, edge case, pengujian, deployment, keamanan, roadmap berestimasi, pertanyaan terbuka; fitur transfer dihapus; stack disesuaikan ke PostgreSQL (Supabase) + Vercel |
