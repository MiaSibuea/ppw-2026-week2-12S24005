# Tugas Praktikum Minggu 04: Decoupled Multi-Tier Architecture & Dynamic Client-Side Rendering (CSR)

Repositori ini merupakan implementasi dan transformasi arsitektur web dari tugas Minggu 03 pada mata kuliah **Pemrograman dan Pengujian Web (12S3101)** di **Institut Teknologi Del**. Pada praktikum Minggu 04 ini, antarmuka portofolio dirombak dari struktur monolitik statis menjadi **Decoupled Multi-Tier Architecture** berbasis **Dynamic Client-Side Rendering (CSR)**, didukung mock RESTful data layer (`/data/*.json`), universal dynamic modal, serta evaluasi profil kinerja jaringan HTTP (RFC 9111).

---

## 👤 Identitas Pengembang
* **Nama Lengkap:** Mia Nathania Sibuea
* **NIM:** 12S24005
* **Program Studi:** S1 Sistem Informasi
* **Fakultas:** Fakultas Informatika dan Teknik Elektro (FITE)
* **Institusi:** Institut Teknologi Del
* **Dosen Pengampu:** Chandro Pardede, S.Kom., M.Sc.
* **Tautan Live Demo:** [https://miasibuea.github.io/ppw-2026-week2-12S24005/](https://miasibuea.github.io/ppw-2026-week2-12S24005/)

---

## 🏛️ 1. Pemodelan Arsitektur Web: Diagram C4 Container Model

Arsitektur aplikasi web kontemporer ini memisahkan tanggung jawab sistem ke dalam lapisan terisolasi (*Separation of Concerns*):

```mermaid
graph TD
    User["Pengguna / Browser Client"]

    subgraph Presentation_Tier ["Presentation Tier (Client Side)"]
        UI["DOM Shell (HTML5 + Bootstrap 5.3)"]
        AppJS["Presentation Controller (js/app.js)"]
        LocalStorage["Client Storage (localStorage / State Persistence)"]
    end

    subgraph Service_Logic_Tier ["Application / Data Access Tier"]
        ApiService["Data Access Layer (js/api-service.js)"]
        MockAPI["Mock RESTful POST Dispatcher"]
    end

    subgraph Data_Storage_Tier ["Data Layer (Decoupled JSON Providers)"]
        ProjectsJSON["data/projects.json (Koleksi Portofolio)"]
        ServicesJSON["data/services.json (Katalog Layanan)"]
        ProfileJSON["data/profile.json (Data Pengembang)"]
    end

    subgraph Edge_Infrastructure ["Static Hosting & Delivery"]
        CDN["GitHub Pages CDN Edge (HTTP Caching RFC 9111)"]
    end

    User -->|Interaksi Pengguna| UI
    UI -->|Event Trigger| AppJS
    AppJS -->|Ambil Data Asinkron| ApiService
    AppJS <-->|Simpan & Muat Riwayat Order| LocalStorage
    ApiService -->|HTTP GET Fetch| ProjectsJSON
    ApiService -->|HTTP GET Fetch| ServicesJSON
    ApiService -->|HTTP GET Fetch| ProfileJSON
    ApiService -->|HTTP POST AJAX Payload| MockAPI
    CDN -.->|Sajikan Aset Statis 304 Not Modified| UI