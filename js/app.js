/**
 * app.js - Presentation Layer & Dynamic Client-Side Rendering (CSR)
 * Modul Praktikum Minggu 04: Sesuai Lab 2 & Spesifikasi Rubrik Penilaian
 */

// 1. Data Cache Global Proyek
let allProjectsData = [];

// 2. Fungsi Sanitasi XSS (Keamanan Sisi Klien Lapis Pertama)
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 3. FUNGSI UTAMA UNIVERSAL DYNAMIC MODAL (Sesuai Modul Lab 2 Hal. 5)
// Dibuat global agar tombol Detail PASTI BISA memanggil fungsi ini tanpa error
window.openProjectModal = function(projectId) {
  // Cari data proyek berdasarkan ID
  const proj = allProjectsData.find(p => p.id === projectId);
  if (!proj) return;

  // Injeksi Judul Modal
  const titleEl = document.getElementById('projectModalTitle');
  if (titleEl) {
    titleEl.textContent = proj.title;
  }

  // Injeksi Isi Modal Body (Gambar Thumbnail, Deskripsi, Deliverables, Tags)
  const bodyEl = document.getElementById('projectModalBody');
  if (bodyEl) {
    const deliverablesHTML = (proj.deliverables && proj.deliverables.length > 0)
      ? `<h6 class="fw-bold mt-3">Deliverables & Lingkup:</h6>
         <ul class="text-secondary small mb-3">
           ${proj.deliverables.map(d => `<li>${escapeHTML(d)}</li>`).join('')}
         </ul>`
      : '';

    const tagsHTML = (proj.tags && proj.tags.length > 0)
      ? `<div class="d-flex flex-wrap gap-1 mt-2">
           ${proj.tags.map(t => `<span class="badge bg-light text-dark border">${escapeHTML(t)}</span>`).join('')}
         </div>`
      : '';

    const imgHTML = proj.thumbnail
      ? `<div class="mb-3">
           <img src="${escapeHTML(proj.thumbnail)}" class="img-fluid rounded-4 w-100 shadow-sm" alt="${escapeHTML(proj.title)}" style="max-height: 280px; object-fit: cover;">
         </div>`
      : '';

    bodyEl.innerHTML = `
      ${imgHTML}
      <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
        <span class="badge bg-${proj.themeClass || proj.badgeColor || 'primary'} px-3 py-2 rounded-pill">${escapeHTML(proj.category)}</span>
        <span class="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill">Tahun ${escapeHTML(proj.year)}</span>
        <span class="text-muted small ms-auto"><i class="bi bi-speedometer2 me-1"></i>${escapeHTML(proj.metrics || '')}</span>
      </div>
      <p class="text-secondary mt-3">${escapeHTML(proj.fullDescription || proj.description || proj.summary || '')}</p>
      ${deliverablesHTML}
      ${tagsHTML}
    `;
  }

  // Tampilkan Modal Universal menggunakan Bootstrap API
  const modalEl = document.getElementById('universalProjectModal');
  if (modalEl) {
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalInstance.show();
  }
};

// 4. Inisialisasi Aplikasi Saat Halaman Selesai Dimuat
document.addEventListener('DOMContentLoaded', async () => {
  initFilterButtons();
  initFormSubmit();
  updateOrderBadge();

  // Muat data profil, proyek, dan katalog layanan
  await loadProfile();
  await loadProjects();
  await loadServices();
});

// ==========================================
// A. PEMUATAN DATA PROYEK (CSR & 4 UI STATES)
// ==========================================
async function loadProjects() {
  const container = document.getElementById('portfolioContainer');
  if (!container) return;

  // UI STATE 1: LOADING STATE (Spinner / Skeleton)
  container.innerHTML = `
    <div class="col-12 py-5 text-center">
      <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
      <p class="text-secondary fw-semibold">Memuat portofolio dari provider REST JSON...</p>
    </div>
  `;

  try {
    const fetchFn = (window.ApiService && (ApiService.getProjects || ApiService.fetchProjects))
      ? (ApiService.getProjects || ApiService.fetchProjects).bind(ApiService)
      : async () => (await fetch('./data/projects.json')).json();

    const data = await fetchFn();
    allProjectsData = data;

    // UI STATE 2: SUCCESS RENDER STATE
    renderProjectCards(allProjectsData);
  } catch (err) {
    // UI STATE 4: ERROR STATE
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger rounded-4 shadow-sm p-4 text-center border-0">
          <i class="bi bi-exclamation-triangle-fill fs-2 text-danger d-block mb-2"></i>
          <h5 class="fw-bold">Gagal Memuat Data Portofolio</h5>
          <p class="text-muted small">${escapeHTML(err.message)}</p>
          <button class="btn btn-primary rounded-pill px-4 mt-2" onclick="location.reload()">Coba Muat Ulang</button>
        </div>
      </div>
    `;
  }
}

// Fungsi Render Kartu Portofolio Dinamis
function renderProjectCards(projects) {
  const container = document.getElementById('portfolioContainer');
  if (!container) return;

  // UI STATE 3: EMPTY STATE (Jika hasil filter kosong)
  if (!projects || projects.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="card border-0 bg-light rounded-4 text-center py-5 px-3">
          <i class="bi bi-folder-x fs-1 text-secondary mb-2"></i>
          <h5 class="fw-bold text-dark">Belum Ada Proyek Ditemukan</h5>
          <p class="text-muted">Tidak ada proyek yang sesuai dengan kategori ini.</p>
          <div>
            <button class="btn btn-outline-primary rounded-pill px-3 btn-sm" onclick="document.querySelector('[data-filter=\\'all\\']').click()">
              Lihat Semua Proyek
            </button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Render kartu proyek lengkap dengan pemicu modal
  container.innerHTML = projects.map(proj => `
    <div class="col">
      <div class="card h-100 shadow-sm border-0 project-card rounded-4 overflow-hidden">
        <div class="card-img-top bg-${proj.themeClass || proj.badgeColor || 'primary'}-subtle text-${proj.themeClass || proj.badgeColor || 'primary'} d-flex align-items-center justify-content-center" style="height: 180px;">
          <i class="bi ${proj.icon || 'bi-folder'} display-4"></i>
        </div>
        <div class="card-body d-flex flex-column">
          <div class="mb-2 d-flex justify-content-between align-items-center">
            <span class="badge bg-${proj.themeClass || proj.badgeColor || 'primary'}-subtle text-${proj.themeClass || proj.badgeColor || 'primary'} rounded-pill">${escapeHTML(proj.category)}</span>
            <span class="badge bg-secondary-subtle text-secondary rounded-pill">${escapeHTML(proj.year)}</span>
          </div>
          <h5 class="card-title fw-bold text-dark mb-2">${escapeHTML(proj.title)}</h5>
          <p class="card-text text-muted small flex-grow-1">
            ${escapeHTML(proj.shortDescription || proj.summary || '')}
          </p>
          <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
            <small class="text-secondary fw-semibold"><i class="bi bi-graph-up me-1"></i>${escapeHTML(proj.metrics || '')}</small>
            <!-- Tombol Detail yang memicu Universal Modal -->
            <button type="button" 
                    class="btn btn-outline-${proj.themeClass || proj.badgeColor || 'primary'} btn-sm rounded-pill px-3" 
                    onclick="openProjectModal('${proj.id}')"
                    data-bs-toggle="modal" 
                    data-bs-target="#universalProjectModal">
              <i class="bi bi-eye me-1"></i> Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// B. FILTER KATEGORI INSTAN
// ==========================================
function initFilterButtons() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      buttons.forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-outline-primary');
      });
      btn.classList.remove('btn-outline-primary');
      btn.classList.add('active', 'btn-primary');

      const filter = btn.getAttribute('data-filter') || 'all';
      if (filter === 'all') {
        renderProjectCards(allProjectsData);
      } else {
        const filtered = allProjectsData.filter(p => p.category.toLowerCase() === filter.toLowerCase());
        renderProjectCards(filtered);
      }
    });
  });
}

// ==========================================
// C. DATA PROFIL & KATALOG LAYANAN
// ==========================================
async function loadProfile() {
  try {
    const fetchFn = (window.ApiService && (ApiService.getProfile || ApiService.fetchProfile))
      ? (ApiService.getProfile || ApiService.fetchProfile).bind(ApiService)
      : async () => (await fetch('./data/profile.json')).json();

    const profile = await fetchFn();
    const metricProjects = document.getElementById('metricProjects');
    const metricFocus = document.getElementById('metricFocus');
    if (metricProjects && profile.metrics) metricProjects.textContent = profile.metrics.projectsCompleted;
    if (metricFocus && profile.metrics) metricFocus.textContent = profile.metrics.primaryFocus;
  } catch (e) {
    console.warn('Gagal memuat profil:', e);
  }
}

async function loadServices() {
  const container = document.getElementById('servicesContainer');
  if (!container) return;
  try {
    const fetchFn = (window.ApiService && (ApiService.getServices || ApiService.fetchServices))
      ? (ApiService.getServices || ApiService.fetchServices).bind(ApiService)
      : async () => (await fetch('./data/services.json')).json();

    const services = await fetchFn();
    container.innerHTML = services.map(s => `
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-white service-card">
          <div class="d-inline-flex p-3 rounded-circle bg-pink-subtle text-primary mb-3 mx-auto" style="background-color: var(--primary-soft);">
            <i class="bi ${s.icon || 'bi-box-seam'} fs-2" style="color: var(--primary-brand);"></i>
          </div>
          ${(s.badge || s.isPopular) ? `<span class="badge bg-primary-subtle text-primary rounded-pill mb-2 align-self-center px-3">${escapeHTML(s.badge || 'Terpopuler')}</span>` : ''}
          <h5 class="fw-bold text-dark mb-1">${escapeHTML(s.title || s.name || '')}</h5>
          <div class="my-2">
            <span class="fs-4 fw-bold text-primary">${escapeHTML(s.price || '')}</span>
          </div>
          <p class="text-muted small mb-3">${escapeHTML(s.description || '')}</p>
          <ul class="text-start small text-secondary list-unstyled border-top pt-3 mb-0">
            ${(s.features || []).map(f => `<li class="mb-2"><i class="bi bi-check2-circle text-success me-2"></i>${escapeHTML(f)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.warn('Gagal memuat katalog layanan:', e);
  }
}

// ==========================================
// D. FORM ASINKRON REST & LOCALSTORAGE
// ==========================================
function initFormSubmit() {
  const form = document.getElementById('consultationForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Mengirim...';

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.createdAt = new Date().toISOString();

    try {
      const submitFn = (window.ApiService && ApiService.submitServiceOrder)
        ? ApiService.submitServiceOrder.bind(ApiService)
        : async (p) => ({ success: true, data: p });

      await submitFn(payload);

      // Simpan ke LocalStorage
      const orders = JSON.parse(localStorage.getItem('ppw_orders') || '[]');
      orders.push(payload);
      localStorage.setItem('ppw_orders', JSON.stringify(orders));
      updateOrderBadge();

      // Tampilkan Toast
      showToast('Pesanan Berhasil!', `Halo ${escapeHTML(payload.nama)}, permintaan konsultasi Anda berhasil diproses.`);
      form.reset();
      form.classList.remove('was-validated');
    } catch (err) {
      showToast('Gagal Mengirim', 'Terjadi gangguan jaringan saat memproses pesanan.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

function updateOrderBadge() {
  const badge = document.getElementById('orderBadge');
  if (!badge) return;
  const orders = JSON.parse(localStorage.getItem('ppw_orders') || '[]');
  badge.textContent = orders.length;
  badge.style.display = orders.length > 0 ? 'inline-block' : 'none';
}

function showToast(title, message) {
  const toastEl = document.getElementById('liveToast');
  if (!toastEl) return;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMessage').textContent = message;
  const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
  toast.show();
}