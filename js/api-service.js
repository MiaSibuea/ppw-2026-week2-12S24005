/**
 * api-service.js
 * Data Access Layer (DAL)
 * Bertanggung jawab melakukan pemanggilan HTTP Asinkron (Fetch API)
 * serta menangani error handling secara defensif.
 */

const ApiService = {
  // 1. Mengambil data profil pengembang
  async getProfile() {
    try {
      const response = await fetch('./data/profile.json');
      if (!response.ok) {
        throw new Error(`Gagal memuat profil: HTTP ${response.status} (${response.statusText})`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ApiService.getProfile Error]:', error);
      throw error;
    }
  },

  // 2. Mengambil koleksi data proyek portofolio
  async getProjects() {
    try {
      const response = await fetch('./data/projects.json');
      if (!response.ok) {
        throw new Error(`Gagal memuat proyek: HTTP ${response.status} (${response.statusText})`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ApiService.getProjects Error]:', error);
      throw error;
    }
  },

  // 3. Mengambil data paket layanan konsultasi
  async getServices() {
    try {
      const response = await fetch('./data/services.json');
      if (!response.ok) {
        throw new Error(`Gagal memuat katalog layanan: HTTP ${response.status} (${response.statusText})`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ApiService.getServices Error]:', error);
      throw error;
    }
  },

  // 4. Simulasi Pengiriman Form Pemesanan (Decoupled REST POST Dispatching)
  // Mensimulasikan network latency 800ms layaknya mengirim ke API Server sungguhan
  async submitServiceOrder(payload) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validasi payload sederhana di sisi klien
        if (!payload || !payload.nama || !payload.email) {
          reject(new Error('Data formulir tidak lengkap!'));
          return;
        }

        // Response DTO (Data Transfer Object) tiruan server
        const mockResponse = {
          success: true,
          statusCode: 201,
          message: 'Permintaan pemesanan layanan berhasil dicatat oleh server.',
          orderId: 'ORD-' + Date.now(),
          timestamp: new Date().toISOString(),
          data: payload
        };

        resolve(mockResponse);
      }, 800); // Penundaan 800ms untuk efek loading realistis
    });
  }
};