import AuthService from "./AuthService";
import type {
  IClientList,
  IClient,
  INewClientPayload,
  IResponsibleWithClients,
} from "@/interfaces/Client";
import type {
  IInvoiceList,
  IManualInvoicePayload,
  ILastInvoiceNumber,
} from "@/interfaces/Invoice";

class ApiService {
  private readonly BASE_URL = "https://n8n.ridaflows.com/webhook";
  private cache: Map<string, unknown> = new Map();

  public async checkAuth(): Promise<boolean> {
    return await this.request<boolean>("/viuelpadel/check-auth", {
      method: "GET",
    });
  }

  public async getClients(): Promise<IClientList> {
    return await this.request<IClientList>("/viuelpadel/clients", {
      method: "GET",
    });
  }

  public async getClient(clientId: number): Promise<IClient> {
    return await this.request<IClient>(
      `/viuelpadel/client?clientId=${clientId}`,
      {
        method: "GET",
      }
    );
  }

  public async getResponsible(
    responsibleId: number
  ): Promise<IResponsibleWithClients> {
    return await this.request<IResponsibleWithClients>(
      `/viuelpadel/responsible?responsibleId=${responsibleId}`,
      {
        method: "GET",
      }
    );
  }

  public async getInvoices(): Promise<IInvoiceList> {
    return await this.request<IInvoiceList>("/viuelpadel/invoices", {
      method: "GET",
    });
  }

  public async getLastInvoiceNumber(): Promise<ILastInvoiceNumber> {
    return await this.request<ILastInvoiceNumber>(
      "/viuelpadel/last-invoice-number",
      {
        method: "GET",
      }
    );
  }

  public async createManualInvoice(
    payload: IManualInvoicePayload
  ): Promise<unknown> {
    return await this.request<unknown>(
      "/viuelpadel/invoices/new-manual-invoice",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  public async createClient(payload: INewClientPayload): Promise<unknown> {
    return await this.request<unknown>("/viuelpadel/clients/new-client", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  public async editClient(payload: INewClientPayload): Promise<unknown> {
    return await this.request<unknown>("/viuelpadel/clients/edit-client", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  private getCacheKey(endpoint: string): string {
    return endpoint;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const method = options.method || "GET";
      const cacheKey = this.getCacheKey(endpoint);

      // Solo cachear peticiones GET
      if (method === "GET" && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey) as T;
      }

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

      // Guardar en caché solo si es GET
      if (method === "GET") {
        this.cache.set(cacheKey, data);
      }

      return data as T;
    } catch (error) {
      console.error(`Error in API request to ${endpoint}:`, error);
      throw error;
    }
  }
}

export default new ApiService();
