/**
 * app.js
 * Presentation Layer & State Management
 * Mengelola rendering dinamis (CSR), 4 UI States, Universal Modal,
 * Filter Kategori, Decoupled Form REST Dispatching, dan LocalStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  // State aplikasi sisi klien
  state: {
    profile: null,
    projects: [],
    services: [],
    activeCategory: 'all'
  },

  // Inisialisasi utama aplikasi
  async init() {
    this.initCategoryFilters();
    this.initFormHandler();
    this.updateOrderBadge();

    // Muat data profil dan portofolio secara asinkron
    await Promise.all([
      this.loadProfileData(),
      this.loadProjectsData()
    ]);
  },

  // ========================================================
  // 1. KEAMANAN SISI KLIEN: Sanitasi Input Mencegah DOM XSS
  // ========================================================
  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // ========================================================
  // 2. PEMUATAN DATA PROFIL & HERO SECTION
  // ========================================================
  async loadProfileData() {
    try {
      const profile = await ApiService.getProfile();
      this.state.profile = profile;
      this.renderProfile(profile);
    } catch (error) {
      console.error('Gagal memuat profil:', error);
    }
  },

  renderProfile(profile) {
    // Injeksi metrik statistik ke kolom Hero section
    const statsContainer = document.getElementById('heroStatsContainer');
    if (statsContainer && profile.stats) {
      statsContainer.innerHTML = profile.stats.map(s => `
        <div class="col-6">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 text-center metric-card">
            <div class="d-inline-flex p-3 rounded-circle text-primary mb-2 mx-auto" style="background-color: var(--primary-soft, #fce4ec);">
              <i class="bi ${this.escapeHTML(s.icon)} fs-3" style="color: var(--primary-brand, #d81b60);"></i>
            </div>
            <h3 class="fw-bold mb-0 text-dark">${this.escapeHTML(s.value)}</h3>
            <small class="text-muted fw-semibold">${this.escapeHTML(s.label)}</small>
          </div>
        </div>
      `).join('');
    }
  },

  // ========================================================
  // 3. PEMUATAN DATA PORTOFOLIO & MANAJEMEN 4 UI STATES
  // ========================================================
  async loadProjectsData() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    // STATE 1: LOADING STATE (Menampilkan Skeleton Placeholder)
    this.renderLoadingState(container);

    try {
      // Ambil data proyek melalui API Service
      const projects = await ApiService.getProjects();
      this.state.projects = projects;

      // STATE 2: SUCCESS STATE (Render kartu proyek)
      this.renderProjects(this.getFilteredProjects());
    } catch (error) {
      // STATE 4: ERROR STATE (Menampilkan pesan alert kegagalan)
      this.renderErrorState(container, error.message);
    }
  },

  // Filter proyek berdasarkan kategori aktif
  getFilteredProjects() {
    if (this.state.activeCategory === 'all') {
      return this.state.projects;
    }
    return this.state.projects.filter(p => p.category === this.state.activeCategory);
  },

  // UI STATE 1: SKELETON LOADING
  renderLoadingState(container) {
    container.innerHTML = Array(3).fill(0).map(() => `
      <div class="col">
        <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden" aria-hidden="true">
          <div class="placeholder-glow" style="height: 180px; background-color: #e9ecef;"></div>
          <div class="card-body">
            <span class="placeholder col-6 bg-secondary mb-2 rounded-pill"></span>
            <h5 class="placeholder-glow"><span class="placeholder col-8"></span></h5>
            <p class="placeholder-glow">
              <span class="placeholder col-12"></span>
              <span class="placeholder col-9"></span>
            </p>
            <div class="placeholder col-12 btn btn-primary disabled rounded-pill"></div>
          </div>
        </div>
      </div>
    `).join('');
  },

  // UI STATE 2: SUCCESS RENDER (KARTU PORTOFOLIO DINAMIS)
  renderProjects(projects) {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    // STATE 3: EMPTY STATE (Jika hasil filter kosong)
    if (!projects || projects.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="p-4 bg-light rounded-4 border border-dashed">
            <i class="bi bi-folder-x display-4 text-muted mb-3 d-block"></i>
            <h5 class="fw-bold text-dark">Tidak Ada Proyek Ditemukan</h5>
            <p class="text-secondary small mb-3">Tidak ada data portofolio pada kategori yang Anda pilih.</p>
            <button class="btn btn-outline-primary btn-sm rounded-pill px-3" onclick="App.resetFilter()">
              <i class="bi bi-arrow-repeat me-1"></i> Tampilkan Semua Proyek
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Render daftar kartu proyek
    container.innerHTML = projects.map(proj => `
      <div class="col">
        <div class="card h-100 shadow-sm border-0 project-card rounded-4 overflow-hidden">
          <div class="card-img-top bg-${proj.badgeColor || 'primary'}-subtle text-${proj.badgeColor || 'primary'} d-flex align-items-center justify-content-center" style="height: 180px;">
            <i class="bi ${this.escapeHTML(proj.icon || 'bi-folder')} display-4"></i>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="mb-2">
              <span class="badge bg-${proj.badgeColor || 'primary'}-subtle text-${proj.badgeColor || 'primary'} rounded-pill">${this.escapeHTML(proj.category)}</span>
              <span class="badge bg-secondary-subtle text-secondary rounded-pill">${this.escapeHTML(proj.year)}</span>
            </div>
            <h5 class="card-title fw-bold text-dark">${this.escapeHTML(proj.title)}</h5>
            <p class="card-text text-muted small flex-grow-1">${this.escapeHTML(proj.summary)}</p>
            
            <div class="d-flex align-items-center gap-2 text-muted small mb-3">
              <i class="bi bi-graph-up-arrow text-success"></i>
              <span class="text-truncate">${this.escapeHTML(proj.metrics || 'Peningkatan performa')}</span>
            </div>

            <button type="button" class="btn btn-outline-${proj.badgeColor || 'primary'} rounded-pill mt-auto w-100 btn-detail-proyek" data-id="${proj.id}">
              <i class="bi bi-eye me-1"></i> Detail Proyek
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Pasang Event Listener untuk tombol Universal Modal pada setiap kartu
    container.querySelectorAll('.btn-detail-proyek').forEach(btn => {
      btn.addEventListener('click', () => {
        const projectId = btn.getAttribute('data-id');
        this.openUniversalModal(projectId);
      });
    });
  },

  // UI STATE 4: ERROR FALLBACK ALERT
  renderErrorState(container, message) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger d-flex align-items-center rounded-4 shadow-sm p-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill fs-2 me-3 text-danger"></i>
          <div>
            <h5 class="alert-heading fw-bold mb-1">Gagal Memuat Data Portofolio</h5>
            <p class="mb-2 small">Terjadi kesalahan jaringan saat mengambil data dari REST Provider: <code>${this.escapeHTML(message)}</code></p>
            <button class="btn btn-outline-danger btn-sm rounded-pill px-3" onclick="App.loadProjectsData()">
              <i class="bi bi-arrow-clockwise me-1"></i> Coba Muat Ulang
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // ========================================================
  // 4. FILTER KATEGORI INSTAN
  // ========================================================
  initCategoryFilters() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active', 'btn-primary', 'text-white'));
        filterButtons.forEach(b => b.classList.add('btn-outline-secondary'));

        btn.classList.remove('btn-outline-secondary');
        btn.classList.add('active', 'btn-primary', 'text-white');

        this.state.activeCategory = btn.getAttribute('data-filter');
        this.renderProjects(this.getFilteredProjects());
      });
    });
  },

  resetFilter() {
    this.state.activeCategory = 'all';
    const allBtn = document.querySelector('[data-filter="all"]');
    if (allBtn) allBtn.click();
  },

  // ========================================================
  // 5. UNIVERSAL DYNAMIC MODAL (1 Modal untuk Semua Proyek)
  // ========================================================
  openUniversalModal(projectId) {
    const proj = this.state.projects.find(p => p.id === projectId);
    if (!proj) return;

    // Injeksi Judul Modal
    const titleEl = document.getElementById('projectModalTitle');
    if (titleEl) {
      titleEl.textContent = proj.title;
    }

    // Injeksi Body Modal secara dinamis & terhindar dari XSS
    const bodyEl = document.getElementById('projectModalBody');
    if (bodyEl) {
      const deliverablesList = Array.isArray(proj.deliverables)
        ? proj.deliverables.map(d => `<li>${this.escapeHTML(d)}</li>`).join('')
        : '<li>Dokumentasi Proyek Lengkap</li>';

      const tagsList = Array.isArray(proj.tags)
        ? proj.tags.map(t => `<span class="badge bg-light text-dark border me-1 mb-1">${this.escapeHTML(t)}</span>`).join('')
        : '';

      bodyEl.innerHTML = `
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="badge bg-${proj.badgeColor || 'primary'} px-3 py-2 rounded-pill">${this.escapeHTML(proj.category)}</span>
          <span class="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill">Tahun ${this.escapeHTML(proj.year)}</span>
        </div>

        <h6 class="fw-bold text-dark mb-2">Deskripsi Proyek:</h6>
        <p class="text-secondary leading-relaxed">${this.escapeHTML(proj.description)}</p>

        <div class="p-3 bg-light rounded-3 border mb-3">
          <h6 class="fw-bold text-dark mb-1"><i class="bi bi-graph-up text-primary me-2"></i>Dampak & Metrik Capaian:</h6>
          <p class="small text-secondary mb-0">${this.escapeHTML(proj.metrics || 'Memenuhi standar mutu akademik.')}</p>
        </div>

        <h6 class="fw-bold text-dark mb-2">Deliverables & Hasil Karya:</h6>
        <ul class="text-secondary small mb-3">
          ${deliverablesList}
        </ul>

        <h6 class="fw-bold text-dark mb-2">Teknologi & Perangkat:</h6>
        <div class="d-flex flex-wrap mb-3">
          ${tagsList}
        </div>
      `;
    }

    // Buka modal menggunakan Bootstrap 5 API
    const modalEl = document.getElementById('universalProjectModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.show();
    }
  },

  // ========================================================
  // 6. DECOUPLED FORM REST DISPATCHING & TOAST FEEDBACK
  // ========================================================
  initFormHandler() {
    const form = document.getElementById('consultationForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // Mencegah full page reload

      // Validasi form HTML5 / Bootstrap
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn.innerHTML;

      // Status tombol: Disabled + Loading Spinner
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memproses Permintaan...';

      // Ekstraksi data formulir menjadi objek JSON (DTO)
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      try {
        // Kirim data via Data Access Layer
        const response = await ApiService.submitServiceOrder(payload);

        // Simpan ke LocalStorage sisi klien
        this.saveOrderToLocalStorage(response.data);

        // Perbarui badge riwayat pesanan
        this.updateOrderBadge();

        // Tampilkan Bootstrap Toast notifikasi sukses
        this.showToastNotification('Pesanan Terkirim!', 'Permintaan konsultasi Anda berhasil diproses dan dicatat.');

        // Reset form
        form.reset();
        form.classList.remove('was-validated');
      } catch (err) {
        this.showToastNotification('Gagal Mengirim', err.message, 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    });
  },

  // Simpan riwayat pesanan ke LocalStorage
  saveOrderToLocalStorage(order) {
    try {
      const existing = JSON.parse(localStorage.getItem('ppw_orders') || '[]');
      existing.push({
        id: 'ORD-' + Date.now(),
        date: new Date().toLocaleString('id-ID'),
        ...order
      });
      localStorage.setItem('ppw_orders', JSON.stringify(existing));
    } catch (e) {
      console.warn('Gagal menyimpan pesanan ke localStorage:', e);
    }
  },

  // Perbarui indikator badge riwayat pesanan di antarmuka
  updateOrderBadge() {
    try {
      const orders = JSON.parse(localStorage.getItem('ppw_orders') || '[]');
      const count = orders.length;
      const badge = document.getElementById('orderCountBadge');
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
      }
    } catch (e) {
      console.warn('Gagal membaca pesanan dari localStorage:', e);
    }
  },

  // Tampilkan notifikasi Bootstrap Toast
  showToastNotification(title, message, type = 'success') {
    const toastEl = document.getElementById('appToast');
    if (!toastEl) return;

    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const toastHeader = toastEl.querySelector('.toast-header');

    if (toastTitle) toastTitle.textContent = title;
    if (toastBody) toastBody.textContent = message;

    if (toastHeader) {
      toastHeader.className = `toast-header text-white bg-${type === 'danger' ? 'danger' : 'success'}`;
    }

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
    toast.show();
  }
};