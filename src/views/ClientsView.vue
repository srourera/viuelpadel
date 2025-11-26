<script lang="ts">
import ApiService from "@/services/ApiService";
import type { IClient } from "@/interfaces/Client";

export default {
  name: "ClientsView",
  data() {
    return {
      clients: [] as IClient[],
      loading: true,
      error: "",
      searchQuery: "",
    };
  },
  computed: {
    filteredClients(): IClient[] {
      if (!this.searchQuery.trim()) {
        return this.clients;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.clients.filter((client) => {
        const cliente = (client.Client || "").toLowerCase();
        const responsable = (client["Nom Responsable"] || "").toLowerCase();
        const email = (client.Email || "").toLowerCase();
        const telefono = String(client.Telèfon || "").toLowerCase();
        return (
          cliente.includes(query) ||
          responsable.includes(query) ||
          email.includes(query) ||
          telefono.includes(query)
        );
      });
    },
  },
  async mounted() {
    await this.fetchClients();
  },
  methods: {
    async fetchClients() {
      try {
        this.loading = true;
        this.error = "";
        const response = await ApiService.getClients();
        this.clients = response.clients;
      } catch (err) {
        this.error =
          "Error al cargar los clientes. Por favor, intenta de nuevo.";
        console.error("Error fetching clients:", err);
      } finally {
        this.loading = false;
      }
    },
    getClientUrl(clientName: string): string {
      const urlFriendlyName = clientName.replace(/\s+/g, "_");
      return `/client/${urlFriendlyName}`;
    },
  },
};
</script>

<template>
  <div class="clients-view">
    <div class="clients-header">
      <h1 class="clients-title">Clientes</h1>
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por Cliente, Responsable, Email o Teléfono..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando clientes...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchClients" class="retry-button">Reintentar</button>
    </div>

    <div v-else-if="clients.length === 0" class="empty-state">
      <p>No hay clientes disponibles.</p>
    </div>

    <div v-else-if="filteredClients.length === 0" class="empty-state">
      <p>No se encontraron clientes que coincidan con la búsqueda.</p>
    </div>

    <div v-else class="clients-table-container">
      <table class="clients-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Responsable</th>
            <th>Dirección</th>
            <th>Email</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(client, index) in filteredClients" :key="index">
            <td class="client-name">
              <router-link
                :to="getClientUrl(client.Client)"
                class="client-link"
              >
                {{ client.Client }}
              </router-link>
            </td>
            <td>{{ client["Nom Responsable"] }}</td>
            <td>
              <div class="address">
                <div v-if="client['Direcció 1']">
                  {{ client["Direcció 1"] }}
                </div>
                <div v-if="client['Direcció 2']">
                  {{ client["Direcció 2"] }}
                </div>
              </div>
            </td>
            <td>
              <a
                v-if="client.Email"
                :href="`mailto:${client.Email}`"
                class="email-link"
              >
                {{ client.Email }}
              </a>
              <span v-else class="no-data">-</span>
            </td>
            <td>
              <a
                v-if="client.Telèfon"
                :href="`tel:${client.Telèfon}`"
                class="phone-link"
              >
                {{ client.Telèfon }}
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
.clients-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.clients-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.clients-title {
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

.clients-table-container {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100%;
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  table-layout: auto;
}

.clients-table thead {
  background-color: #f5f5f5;
}

.clients-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #292929;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
}

.clients-table td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  color: #666666;
  font-size: 0.95rem;
}

.clients-table tbody tr:hover {
  background-color: #f9f9f9;
}

.clients-table tbody tr:last-child td {
  border-bottom: none;
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

.address {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.email-link,
.phone-link {
  color: #cddc39;
  text-decoration: none;
  transition: color 0.3s ease;
}

.email-link:hover,
.phone-link:hover {
  color: #b8c837;
  text-decoration: underline;
}

.no-data {
  color: #999;
  font-style: italic;
}
</style>
