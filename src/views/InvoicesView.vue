<script lang="ts">
import ApiService from "@/services/ApiService";
import type { IInvoice } from "@/interfaces/Invoice";

export default {
  name: "InvoicesView",
  data() {
    return {
      invoices: [] as IInvoice[],
      loading: true,
      error: "",
      searchQuery: "",
    };
  },
  computed: {
    filteredInvoices(): IInvoice[] {
      if (!this.searchQuery.trim()) {
        return this.invoices;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.invoices.filter((invoice) => {
        const numero = (invoice["Número de Factura"] || "").toLowerCase();
        const client = (invoice.Client || "").toLowerCase();
        const tipus = (invoice.Tipus || "").toLowerCase();
        const descripcio = (invoice.Descripció || "").toLowerCase();
        return (
          numero.includes(query) ||
          client.includes(query) ||
          tipus.includes(query) ||
          descripcio.includes(query)
        );
      });
    },
  },
  async mounted() {
    await this.fetchInvoices();
  },
  methods: {
    async fetchInvoices() {
      try {
        this.loading = true;
        this.error = "";
        const response = await ApiService.getInvoices();
        this.invoices = response.invoices;
      } catch (err) {
        this.error =
          "Error al cargar las facturas. Por favor, intenta de nuevo.";
        console.error("Error fetching invoices:", err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString: string): string {
      if (!dateString) return "-";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      } catch {
        return dateString;
      }
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
  },
};
</script>

<template>
  <div class="invoices-view">
    <div class="invoices-header">
      <h1 class="invoices-title">Facturas</h1>
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por Número, Cliente, Tipo o Descripción..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando facturas...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchInvoices" class="retry-button">Reintentar</button>
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
.invoices-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.invoices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.invoices-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
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

