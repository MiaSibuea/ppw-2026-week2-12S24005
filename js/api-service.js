/**
 * api-service.js - Data Access Layer (Decoupled Multi-Tier Architecture)
 * Mengelola pemanggilan data eksternal via Fetch API dengan defensive error handling.
 */
class ApiService {
  /**
   * Fetch data profil pengembang dari JSON provider
   */
  static async fetchProfile() {
    try {
      const response = await fetch('./data/profile.json');
      if (!response.ok) {
        throw new Error(`[HTTP ${response.status}] Gagal memuat data profile: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[ApiService Profile Error]:', error);
      throw error;
    }
  }

  /**
   * Fetch data koleksi portofolio proyek
   */
  static async fetchProjects() {
    try {
      const response = await fetch('./data/projects.json');
      if (!response.ok) {
        throw new Error(`[HTTP ${response.status}] Gagal memuat data projects: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[ApiService Projects Error]:', error);
      throw error;
    }
  }

  /**
   * Fetch data katalog paket layanan
   */
  static async fetchServices() {
    try {
      const response = await fetch('./data/services.json');
      if (!response.ok) {
        throw new Error(`[HTTP ${response.status}] Gagal memuat data services: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[ApiService Services Error]:', error);
      throw error;
    }
  }

  /**
   * Simulasi RESTful Asynchronous Form Dispatch (AJAX POST)
   * Mengirim payload JSON DTO dengan latensi simulasi network (600ms)
   */
  static async submitServiceOrder(payload) {
    try {
      // Mensimulasikan network delay HTTP POST ke mock endpoint
      await new Promise(resolve => setTimeout(resolve, 600));

      // Jika ada endpoint nyata, contoh:
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      // return await response.json();

      return {
        status: 201,
        success: true,
        message: 'Permintaan konsultasi layanan berhasil diterima oleh API Server.',
        orderId: 'ORD-' + Date.now(),
        data: payload
      };
    } catch (error) {
      console.error('[ApiService Submit Order Error]:', error);
      throw error;
    }
  }
}

window.ApiService = ApiService;