<script lang="ts">
import ApiService from "@/services/ApiService";
import type { IInvoice } from "@/interfaces/Invoice";

export default {
  name: "InvoiceList",
  props: {
    showTitle: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "Facturas",
    },
    onlyFromClient: {
      type: Array as () => string[],
      default: () => [],
    },
    onlyFromClientIds: {
      type: Array as () => number[],
      default: () => [],
    },
    onlyFromRemittanceId: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      invoices: [] as IInvoice[],
      loading: true,
      error: "",
      searchQuery: "",
      typeFilter: "",
      dateFilter: "",
    };
  },
  async mounted() {
    await this.fetchInvoices();
  },
  computed: {
    availableTypes(): string[] {
      const types = new Set<string>();
      let invoicesToCheck = this.invoices;

      // Si hay filtro por cliente, solo considerar esas facturas
      if (this.onlyFromClient.length > 0) {
        invoicesToCheck = this.invoices.filter((invoice) => {
          return this.onlyFromClient.includes(invoice.client.name);
        });
      }
      if (this.onlyFromClientIds.length > 0) {
        invoicesToCheck = this.invoices.filter((invoice) => {
          return this.onlyFromClientIds.includes(invoice.client.id);
        });
      }
      if (
        this.onlyFromRemittanceId !== null &&
        this.onlyFromRemittanceId !== undefined
      ) {
        invoicesToCheck = this.invoices.filter((invoice) => {
          return invoice.remittanceId === this.onlyFromRemittanceId;
        });
      }

      invoicesToCheck.forEach((invoice) => {
        if (invoice.type) {
          types.add(invoice.type);
        }
      });
      return Array.from(types).sort();
    },
    filteredInvoices(): IInvoice[] {
      let filtered = this.invoices;

      // Filtro por cliente(s) si se especifica
      if (this.onlyFromClient.length > 0) {
        filtered = filtered.filter((invoice) => {
          return this.onlyFromClient.includes(invoice.client.name);
        });
      }
      if (this.onlyFromClientIds.length > 0) {
        filtered = filtered.filter((invoice) => {
          return this.onlyFromClientIds.includes(invoice.client.id);
        });
      }
      if (
        this.onlyFromRemittanceId !== null &&
        this.onlyFromRemittanceId !== undefined
      ) {
        filtered = filtered.filter((invoice) => {
          return invoice.remittanceId === this.onlyFromRemittanceId;
        });
      }

      // Filtro de búsqueda por texto (número, cliente o descripción)
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter((invoice) => {
          const numero = String(invoice.invoiceNumber || "").toLowerCase();
          const client = String(invoice.client?.name || "").toLowerCase();
          const descripcio = String(invoice.description || "").toLowerCase();
          return (
            numero.includes(query) ||
            client.includes(query) ||
            descripcio.includes(query)
          );
        });
      }

      // Filtro de tipo
      if (this.typeFilter) {
        filtered = filtered.filter(
          (invoice) => invoice.type === this.typeFilter
        );
      }

      // Filtro de fecha (mes-año)
      if (this.dateFilter) {
        const filterParts = this.dateFilter.split("-");
        if (filterParts.length === 2 && filterParts[0] && filterParts[1]) {
          const filterYear = parseInt(filterParts[0], 10);
          const filterMonth = parseInt(filterParts[1], 10);

          if (!isNaN(filterYear) && !isNaN(filterMonth)) {
            filtered = filtered.filter((invoice) => {
              if (!invoice.dueDate) return false;
              const invoiceDate = this.parseDate(invoice.dueDate);
              if (!invoiceDate || isNaN(invoiceDate.getTime())) return false;

              const invoiceYear = invoiceDate.getFullYear();
              const invoiceMonth = invoiceDate.getMonth() + 1; // getMonth() devuelve 0-11

              return invoiceYear === filterYear && invoiceMonth === filterMonth;
            });
          }
        }
      }

      // Eliminar duplicados finales por ID (segunda capa de seguridad)
      const uniqueFilteredMap = new Map<number, IInvoice>();
      filtered.forEach((invoice) => {
        if (!uniqueFilteredMap.has(invoice.id)) {
          uniqueFilteredMap.set(invoice.id, invoice);
        }
      });

      return Array.from(uniqueFilteredMap.values());
    },
  },
  methods: {
    async fetchInvoices() {
      try {
        this.loading = true;
        this.error = "";
        const response = await ApiService.getInvoices();
        // Eliminar duplicados por ID
        const uniqueInvoicesMap = new Map<number, IInvoice>();
        response.invoices.forEach((invoice) => {
          if (!uniqueInvoicesMap.has(invoice.id)) {
            uniqueInvoicesMap.set(invoice.id, invoice);
          }
        });
        this.invoices = Array.from(uniqueInvoicesMap.values());
      } catch (err) {
        this.error =
          "Error al cargar las facturas. Por favor, intenta de nuevo.";
        console.error("Error fetching invoices:", err);
      } finally {
        this.loading = false;
      }
    },
    parseDate(dateString: string): Date | null {
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
    },
    formatDate(dateString: string): string {
      if (!dateString) return "-";
      const date = this.parseDate(dateString);
      if (!date || isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
    formatCurrency(amount: number): string {
      if (amount === null || amount === undefined) return "-";
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
    },
    getClientUrl(clientId: number): string {
      return `/client/${clientId}`;
    },
    clearFilters() {
      this.searchQuery = "";
      this.typeFilter = "";
      this.dateFilter = "";
    },
  },
};
</script>

<template>
  <div class="invoice-list">
    <div v-if="showTitle" class="invoice-list-header">
      <h1 class="invoice-list-title">{{ title }}</h1>
    </div>
    <div class="filters-container">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por Número, Cliente o Descripción..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
      <div class="filter-group">
        <select v-model="typeFilter" class="filter-select">
          <option value="">Todos los tipos</option>
          <option v-for="type in availableTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <input
          v-model="dateFilter"
          type="month"
          class="filter-date"
          placeholder="Filtrar por mes"
        />
      </div>
      <button
        v-if="searchQuery || typeFilter || dateFilter"
        @click="clearFilters"
        class="clear-filters-button"
      >
        Limpiar filtros
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando facturas...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
    </div>

    <div v-else-if="invoices.length === 0" class="empty-state">
      <p>No hay facturas disponibles.</p>
    </div>

    <div v-else-if="filteredInvoices.length === 0" class="empty-state">
      <p>No se encontraron facturas que coincidan con la búsqueda.</p>
    </div>

    <div v-else class="invoices-table-container">
      <table class="invoices-table">
        <thead>
          <tr>
            <th>Número de Factura</th>
            <th>Tipo</th>
            <th>Cliente</th>
            <th>Descripción</th>
            <th>Importe</th>
            <th>Vencimiento</th>
            <th>Creación</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in filteredInvoices" :key="invoice.id">
            <td class="invoice-number">
              {{ invoice.invoiceNumber }}
            </td>
            <td>{{ invoice.type }}</td>
            <td class="client-name">
              <router-link
                :to="getClientUrl(invoice.client.id)"
                class="client-link"
              >
                {{ invoice.client.name }}
              </router-link>
            </td>
            <td class="invoice-description">
              {{ invoice.description }}
            </td>
            <td class="invoice-amount">
              {{ formatCurrency(invoice.amount) }}
            </td>
            <td>{{ formatDate(invoice.dueDate) }}</td>
            <td>
              {{ new Date(invoice.createdAt).toLocaleDateString("es-ES") }}
            </td>
            <td>
              <a
                v-if="invoice.link"
                :href="invoice.link"
                target="_blank"
                rel="noopener noreferrer"
                class="invoice-link"
              >
                Ver Factura
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="error && !loading" class="retry-container">
      <button @click="fetchInvoices" class="retry-button">Reintentar</button>
    </div>
  </div>
</template>

<style scoped>
.invoice-list {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.invoice-list-header {
  margin-bottom: 1.5rem;
}

.invoice-list-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-select,
.filter-date {
  padding: 0.625rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: "Signika", sans-serif;
  color: #292929;
  background-color: #fff;
  transition: all 0.3s ease;
  min-width: 180px;
}

.filter-select:focus,
.filter-date:focus {
  outline: none;
  border-color: #cddc39;
  box-shadow: 0 0 0 3px rgba(205, 220, 57, 0.1);
}

.clear-filters-button {
  padding: 0.625rem 1.5rem;
  background-color: #f5f5f5;
  color: #292929;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: "Signika", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.clear-filters-button:hover {
  background-color: #e0e0e0;
  border-color: #cddc39;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: "Signika", sans-serif;
  color: #292929;
  background-color: #fff;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #cddc39;
  box-shadow: 0 0 0 3px rgba(205, 220, 57, 0.1);
}

.search-input::placeholder {
  color: #999;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  font-size: 1rem;
  color: #666;
  pointer-events: none;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #666666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #cddc39;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #d32f2f;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.invoices-table-container {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100%;
}

.invoices-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
  table-layout: auto;
}

.invoices-table thead {
  background-color: #f5f5f5;
}

.invoices-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #292929;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
}

.invoices-table td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  color: #666666;
  font-size: 0.95rem;
}

.invoices-table tbody tr:hover {
  background-color: #f9f9f9;
}

.invoices-table tbody tr:last-child td {
  border-bottom: none;
}

.invoice-number {
  font-weight: 600;
  color: #292929;
}

.invoice-description {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invoice-amount {
  font-weight: 600;
  color: #292929;
}

.client-name {
  font-weight: 600;
  color: #292929;
}

.client-link {
  color: #292929;
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;
}

.client-link:hover {
  color: #cddc39;
  text-decoration: underline;
}

.invoice-link {
  color: #cddc39;
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;
}

.invoice-link:hover {
  color: #b8c837;
  text-decoration: underline;
}

.no-data {
  color: #999;
  font-style: italic;
}

.retry-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.retry-button {
  padding: 0.625rem 1.5rem;
  background-color: #cddc39;
  color: #292929;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: "Signika", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background-color: #b8c837;
}
</style>
