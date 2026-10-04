/**
 * app.js - Presentation Layer & Dynamic Client-Side Rendering (CSR)
 * Mengontrol logika antarmuka, siklus status UI, modal universal, dan manajemen state lokal.
 */
document.addEventListener('DOMContentLoaded', () => {
  const app = new PortfolioApp();
  app.init();
});

class PortfolioApp {
  constructor() {
    this.state = {
      profile: null,
      projects: [],
      services: [],
      activeFilter: 'all',
      orders: this.loadOrdersFromLocalStorage()
    };

    // Cache elemen DOM
    this.dom = {
      portfolioContainer: document.getElementById('portfolioContainer'),
      filterButtons: document.querySelectorAll('.filter-btn'),
      servicesContainer: document.getElementById('servicesContainer'),
      form: document.getElementById('consultationForm'),
      orderBadge: document.getElementById('orderBadge'),
      toastEl: document.getElementById('liveToast'),
      toastTitle: document.getElementById('toastTitle'),
      toastMessage: document.getElementById('toastMessage'),
      modalEl: document.getElementById('universalProjectModal'),
      modalTitle: document.getElementById('projectModalTitle'),
      modalBody: document.getElementById('projectModalBody')
    };

    this.toastInstance = this.dom.toastEl ? new bootstrap.Toast(this.dom.toastEl) : null;
  }

  async init() {
    this.updateOrderBadgeUI();
    this.initFilterEvents();
    this.initFormSubmit();

    // Jalankan pemuatan data secara paralel (Asynchronous CSR)
    await Promise.all([
      this.loadProfileData(),
      this.loadProjectsData(),
      this.loadServicesData()
    ]);
  }

  /**
   * Sanitasi String Masukan Pengguna guna mencegah DOM-based Cross-Site Scripting (XSS)
   */
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ==========================================
  // 1. DATA PROFILE & HERO STATISTIK
  // ==========================================
  async loadProfileData() {
    try {
      const profile = await ApiService.fetchProfile();
      this.state.profile = profile;

      // Update metrik hero jika elemen ada
      const metricProjects = document.getElementById('metricProjects');
      const metricFocus = document.getElementById('metricFocus');
      if (metricProjects && profile.metrics) metricProjects.textContent = profile.metrics.projectsCompleted;
      if (metricFocus && profile.metrics) metricFocus.textContent = profile.metrics.primaryFocus;
    } catch (error) {
      console.warn('Gagal memuat profil dinamis, menggunakan fallback shell:', error);
    }
  }

  // ==========================================
  // 2. DATA PROYEK & 4 UI STATES MANAGEMENT
  // ==========================================
  async loadProjectsData() {
    // 1. UI STATE: Loading State (Skeleton visual)
    this.renderLoadingState();

    try {
      const projects = await ApiService.fetchProjects();
      this.state.projects = projects;

      // 2. UI STATE: Success Render State
      this.renderProjects(this.getFilteredProjects());
    } catch (error) {
      // 3. UI STATE: Error Fallback Alert
      this.renderErrorState(error.message);
    }
  }

  renderLoadingState() {
    if (!this.dom.portfolioContainer) return;
    this.dom.portfolioContainer.innerHTML = `
      <div class="col-12 py-5 text-center">
        <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Memuat proyek...</span>
        </div>
        <p class="text-secondary fw-semibold">Mengambil data portofolio dari provider REST JSON...</p>
      </div>
    `;
  }

  renderErrorState(errorMessage) {
    if (!this.dom.portfolioContainer) return;
    this.dom.portfolioContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger shadow-sm rounded-4 p-4 text-center border-0" role="alert">
          <i class="bi bi-exclamation-triangle-fill fs-1 text-danger d-block mb-2"></i>
          <h5 class="fw-bold">Gagal Memuat Data Portofolio</h5>
          <p class="text-muted mb-3">${this.escapeHTML(errorMessage)}</p>
          <button class="btn btn-primary rounded-pill px-4" onclick="location.reload()">
            <i class="bi bi-arrow-clockwise me-1"></i> Coba Muat Ulang
          </button>
        </div>
      </div>
    `;
  }

  renderEmptyState() {
    if (!this.dom.portfolioContainer) return;
    this.dom.portfolioContainer.innerHTML = `
      <div class="col-12">
        <div class="card border-0 bg-light rounded-4 text-center py-5 px-3">
          <i class="bi bi-folder-x fs-1 text-secondary mb-2"></i>
          <h5 class="fw-bold text-dark">Belum Ada Proyek Ditemukan</h5>
          <p class="text-muted">Tidak ada proyek yang sesuai dengan kategori "${this.escapeHTML(this.state.activeFilter)}".</p>
          <div>
            <button class="btn btn-outline-primary rounded-pill px-3 btn-sm" onclick="document.querySelector('[data-filter=\\'all\\']').click()">
              Lihat Semua Proyek
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getFilteredProjects() {
    if (this.state.activeFilter === 'all') {
      return this.state.projects;
    }
    return this.state.projects.filter(p => p.category.toLowerCase() === this.state.activeFilter.toLowerCase());
  }

  renderProjects(projects) {
    if (!this.dom.portfolioContainer) return;

    // 4. UI STATE: Empty State
    if (!projects || projects.length === 0) {
      this.renderEmptyState();
      return;
    }

    const cardsHTML = projects.map(proj => `
      <div class="col">
        <div class="card h-100 shadow-sm border-0 project-card rounded-4 overflow-hidden">
          <div class="card-img-top bg-${proj.themeClass}-subtle text-${proj.themeClass} d-flex align-items-center justify-content-center" style="height: 180px;">
            <i class="bi ${proj.icon} display-4"></i>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="mb-2 d-flex justify-content-between align-items-center">
              <span class="badge bg-${proj.themeClass}-subtle text-${proj.themeClass} rounded-pill">${this.escapeHTML(proj.category)}</span>
              <span class="badge bg-secondary-subtle text-secondary rounded-pill">${this.escapeHTML(proj.year)}</span>
            </div>
            <h5 class="card-title fw-bold text-dark mb-2">${this.escapeHTML(proj.title)}</h5>
            <p class="card-text text-muted small flex-grow-1">
              ${this.escapeHTML(proj.shortDescription)}
            </p>
            <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
              <small class="text-secondary fw-semibold"><i class="bi bi-graph-up me-1"></i>${this.escapeHTML(proj.metrics)}</small>
              <button type="button" class="btn btn-outline-${proj.themeClass} btn-sm rounded-pill px-3" onclick="window.portfolioAppInstance.openProjectModal('${proj.id}')">
                <i class="bi bi-eye me-1"></i> Detail
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    this.dom.portfolioContainer.innerHTML = cardsHTML;
  }

  initFilterEvents() {
    this.dom.filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.dom.filterButtons.forEach(b => b.classList.remove('active', 'btn-primary'));
        this.dom.filterButtons.forEach(b => b.classList.add('btn-outline-primary'));

        e.currentTarget.classList.remove('btn-outline-primary');
        e.currentTarget.classList.add('active', 'btn-primary');

        this.state.activeFilter = e.currentTarget.getAttribute('data-filter') || 'all';
        this.renderProjects(this.getFilteredProjects());
      });
    });
  }

  // ==========================================
  // 3. UNIVERSAL DYNAMIC MODAL (1 Modal Tunggal)
  // ==========================================
  openProjectModal(projectId) {
    const proj = this.state.projects.find(p => p.id === projectId);
    if (!proj || !this.dom.modalEl) return;

    this.dom.modalTitle.textContent = proj.title;

    const deliverablesList = proj.deliverables && proj.deliverables.length > 0
      ? `<h6 class="fw-bold mt-3">Deliverables & Lingkup:</h6>
         <ul class="text-secondary small mb-3">
           ${proj.deliverables.map(d => `<li>${this.escapeHTML(d)}</li>`).join('')}
         </ul>`
      : '';

    const tagsBadges = proj.tags && proj.tags.length > 0
      ? `<div class="d-flex flex-wrap gap-1 mt-2">
           ${proj.tags.map(t => `<span class="badge bg-light text-secondary border">${this.escapeHTML(t)}</span>`).join('')}
         </div>`
      : '';

    this.dom.modalBody.innerHTML = `
      <div class="mb-3">
        <img src="${this.escapeHTML(proj.thumbnail)}" class="img-fluid rounded-4 w-100 shadow-sm" alt="${this.escapeHTML(proj.title)}" style="max-height: 280px; object-fit: cover;">
      </div>
      <div class="d-flex align-items-center gap-2 mb-2">
        <span class="badge bg-${proj.themeClass} px-3 py-2 rounded-pill">${this.escapeHTML(proj.category)}</span>
        <span class="text-muted small">Tahun: <strong>${this.escapeHTML(proj.year)}</strong></span>
        <span class="text-muted small ms-auto"><i class="bi bi-speedometer2 me-1"></i>${this.escapeHTML(proj.metrics)}</span>
      </div>
      <p class="text-secondary mt-2">${this.escapeHTML(proj.fullDescription)}</p>
      ${deliverablesList}
      ${tagsBadges}
    `;

    const modalInstance = bootstrap.Modal.getOrCreateInstance(this.dom.modalEl);
    modalInstance.show();
  }

  // ==========================================
  // 4. DATA KATALOG LAYANAN (SERVICES)
  // ==========================================
  async loadServicesData() {
    if (!this.dom.servicesContainer) return;
    try {
      const services = await ApiService.fetchServices();
      this.state.services = services;

      this.dom.servicesContainer.innerHTML = services.map(s => `
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-white service-card">
            <div class="d-inline-flex p-3 rounded-circle bg-pink-subtle text-primary mb-3 mx-auto" style="background-color: var(--primary-soft);">
              <i class="bi ${s.icon} fs-2" style="color: var(--primary-brand);"></i>
            </div>
            <span class="badge bg-primary-subtle text-primary rounded-pill mb-2 align-self-center px-3">${this.escapeHTML(s.badge)}</span>
            <h5 class="fw-bold text-dark mb-1">${this.escapeHTML(s.title)}</h5>
            <div class="my-2">
              <span class="fs-4 fw-bold text-primary">${this.escapeHTML(s.price)}</span>
              <small class="text-muted"> / ${this.escapeHTML(s.unit)}</small>
            </div>
            <p class="text-muted small mb-3">${this.escapeHTML(s.description)}</p>
            <ul class="text-start small text-secondary list-unstyled border-top pt-3 mb-0">
              ${s.features.map(f => `<li class="mb-2"><i class="bi bi-check2-circle text-success me-2"></i>${this.escapeHTML(f)}</li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.warn('Gagal memuat katalog layanan:', err);
    }
  }

  // ==========================================
  // 5. ASYNCHRONOUS FORM DISPATCH & LOCAL STATE
  // ==========================================
  initFormSubmit() {
    if (!this.dom.form) return;

    this.dom.form.addEventListener('submit', async (e) => {
      e.preventDefault(); // Mencegah reload halaman penuh

      if (!this.dom.form.checkValidity()) {
        e.stopPropagation();
        this.dom.form.classList.add('was-validated');
        return;
      }

      const submitBtn = this.dom.form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Status tombol responsif (loading state)
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Memproses...';

      const formData = new FormData(this.dom.form);
      const payload = Object.fromEntries(formData.entries());
      payload.createdAt = new Date().toISOString();

      try {
        const result = await ApiService.submitServiceOrder(payload);

        // Persistensi data ke localStorage
        this.saveOrderToLocalStorage(payload);

        // Feedback visual Bootstrap Toast
        this.showToastNotification('Pesanan Diterima!', `Halo ${this.escapeHTML(payload.nama)}, permintaan konsultasi Anda berhasil diproses.`);

        this.dom.form.reset();
        this.dom.form.classList.remove('was-validated');
      } catch (error) {
        this.showToastNotification('Gagal Mengirim', 'Terjadi gangguan jaringan saat memproses pesanan.', true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  loadOrdersFromLocalStorage() {
    try {
      const stored = localStorage.getItem('ppw_orders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveOrderToLocalStorage(order) {
    this.state.orders.push(order);
    localStorage.setItem('ppw_orders', JSON.stringify(this.state.orders));
    this.updateOrderBadgeUI();
  }

  updateOrderBadgeUI() {
    if (this.dom.orderBadge) {
      const count = this.state.orders.length;
      this.dom.orderBadge.textContent = count;
      this.dom.orderBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  showToastNotification(title, message, isError = false) {
    if (!this.toastInstance) return;
    this.dom.toastTitle.textContent = title;
    this.dom.toastMessage.textContent = message;
    this.dom.toastEl.classList.remove('bg-danger', 'text-white', 'bg-white');

    if (isError) {
      this.dom.toastEl.classList.add('bg-danger', 'text-white');
    } else {
      this.dom.toastEl.classList.add('bg-white');
    }

    this.toastInstance.show();
  }
}

// Instance global untuk pemicu inline event (onclick)
window.portfolioAppInstance = new PortfolioApp();