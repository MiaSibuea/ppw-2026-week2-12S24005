# PPW Week 2 — HTML5, CSS3, & Perancangan Antarmuka Web Modern

## Deskripsi

Repository ini berisi tugas praktikum Pemrograman dan Pengujian Aplikasi Web (PPW) Minggu 02.

Proyek ini merupakan **Single Page Showcase Webpage** yang dibuat menggunakan HTML5 dan CSS3. Halaman web menyajikan identitas akademik, informasi profil, daftar keahlian, riwayat mata kuliah atau proyek, serta formulir layanan/kontak yang interaktif.

Website dirancang dengan memperhatikan struktur HTML5 yang semantik, tampilan modern dan responsif, serta aspek aksesibilitas.

## Identitas Mahasiswa

| Data           | Keterangan                             |
| -------------- | -------------------------------------- |
| Nama           | Mia Nathania Sibuea                    |
| NIM            | 12S24005                               |
| Program Studi  | S1 Sistem Informasi                    |
| Institusi      | Institut Teknologi Del                 |
| Mata Kuliah    | Pemrograman dan Pengujian Aplikasi Web |
| Praktikum      | Minggu 02                              |
| Dosen Pengampu | Chandro Pardede, S.Kom., M.Sc.         |

## Tujuan

Pembuatan proyek ini bertujuan untuk:

* Menerapkan struktur dokumen menggunakan elemen semantik HTML5.
* Menyajikan informasi menggunakan HTML Table dan HTML Lists.
* Membuat formulir interaktif dengan berbagai jenis input.
* Menerapkan validasi native HTML5 pada formulir.
* Menerapkan prinsip dasar aksesibilitas pada halaman web.
* Menggunakan CSS eksternal untuk mengatur tampilan halaman.
* Menerapkan CSS Flexbox atau CSS Grid untuk tata letak.
* Membuat tampilan yang responsif pada berbagai ukuran layar.
* Mengelola source code menggunakan Git dan GitHub.
* Melakukan deployment website menggunakan GitHub Pages.

## Fitur

Website ini memiliki beberapa fitur utama:

* **Profil Mahasiswa** — Menampilkan informasi akademik dan profil diri.
* **Keahlian** — Menampilkan daftar kemampuan yang dimiliki.
* **Portofolio / Riwayat Proyek** — Menampilkan data mata kuliah atau proyek dalam bentuk tabel.
* **HTML Lists** — Menggunakan unordered list dan ordered list untuk menyusun informasi.
* **Formulir Kontak / Layanan** — Menyediakan formulir interaktif untuk mengirimkan permintaan.
* **Validasi Form** — Menggunakan validasi bawaan HTML5.
* **Responsive Design** — Tampilan menyesuaikan ukuran layar desktop maupun mobile.
* **Interactive Elements** — Menggunakan hover state dan transition pada beberapa elemen.
* **Accessible Interface** — Menggunakan label eksplisit dan struktur HTML yang terorganisasi.

## Teknologi yang Digunakan

* HTML5
* CSS3
* CSS Flexbox / CSS Grid
* Git
* GitHub
* GitHub Pages

## Struktur Repository

```text
ppw-2026-week2-12S24005/
│
├── index.html
├── style.css
├── README.md
│
└── assets/
    └── screenshot.png
```

> Struktur folder dapat disesuaikan dengan file yang digunakan dalam proyek.

## Konsep HTML5 yang Diterapkan

Website menggunakan elemen HTML5 semantik untuk membangun struktur halaman, seperti:

* `<header>` untuk bagian kepala halaman.
* `<nav>` untuk navigasi.
* `<main>` untuk konten utama.
* `<section>` untuk mengelompokkan konten berdasarkan topik.
* `<article>` untuk konten yang bersifat mandiri.
* `<aside>` untuk informasi pelengkap.
* `<footer>` untuk bagian penutup halaman.

Penggunaan elemen semantik bertujuan agar struktur dokumen lebih jelas, terorganisasi, dan mendukung aksesibilitas.

## Table & Lists

Proyek ini menerapkan tabel semantik untuk menyajikan data secara terstruktur.

Tabel menggunakan elemen:

* `<table>`
* `<caption>`
* `<thead>`
* `<tbody>`
* `<tfoot>`
* `scope="col"` / `scope="row"`

Selain tabel, proyek juga menggunakan HTML Lists, yaitu:

* `<ul>` untuk unordered list.
* `<ol>` untuk ordered list.

Ketentuan tersebut merupakan bagian dari spesifikasi tugas mandiri Week 2.

## Formulir Interaktif

Formulir pada website menggunakan beberapa jenis kontrol input HTML5, antara lain:

* Text
* Email
* Telephone
* Number
* Radio
* Checkbox
* Select
* Textarea

Formulir juga menggunakan `<fieldset>` dan `<legend>` untuk mengelompokkan input serta `<label>` untuk menghubungkan label dengan masing-masing kontrol input.

Validasi dilakukan menggunakan atribut validasi native HTML5 seperti `required`.

## Desain & Styling

CSS digunakan untuk membuat tampilan website lebih modern, rapi, dan responsif.

Beberapa konsep CSS yang diterapkan meliputi:

* External CSS
* Universal Box Sizing Reset
* Typography
* Color Palette
* Border Radius
* Box Shadow
* Hover State
* CSS Transition
* Flexbox / Grid
* Media Queries

Proyek juga menerapkan konsep aturan warna **60-30-10**, penggunaan sudut membulat, serta bayangan yang halus untuk mendukung tampilan antarmuka modern.

## Responsive Design

Website dirancang agar dapat digunakan pada berbagai ukuran layar.

Media Query digunakan untuk menyesuaikan tampilan ketika halaman dibuka pada perangkat dengan ukuran layar yang lebih kecil, termasuk perangkat mobile.

Contoh breakpoint yang digunakan:

```css
@media (max-width: 768px) {
    /* Responsive styling */
}
```

## Screenshot

### Tampilan Website

![Screenshot Website](assets/screenshot.png)

> Letakkan screenshot website di dalam folder `assets` dengan nama `screenshot.png`.

## Live Demo

🌐 **GitHub Pages:**
[Masukkan URL GitHub Pages di sini]

## Repository

💻 **GitHub Repository:**
[Masukkan URL Repository GitHub di sini]

## Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone https://github.com/[username]/ppw-2026-week2-12S24005.git
```

### 2. Masuk ke Folder Project

```bash
cd ppw-2026-week2-12S24005
```

### 3. Jalankan Website

Buka file `index.html` menggunakan browser.

Jika menggunakan Visual Studio Code, website juga dapat dijalankan menggunakan ekstensi **Live Server**.

## Deployment

Website dipublikasikan menggunakan **GitHub Pages**.

Repository menggunakan branch:

```text
main
```

GitHub Pages kemudian digunakan untuk menghasilkan versi live dari website yang dapat diakses melalui browser.

## Git Commit

Beberapa proses Git yang digunakan dalam pengembangan project:

```bash
git add .
git commit -m "feat: complete week 2 html5 and modern css assignment"
git push -u origin main
```

## Kesimpulan

Melalui praktikum Week 2 ini, proyek menerapkan dasar pengembangan antarmuka web menggunakan HTML5 dan CSS3. Implementasi mencakup struktur HTML semantik, penyajian data menggunakan tabel dan lists, formulir interaktif, desain CSS modern, responsive design, serta pengelolaan dan publikasi project menggunakan GitHub dan GitHub Pages.

## Lisensi

Proyek ini dibuat untuk keperluan akademik pada mata kuliah **Pemrograman dan Pengujian Aplikasi Web (12S3101)** di Institut Teknologi Del.
