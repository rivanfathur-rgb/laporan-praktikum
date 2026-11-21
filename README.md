<h1 align="center">Generator Laporan Praktikum</h1>

<p align="center">
  Susun laporan praktikum menjadi dokumen Word (.docx) dengan format otomatis.<br>
  Tulis isinya, unduh hasilnya.
</p>

<p align="center">
  <a href="https://rivanfathur-rgb.github.io/laporan-praktikum/"><b>Coba langsung</b></a>
  &nbsp;·&nbsp;
  <a href="docs/contoh-hasil.pdf">Contoh hasil (PDF)</a>
  &nbsp;·&nbsp;
  <a href="docs/contoh-hasil.docx">Contoh hasil (Word)</a>
</p>

<p align="center">
  <img src="docs/hasil-word.png" alt="Sampul dan halaman pendahuluan hasil generate" width="85%">
</p>

> [!NOTE]
> Format dokumen ini mengikuti aturan **satu mata kuliah tertentu** yang dipakai penulis, dan mungkin tidak sesuai dengan standar penulisan laporan praktikum secara umum. Jika dipakai untuk mata kuliah lain, periksa dulu aturan penulisan yang berlaku di sana.

## Mengapa dibuat

Mengatur format laporan praktikum di Word (penomoran bab, subjudul, indentasi, spasi, rumus) memakan waktu dan membuat hasil tiap orang berbeda-beda. Generator ini memisahkan isi dari format: pengguna hanya menulis isinya, sedangkan format mengikuti satu contoh laporan yang sama.

## Tampilan aplikasi

<p align="center">
  <img src="docs/tampilan-atas.png" alt="Bagian atas halaman dan panduan penulisan" width="49%">
  <img src="docs/tampilan-isi.png" alt="Kolom isi dengan penghitung kata" width="49%">
</p>

## Fitur

- **Sampul otomatis** dengan logo opsional
- **Format otomatis:** Times New Roman 12 pt, spasi 1,15, margin kiri 4 cm dan lainnya 3 cm, penomoran bab dan subjudul bertingkat
- **Penulisan sederhana:** subjudul, butir, huruf miring dan tebal, rumus LaTeX, dan keterangan gambar
- **Nyaman dipakai:** draf tersimpan otomatis di perangkat, ada indikator draf dan penghitung kata
- **Privat:** semua diproses di browser dan tidak dikirim ke server

## Bagian yang dihasilkan

| Bab | Isi | Dibuat generator |
|---|---|---|
| Sampul | Judul, mata kuliah, dosen, penyusun, institusi | Ya |
| I | Pendahuluan (latar belakang, tujuan, dasar teori) | Ya |
| II | Alat dan bahan | Ya |
| III | Prosedur percobaan | Ya |
| IV | Hasil percobaan dan analisis | Tidak, ditulis tangan |
| V | Penutup (kesimpulan) | Ya |
| VI | Daftar pustaka | Ya |

Pada mata kuliah yang menjadi acuan, data hasil percobaan dan analisisnya ditulis tangan. Karena itu penomoran bab di dokumen hasil melompat dari III ke V, dan generator tidak membuat tabel data.

## Cara pakai

1. Buka halaman generator.
2. Isi bagian Sampul, lalu isi tiap bagian laporan.
3. Klik **Buat Laporan (.docx)**.
4. Buka file hasilnya di Word dan periksa. Gambar (misalnya gambar rangkaian pada prosedur) disisipkan manual di Word.

### Aturan penulisan

Satu baris adalah satu paragraf atau satu butir, jadi baris kosong tidak diperlukan.

| Tulisan | Hasil di dokumen |
|---|---|
| `## Judul` | Subjudul a., b., c. |
| `### Judul` | Subjudul 1), 2), 3) |
| `- teks` | Butir dengan tanda titik |
| `1) teks` atau `1. teks` | Butir bernomor |
| `*teks*` | *Huruf miring* |
| `**teks**` | **Huruf tebal** |
| `$I_{1}=\frac{V_{1}}{R_{1}}$` | Rumus; jika sebaris sendiri, tampil di tengah |
| `Gambar 4.2. Keterangan` | Keterangan di tengah dan miring (juga untuk awalan `Tabel`) |

Butir pada Tujuan dan Alat dan bahan otomatis diberi huruf (a, b, c), dan butir pada Kesimpulan diberi angka (1, 2, 3).

## Menjalankan di komputer sendiri

Tidak perlu instalasi. Unduh repo ini, lalu buka `index.html` di browser.

## Catatan dan batasan

- Warna teks isi (biru), ukuran huruf, spasi, dan margin mengikuti contoh laporan dari mata kuliah tersebut. Pengaturannya ada di bagian konfigurasi pada `app.js`.
- Rumus dibuat sebagai rumus inline, jadi pecahan tampil lebih kecil daripada rumus mode display di Word.
- Logo tidak ikut tersimpan di draf, jadi perlu dipilih ulang setelah halaman dimuat ulang.

## Rencana pengembangan

- Simpan dan muat draf sebagai file
- Pratinjau sebelum mengunduh
- Pemeriksaan otomatis, misalnya kutipan yang tidak ada di daftar pustaka
- Preset institusi

## Teknologi dan struktur

HTML, CSS, JavaScript, dan pustaka [docx](https://github.com/dolanmiu/docx) (MIT) untuk membuat file Word.

- `index.html`: tampilan dan alur halaman
- `app.js`: logika pembuatan dokumen Word
- `vendor/docx.js`: pustaka docx
- `docs/`: contoh hasil dan gambar untuk README

## Lisensi dan pembuat

MIT. Lihat berkas [LICENSE](LICENSE).

Dibuat oleh Muhammad Rivan Fathurozin ([@rivanfathur-rgb](https://github.com/rivanfathur-rgb)).
