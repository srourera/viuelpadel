import AuthService from "./AuthService";

class ApiService {
  private readonly BASE_URL = "https://n8n.ridaflows.com/webhook";

  public async checkAuth(): Promise<boolean> {
    return await this.request<boolean>("/viuelpadel/check-auth", {
      method: "GET",
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const adminKey = AuthService.getAdminKey();
      if (!adminKey) throw new Error("Admin key not found");

      const url = `${this.BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          "x-viuelpadel-authorization": adminKey,
          ...options.headers,
        },
      });
      if (!response.ok) {
        if (response.status === 403) AuthService.logout();
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`Error in API request to ${endpoint}:`, error);
      throw error;
    }
  }
}

export default new ApiService();
