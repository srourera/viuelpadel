class PWAService {
  /**
   * Detecta si la aplicación está corriendo como PWA (instalada)
   * @returns true si está en modo standalone, false si está en el navegador
   */
  public isStandalone(): boolean {
    // Método estándar para detectar modo standalone (funciona en todos los navegadores modernos)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Fallback para iOS Safari (solo funciona en iOS)
    if ((window.navigator as any).standalone === true) {
      return true;
    }

    // También puede estar en modo fullscreen o minimal-ui
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return true;
    }

    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return true;
    }

    return false;
  }

  /**
   * Obtiene el modo de visualización actual
   * @returns 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
   */
  public getDisplayMode(): 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser' {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone';
    }
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui';
    }
    return 'browser';
  }
}

export default new PWAService();

