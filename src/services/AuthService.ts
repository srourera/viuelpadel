import ApiService from "./ApiService";

class AuthService {
  private readonly ADMIN_KEY_STORAGE = "viuelpadel_admin-key";

  public getAdminKey(): string | null {
    return localStorage.getItem(this.ADMIN_KEY_STORAGE);
  }

  public hasAdminKey(): boolean {
    return !!this.getAdminKey();
  }

  public async isAuthenticated(): Promise<boolean> {
    return this.hasAdminKey() && (await ApiService.checkAuth());
  }

  public login(key: string): void {
    localStorage.setItem(this.ADMIN_KEY_STORAGE, key.trim());
    window.location.href = "/";
  }

  public logout(): void {
    localStorage.removeItem(this.ADMIN_KEY_STORAGE);
    window.location.href = "/";
  }
}

export default new AuthService();
