import AuthService from "./AuthService";
import type {
  IClientList,
  IClient,
  INewClientPayload,
  IResponsibleWithClients,
  IResponsiblesList,
  ICreateClientResponse,
} from "@/interfaces/Client";
import type {
  IInvoiceList,
  IManualInvoicePayload,
  ILastInvoiceNumber,
} from "@/interfaces/Invoice";
import type {
  IRemittanceTypesList,
  IRemittanceType,
  IRemittancesList,
  IRemittance,
  IRemittanceLinesList,
  IRemittanceTypeClientsList,
} from "@/interfaces/Remittance";

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

  public async getResponsibles(): Promise<IResponsiblesList> {
    return await this.request<IResponsiblesList>("/viuelpadel/responsibles", {
      method: "GET",
    });
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

  public async createClient(
    payload: INewClientPayload
  ): Promise<ICreateClientResponse> {
    return await this.request<ICreateClientResponse>(
      "/viuelpadel/clients/new-client",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
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

  public async activateClient(clientId: number): Promise<unknown> {
    return await this.request<unknown>("/viuelpadel/clients/activate-client", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: clientId }),
    });
  }

  public async deactivateClient(clientId: number): Promise<unknown> {
    return await this.request<unknown>(
      "/viuelpadel/clients/deactivate-client",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: clientId }),
      }
    );
  }

  public async getRemittanceTypes(): Promise<IRemittanceTypesList> {
    return await this.request<IRemittanceTypesList>(
      "/viuelpadel/remittance-types",
      {
        method: "GET",
      }
    );
  }

  public async getRemittanceType(
    remittanceTypeId: number
  ): Promise<IRemittanceType> {
    return await this.request<IRemittanceType>(
      `/viuelpadel/remittance-type?remittanceTypeId=${remittanceTypeId}`,
      {
        method: "GET",
      }
    );
  }

  public async getRemittances(
    remittanceTypeId: number
  ): Promise<IRemittancesList> {
    return await this.request<IRemittancesList>(
      `/viuelpadel/remittances?remittanceTypeId=${remittanceTypeId}`,
      {
        method: "GET",
      }
    );
  }

  public async getRemittance(remittanceId: number): Promise<IRemittance> {
    return await this.request<IRemittance>(
      `/viuelpadel/remittance?remittanceId=${remittanceId}`,
      {
        method: "GET",
      }
    );
  }

  public async validateRemittance(remittanceId: number): Promise<unknown> {
    return await this.request<unknown>("/viuelpadel/remittance/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: remittanceId }),
    });
  }

  public async getRemittanceLines(
    remittanceId: number
  ): Promise<IRemittanceLinesList> {
    return await this.request<IRemittanceLinesList>(
      `/viuelpadel/remittance-lines?remittanceId=${remittanceId}`,
      {
        method: "GET",
      }
    );
  }

  public async updateRemittanceLine(
    id: number,
    amountMinUnit: number
  ): Promise<unknown> {
    return await this.request<unknown>(
      "/viuelpadel/remittance/update-remittance-line",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, amountMinUnit }),
      }
    );
  }

  public async addRemittanceLine(
    remittanceId: number,
    clientId: number,
    amountMinUnit: number
  ): Promise<unknown> {
    return await this.request<unknown>(
      "/viuelpadel/remittance/add-remittance-line",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remittanceId, clientId, amountMinUnit }),
      }
    );
  }

  public async getRemittanceTypeClients(
    remittanceTypeId: number
  ): Promise<IRemittanceTypeClientsList> {
    return await this.request<IRemittanceTypeClientsList>(
      `/viuelpadel/remittance-type-clients?remittanceTypeId=${remittanceTypeId}`,
      {
        method: "GET",
      }
    );
  }

  public async updateRemittanceTypeClient(
    id: number,
    amountMinUnit: number
  ): Promise<unknown> {
    return await this.request<unknown>(
      "/viuelpadel/remittance/update-remittance-type-client",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, amountMinUnit }),
      }
    );
  }

  public async addRemittanceTypeClient(
    remittanceTypeId: number,
    clientId: number,
    amountMinUnit: number
  ): Promise<unknown> {
    return await this.request<unknown>(
      "/viuelpadel/remittance/add-remittance-type-client",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remittanceTypeId, clientId, amountMinUnit }),
      }
    );
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
