
# GENERATOR LAPORAN PRAKTIKUM

Generator Laporan Praktikum merupakan aplikasi berbasis HTML dan JavaScript yang digunakan untuk menyusun laporan praktikum secara otomatis dalam format Microsoft Word (.docx).

Aplikasi ini menyediakan pengisian identitas, pengaturan isi laporan, pemformatan teks, persamaan matematika, serta penyisipan logo pada halaman sampul.

---

## 1. STRUKTUR FOLDER

Pastikan susunan folder proyek seperti berikut:

```text
LPRKGNRTR/
│
├── index.html
├── app.js
├── README.md
│
└── vendor/
    └── docx.js
```

Keterangan:

- `index.html` : Halaman utama aplikasi dan formulir pengisian laporan.
- `app.js` : Mengatur proses pembuatan dan pemformatan dokumen Word.
- `README.md` : Dokumentasi dan panduan penggunaan aplikasi.
- `vendor/docx.js` : Library yang digunakan untuk menghasilkan dokumen DOCX.

Jangan memindahkan file atau folder tersebut tanpa menyesuaikan alamat pemanggilannya pada kode HTML.

---

## 2. CARA MENJALANKAN APLIKASI

1. Buka folder `LPRKGNRTR`.
2. Klik dua kali file `index.html`.
3. Aplikasi akan terbuka melalui browser.
4. Isi seluruh kolom sesuai kebutuhan laporan praktikum.
5. Unggah logo institusi jika diperlukan.
6. Klik tombol **Buat Laporan (.docx)**.
7. Tunggu proses pembuatan dokumen selesai.
8. File `Laporan_Praktikum.docx` akan diunduh secara otomatis.

Dokumen yang dihasilkan dapat dibuka menggunakan Microsoft Word atau aplikasi pengolah dokumen yang mendukung format DOCX.

---

## 3. PENGISIAN HALAMAN SAMPUL

Bagian sampul digunakan untuk memasukkan identitas laporan praktikum.

| Kolom | Keterangan |
|---|---|
| Nomor modul | Nomor modul praktikum |
| Bulan dan tahun | Waktu pelaksanaan atau penyusunan laporan |
| Judul praktikum | Judul percobaan yang dilakukan |
| Mata kuliah | Nama mata kuliah |
| Dosen pembimbing | Nama dosen pembimbing |
| Nama | Nama mahasiswa |
| NIM | Nomor induk mahasiswa |
| Kelas | Kelas atau kelompok praktikum |
| Logo | Logo institusi dalam format PNG atau JPG |
| Blok institusi | Nama universitas, fakultas, departemen, dan program studi |

### Pengaturan blok institusi

Tuliskan setiap bagian institusi pada baris terpisah.

Contoh:

```text
UNIVERSITAS NEGERI MALANG
FAKULTAS VOKASI
DEPARTEMEN TEKNOLOGI REKAYASA
PROGRAM STUDI D4 TEKNOLOGI REKAYASA SISTEM ELEKTRONIKA
```

### Penggunaan logo

1. Klik kolom unggah logo.
2. Pilih gambar berformat PNG atau JPG.
3. Logo akan disisipkan pada halaman sampul.
4. Pastikan gambar memiliki kualitas yang cukup baik dan tidak terpotong.

Logo tidak tersimpan dalam draft otomatis. Apabila halaman dimuat ulang, logo harus dipilih kembali.

---

## 4. PENGISIAN ISI LAPORAN

Aplikasi menyediakan beberapa kolom untuk menyusun isi laporan.

### A. Latar Belakang

Digunakan untuk menjelaskan alasan, konteks, dan pentingnya praktikum yang dilakukan.

Satu paragraf ditulis pada setiap baris.

### B. Tujuan Praktikum

Digunakan untuk menuliskan tujuan yang ingin dicapai dalam praktikum.

Satu tujuan ditulis pada setiap baris.

Contoh:

```text
Memahami prinsip kerja rangkaian listrik.
Mengetahui hubungan antara tegangan dan arus.
Menganalisis karakteristik komponen listrik.
```

### C. Dasar Teori

Digunakan untuk menjelaskan teori yang mendukung pelaksanaan praktikum.

Subjudul dapat dibuat menggunakan sintaks khusus yang dijelaskan pada bagian pemformatan teks.

### D. Alat dan Bahan

Tuliskan alat dan bahan yang digunakan selama praktikum.

Satu alat atau bahan ditulis pada setiap baris.

### E. Prosedur Percobaan

Digunakan untuk menjelaskan urutan langkah pelaksanaan praktikum.

Gunakan penanda daftar jika diperlukan.

### F. Kesimpulan

Tuliskan kesimpulan berdasarkan hasil praktikum.

Satu kesimpulan ditulis pada setiap baris.

### G. Daftar Pustaka

Tuliskan referensi yang benar-benar digunakan dalam penyusunan laporan.

Satu referensi ditulis pada setiap baris.

Contoh:

```text
[1] Alexander, C. K., dan Sadiku, M. N. O., Fundamentals of Electric Circuits, McGraw-Hill.
[2] Boylestad, R. L., Introductory Circuit Analysis, Pearson.
```

---

## 5. PEMFORMATAN TEKS

Aplikasi mendukung beberapa sintaks untuk mengatur tampilan teks.

| Sintaks | Fungsi |
|---|---|
| `**teks**` | Membuat teks tebal |
| `*teks*` | Membuat teks miring |
| `$rumus$` | Menyisipkan persamaan matematika |
| `## Judul` | Membuat subjudul dengan penomoran a., b., c. |
| `### Judul` | Membuat subbagian dengan penomoran 1), 2), 3). |
| `- teks` | Membuat butir bullet |

### Contoh penggunaan subjudul

Masukkan teks berikut pada kolom Dasar Teori:

```text
## Hukum Ohm
Hukum Ohm menjelaskan hubungan antara tegangan, arus, dan hambatan.

## Hukum Kirchhoff
Hukum Kirchhoff digunakan untuk menganalisis rangkaian listrik.

### Hukum Tegangan Kirchhoff
Jumlah aljabar tegangan pada lintasan tertutup sama dengan nol.

### Hukum Arus Kirchhoff
Jumlah arus yang masuk ke suatu titik sama dengan jumlah arus yang keluar.
```

Hasil penomoran:

```text
a. Hukum Ohm

b. Hukum Kirchhoff

   1) Hukum Tegangan Kirchhoff

   2) Hukum Arus Kirchhoff
```

### Contoh teks tebal dan miring

```text
Hukum Ohm menjelaskan hubungan antara **tegangan**, *arus*, dan hambatan.
```

### Contoh persamaan matematika

```text
$V=I\times R$

$I=\frac{V}{R}$

$R=\frac{V}{I}$
```

Rumus yang ditulis sendirian pada satu baris akan ditempatkan di tengah.

Beberapa perintah matematika yang didukung:

- `\frac` : Pecahan
- `_` : Subskrip
- `^` : Superskrip
- `\alpha` : Alfa
- `\beta` : Beta
- `\theta` : Teta
- `\times` : Perkalian
- `\cdot` : Perkalian titik
- `\pm` : Plus minus
- `\approx` : Hampir sama dengan
- `\neq` : Tidak sama dengan
- `\leq` : Kurang dari atau sama dengan
- `\geq` : Lebih dari atau sama dengan

Catatan: Tidak seluruh fitur LaTeX didukung oleh aplikasi.

### Keterangan gambar dan tabel

Baris yang diawali dengan kata `Gambar` atau `Tabel` akan otomatis dibuat rata tengah dan miring.

Contoh:

```text
Gambar 1. Rangkaian percobaan
Tabel 1. Hasil pengukuran
```

---

## 6. FORMAT DOKUMEN

Pengaturan format dokumen pada aplikasi meliputi:

| Komponen | Pengaturan |
|---|---|
| Jenis font | Times New Roman |
| Ukuran font | 12 pt |
| Spasi baris | 1,5 |
| Margin kiri | 4 cm |
| Margin kanan | 3 cm |
| Margin atas | 3 cm |
| Margin bawah | 3 cm |
| Perataan paragraf | Justify |
| Indentasi baris pertama | 1,27 cm |

### Pengaturan warna teks

Aplikasi menggunakan dua warna utama:

- **Sampul:** Hitam.
- **Isi laporan:** Biru.

Pengaturan warna terdapat pada objek `CFG` di bagian awal file `app.js`.

```javascript
bodyColor: "3F7FA8",
headingColor: "3F7FA8",
coverColor: "000000",
```

Keterangan:

- `bodyColor` mengatur warna teks isi laporan.
- `headingColor` mengatur warna judul bab dan subjudul.
- `coverColor` mengatur warna teks sampul.

Kode warna menggunakan format hexadecimal tanpa tanda `#`.

Jika ingin mengganti warna biru, ubah nilai `bodyColor` dan `headingColor`. Untuk mempertahankan sampul hitam, jangan mengubah nilai `coverColor`.

---

## 7. PENYIMPANAN DRAFT OTOMATIS

Aplikasi memiliki fitur penyimpanan otomatis menggunakan `localStorage` pada browser.

Fitur ini memungkinkan teks yang sudah dimasukkan tetap tersedia ketika halaman dibuka kembali pada browser dan perangkat yang sama.

Ketentuan penyimpanan:

- Teks tersimpan secara otomatis ketika pengguna mengubah kolom.
- Draft tersimpan secara lokal pada browser.
- Draft tidak otomatis tersinkronisasi ke perangkat lain.
- Menghapus data situs atau penyimpanan browser dapat menghapus draft.
- Logo tidak ikut tersimpan dalam draft.

### Tombol Kosongkan

Tombol **Kosongkan** digunakan untuk menghapus seluruh isi kolom.

Sebelum penghapusan dilakukan, aplikasi akan menampilkan konfirmasi.

---

## 8. PEMECAHAN MASALAH

### Tombol Buat Laporan tidak merespons

Periksa beberapa hal berikut:

1. Pastikan file `app.js` berada di folder yang sama dengan `index.html`.
2. Pastikan folder `vendor` tersedia.
3. Pastikan file `vendor/docx.js` tersedia.
4. Muat ulang halaman menggunakan `Ctrl + F5`.
5. Buka Developer Tools menggunakan `F12`.
6. Pilih tab Console dan periksa apakah terdapat pesan error.

### Muncul pesan Library docx.js tidak tersedia

Periksa lokasi file berikut:

```text
vendor/docx.js
```

Pastikan nama folder dan file sesuai dengan pemanggilan script pada `index.html`.

### Muncul pesan Fungsi buildReport tidak ditemukan

Pastikan `app.js` berhasil dimuat dan tidak memiliki kesalahan sintaks JavaScript.

### File DOCX tidak terunduh

Periksa pengaturan unduhan browser dan pastikan browser mengizinkan unduhan file.

---

## 9. PEMERIKSAAN HASIL LAPORAN

Sebelum menggunakan atau mengumpulkan laporan, lakukan pemeriksaan berikut:

- Pastikan identitas mahasiswa sudah benar.
- Pastikan judul praktikum dan nomor modul sesuai.
- Pastikan logo dan identitas institusi benar.
- Periksa urutan bab dan subbab.
- Periksa format rumus matematika.
- Periksa penomoran daftar.
- Periksa gambar, tabel, dan keterangannya.
- Periksa seluruh daftar pustaka.
- Periksa tata letak setiap halaman melalui Microsoft Word.

Hasil DOCX tetap perlu diperiksa karena tata letak dapat mengalami perubahan bergantung pada aplikasi pengolah dokumen yang digunakan.

---

## 10. CATATAN

Generator ini digunakan untuk membantu proses penyusunan dan pemformatan laporan praktikum.

Pengguna tetap bertanggung jawab atas kebenaran isi laporan, hasil pengukuran, perhitungan, analisis, gambar, dan referensi yang digunakan.
