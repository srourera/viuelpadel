import AuthService from "./AuthService";
import APIUtils from "./APIUtils";
import type { IClientList, IClient } from "@/interfaces/Client";
import type {
  IInvoiceList,
  IInvoiceFilters,
  IInvoice,
} from "@/interfaces/Invoice";

class ApiService {
  private readonly BASE_URL = "https://n8n.ridaflows.com/webhook";

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

  public async getClient(clientName: string): Promise<IClient> {
    const encodedClientName = encodeURIComponent(clientName);
    return await this.request<IClient>(
      `/viuelpadel/client?client=${encodedClientName}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Obtiene las facturas del backend.
   * Por ahora los filtros se ignoran en la petición HTTP, pero se pasan para preparar
   * la migración futura al backend. El filtrado se hace en frontend con APIUtils.
   *
   * @param filters - Filtros opcionales (por ahora se ignoran en la petición)
   * @returns Lista de facturas filtradas
   */
  public async getInvoices(filters?: IInvoiceFilters): Promise<IInvoiceList> {
    // TODO: Cuando el backend soporte filtros, pasarlos como query params
    // Por ahora se ignoran y se hace la petición sin filtros
    console.log("getInvoices", filters);
    const response = await this.request<IInvoiceList>("/viuelpadel/invoices", {
      method: "GET",
    });

    // Por ahora, aplicar filtrado en frontend con APIUtils
    // En el futuro, cuando el backend soporte filtros, esto se eliminará
    if (filters) {
      return {
        invoices: APIUtils.filterInvoices(response.invoices, filters),
      };
    }

    return response;
  }

  /**
   * Filtra facturas localmente (sin hacer petición HTTP).
   * Útil cuando las facturas ya están cargadas y solo necesitas filtrarlas.
   *
   * @param invoices - Lista de facturas a filtrar
   * @param filters - Filtros a aplicar
   * @returns Lista de facturas filtradas
   */
  public filterInvoices(
    invoices: IInvoice[],
    filters: IInvoiceFilters
  ): IInvoice[] {
    return APIUtils.filterInvoices(invoices, filters);
  }

  /**
   * Obtiene los tipos únicos disponibles de las facturas.
   * Si se proporciona onlyFromClient, solo considera facturas de esos clientes.
   *
   * @param invoices - Lista de facturas
   * @param onlyFromClient - Lista opcional de nombres de clientes para filtrar
   * @returns Array de tipos únicos ordenados
   */
  public getAvailableTypes(
    invoices: IInvoice[],
    onlyFromClient?: string[]
  ): string[] {
    return APIUtils.getAvailableTypes(invoices, onlyFromClient);
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
