import type { IInvoice, IInvoiceFilters } from "@/interfaces/Invoice";

class APIUtils {
  /**
   * Filtra facturas según los criterios proporcionados.
   * Por ahora se hace en frontend, pero está preparado para moverlo al backend.
   *
   * @param invoices - Lista de facturas a filtrar
   * @param filters - Objeto con los filtros a aplicar
   * @returns Lista de facturas filtradas
   */
  public filterInvoices(
    invoices: IInvoice[],
    filters: IInvoiceFilters
  ): IInvoice[] {
    let filtered = [...invoices];

    // Filtro por cliente(s) si se especifica
    if (filters.onlyFromClient && filters.onlyFromClient.length > 0) {
      filtered = filtered.filter((invoice) => {
        return filters.onlyFromClient!.includes(invoice.Client);
      });
    }

    // Filtro de búsqueda por texto (número, cliente o descripción)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((invoice) => {
        const numero = String(invoice["Número de Factura"] || "").toLowerCase();
        const client = String(invoice.Client || "").toLowerCase();
        const descripcio = String(invoice.Descripció || "").toLowerCase();
        return (
          numero.includes(query) ||
          client.includes(query) ||
          descripcio.includes(query)
        );
      });
    }

    // Filtro de tipo
    if (filters.typeFilter) {
      filtered = filtered.filter(
        (invoice) => invoice.Tipus === filters.typeFilter
      );
    }

    // Filtro de fecha (mes-año)
    if (filters.dateFilter) {
      const filterParts = filters.dateFilter.split("-");
      if (filterParts.length === 2 && filterParts[0] && filterParts[1]) {
        const filterYear = parseInt(filterParts[0], 10);
        const filterMonth = parseInt(filterParts[1], 10);

        if (!isNaN(filterYear) && !isNaN(filterMonth)) {
          filtered = filtered.filter((invoice) => {
            if (!invoice.Data) return false;
            const invoiceDate = this.parseDate(invoice.Data);
            if (!invoiceDate || isNaN(invoiceDate.getTime())) return false;

            const invoiceYear = invoiceDate.getFullYear();
            const invoiceMonth = invoiceDate.getMonth() + 1; // getMonth() devuelve 0-11

            return invoiceYear === filterYear && invoiceMonth === filterMonth;
          });
        }
      }
    }

    return filtered;
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
    const types = new Set<string>();
    let invoicesToCheck = invoices;

    // Si hay filtro por cliente, solo considerar esas facturas
    if (onlyFromClient && onlyFromClient.length > 0) {
      invoicesToCheck = invoices.filter((invoice) => {
        return onlyFromClient.includes(invoice.Client);
      });
    }

    invoicesToCheck.forEach((invoice) => {
      if (invoice.Tipus) {
        types.add(invoice.Tipus);
      }
    });
    return Array.from(types).sort();
  }

  /**
   * Parsea una fecha en formato dd-mm-yyyy a un objeto Date.
   *
   * @param dateString - Fecha en formato dd-mm-yyyy
   * @returns Objeto Date o null si no se puede parsear
   */
  public parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    try {
      // El formato del backend es dd-mm-yyyy
      const parts = dateString.split("-");
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Los meses en Date son 0-11
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
      // Si no coincide el formato, intentar parseo estándar
      return new Date(dateString);
    } catch {
      return null;
    }
  }
}

export default new APIUtils();

