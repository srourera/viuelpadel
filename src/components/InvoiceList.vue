<script lang="ts">
import type { IInvoice } from "@/interfaces/Invoice";
import ApiService from "@/services/ApiService";

export default {
  name: "InvoiceList",
  props: {
    invoices: {
      type: Array as () => IInvoice[],
      required: false,
      default: () => [],
    },
    loading: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    error: {
      type: String,
      required: false,
      default: undefined,
    },
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
  },
  data() {
    return {
      searchQuery: "",
      searchQueryInput: "", // Valor del input (se actualiza en tiempo real)
      typeFilter: "",
      dateFilter: "",
      internalInvoices: [] as IInvoice[],
      internalLoading: true,
      internalError: "",
    };
  },
  computed: {
    finalInvoices(): IInvoice[] {
      // Si se pasan facturas como prop, usar esas; si no, usar las internas
      return this.invoices.length > 0 ? this.invoices : this.internalInvoices;
    },
    finalLoading(): boolean {
      // Si se pasa loading como prop, usar ese; si no, usar el interno
      return this.loading !== undefined ? this.loading : this.internalLoading;
    },
    finalError(): string {
      // Si se pasa error como prop, usar ese; si no, usar el interno
      return this.error !== undefined ? this.error : this.internalError;
    },
    availableTypes(): string[] {
      // Obtener todas las facturas sin filtrar para calcular los tipos disponibles
      const allInvoices =
        this.invoices.length > 0 ? this.invoices : this.internalInvoices;

      // Usar ApiService para obtener los tipos (que internamente usa APIUtils)
      return ApiService.getAvailableTypes(
        allInvoices,
        this.onlyFromClient.length > 0 ? this.onlyFromClient : undefined
      );
    },
    filteredInvoices(): IInvoice[] {
      // Si las facturas vienen como prop, filtrarlas localmente con ApiService
      // Si vienen de la carga interna, ya están filtradas desde ApiService.getInvoices()
      if (this.invoices.length > 0) {
        const filters = {
          searchQuery: this.searchQuery,
          typeFilter: this.typeFilter,
          dateFilter: this.dateFilter,
          onlyFromClient:
            this.onlyFromClient.length > 0 ? this.onlyFromClient : undefined,
        };
        // Usar ApiService para filtrar (que internamente usa APIUtils)
        return ApiService.filterInvoices(this.invoices, filters);
      }
      // Las facturas ya vienen filtradas desde ApiService.getInvoices()
      return this.finalInvoices;
    },
  },
  async mounted() {
    // Si no se pasan facturas como prop, cargarlas automáticamente
    if (this.invoices.length === 0) {
      await this.fetchInvoices();
    }
  },
  watch: {
    typeFilter() {
      if (this.invoices.length === 0) {
        this.fetchInvoices();
      }
    },
    dateFilter() {
      if (this.invoices.length === 0) {
        this.fetchInvoices();
      }
    },
    onlyFromClient: {
      handler() {
        if (this.invoices.length === 0) {
          this.fetchInvoices();
        }
      },
      deep: true,
    },
  },
  methods: {
    async fetchInvoices() {
      try {
        this.internalLoading = true;
        this.internalError = "";
        // Pasar los filtros a getInvoices
        // Por ahora se aplican en frontend con APIUtils dentro de ApiService
        // En el futuro, cuando el backend soporte filtros, se pasarán en la petición HTTP
        const filters = {
          searchQuery: this.searchQuery,
          typeFilter: this.typeFilter,
          dateFilter: this.dateFilter,
          onlyFromClient:
            this.onlyFromClient.length > 0 ? this.onlyFromClient : undefined,
        };
        const response = await ApiService.getInvoices(filters);
        // Las facturas ya vienen filtradas desde ApiService
        this.internalInvoices = response.invoices;
      } catch (err) {
        this.internalError =
          "Error al cargar las facturas. Por favor, intenta de nuevo.";
        console.error("Error fetching invoices:", err);
      } finally {
        this.internalLoading = false;
      }
    },
    parseDate(dateString: string): Date | null {
      // Necesitamos parseDate para formatDate, pero no podemos usar APIUtils directamente
      // Por ahora lo mantenemos aquí, o podríamos moverlo a ApiService también
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
    getClientUrl(clientName: string): string {
      const urlFriendlyName = clientName.replace(/\s+/g, "_");
      return `/client/${urlFriendlyName}`;
    },
    clearFilters() {
      this.searchQuery = "";
      this.searchQueryInput = "";
      this.typeFilter = "";
      this.dateFilter = "";
      // Si las facturas se cargan internamente, recargar sin filtros
      if (this.invoices.length === 0) {
        this.fetchInvoices();
      }
    },
    onSearchBlur() {
      // Al hacer blur, actualizar el filtro de búsqueda
      if (this.searchQueryInput !== this.searchQuery) {
        this.searchQuery = this.searchQueryInput;
        // Si las facturas se cargan internamente, recargar con el nuevo filtro
        if (this.invoices.length === 0) {
          this.fetchInvoices();
        }
      }
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
          v-model="searchQueryInput"
          @blur="onSearchBlur"
          @keyup.enter="onSearchBlur"
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
        v-if="searchQuery || searchQueryInput || typeFilter || dateFilter"
        @click="clearFilters"
        class="clear-filters-button"
      >
        Limpiar filtros
      </button>
    </div>

    <div v-if="finalLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando facturas...</p>
    </div>

    <div v-else-if="finalError" class="error-state">
      <p class="error-message">{{ finalError }}</p>
      <button
        v-if="invoices.length === 0"
        @click="fetchInvoices"
        class="retry-button"
      >
        Reintentar
      </button>
    </div>

    <div v-else-if="finalInvoices.length === 0" class="empty-state">
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
            <th>Fecha</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(invoice, index) in filteredInvoices" :key="index">
            <td class="invoice-number">
              {{ invoice["Número de Factura"] }}
            </td>
            <td>{{ invoice.Tipus }}</td>
            <td class="client-name">
              <router-link
                :to="getClientUrl(invoice.Client)"
                class="client-link"
              >
                {{ invoice.Client }}
              </router-link>
            </td>
            <td class="invoice-description">
              {{ invoice.Descripció }}
            </td>
            <td class="invoice-amount">
              {{ formatCurrency(invoice.Import) }}
            </td>
            <td>{{ formatDate(invoice.Data) }}</td>
            <td>
              <a
                v-if="invoice.Link"
                :href="invoice.Link"
                target="_blank"
                rel="noopener noreferrer"
                class="invoice-link"
              >
                Ver Factura
              </a>
              <span v-else class="no-data">-</span>
            </td>
          </tr>
        </tbody>
      </table>
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
</style>
