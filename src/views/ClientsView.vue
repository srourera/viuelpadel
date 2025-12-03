<script lang="ts">
import ApiService from "@/services/ApiService";
import type { IClientListItem } from "@/interfaces/Client";

export default {
  name: "ClientsView",
  data() {
    return {
      clients: [] as IClientListItem[],
      loading: true,
      error: "",
      searchQuery: "",
    };
  },
  computed: {
    filteredClients(): IClientListItem[] {
      if (!this.searchQuery.trim()) {
        return this.clients;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.clients.filter((client) => {
        const cliente = (client.name || "").toLowerCase();
        const responsable = (client.responsible?.name || "").toLowerCase();
        const email = (client.email || "").toLowerCase();
        const telefono = String(client.phone || "").toLowerCase();
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
    goToNewClient() {
      this.$router.push("/clients/new");
    },
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
    getClientUrl(clientId: number): string {
      return `/client/${clientId}`;
    },
    getResponsableUrl(responsibleId: number): string {
      return `/responsable/${responsibleId}`;
    },
  },
};
</script>

<template>
  <div class="clients-view">
    <div class="clients-header">
      <h1 class="clients-title">Clientes</h1>
      <button @click="goToNewClient" class="new-client-button">
        + Cliente
      </button>
    </div>
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por Cliente, Responsable, Email o Teléfono..."
        class="search-input"
      />
      <span class="search-icon">🔍</span>
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
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th class="centered-column">Activo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in filteredClients" :key="client.id">
            <td class="client-name">
              <router-link :to="getClientUrl(client.id)" class="client-link">
                {{ client.name }}
              </router-link>
            </td>
            <td class="responsable-column">
              <router-link
                v-if="client.responsible?.name"
                :to="getResponsableUrl(client.responsible.id)"
                class="responsable-link"
              >
                {{ client.responsible.name }}
              </router-link>
              <span v-else class="no-data">-</span>
            </td>
            <td>
              <a
                v-if="client.phone"
                :href="`https://wa.me/${client.phone}`"
                class="phone-link"
                target="_blank"
              >
                {{ client.phone }}
              </a>
              <span v-else class="no-data">-</span>
            </td>
            <td>
              <a
                v-if="client.email"
                :href="`mailto:${client.email}`"
                class="email-link"
              >
                {{ client.email }}
              </a>
              <span v-else class="no-data">-</span>
            </td>
            <td class="address-column">
              <div class="address">
                <div v-if="client.address1">
                  {{ client.address1 }}
                </div>
                <div v-if="client.address2">
                  {{ client.address2 }}
                </div>
              </div>
            </td>
            <td class="centered-column">
              <span class="active-status">
                {{ client.isActive ? "🟢" : "⚪️" }}
              </span>
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
  margin-bottom: 1.5rem;
}

.clients-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

.new-client-button {
  padding: 0.75rem 1.5rem;
  background-color: #cddc39;
  color: #292929;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: "Signika", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.new-client-button:hover {
  background-color: #b8c837;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(205, 220, 57, 0.3);
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin-bottom: 2rem;
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
  padding: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  color: #666666;
  font-size: 0.95rem;
}
.clients-table td.address-column {
  min-width: 200px;
  font-size: 10px;
}

.clients-table tbody tr:hover {
  background-color: #f9f9f9;
}

.clients-table tbody tr:last-child td {
  border-bottom: none;
}

.client-name {
  font-weight: 600;
  font-size: 14px !important;
  color: #292929;
}

.responsable-column {
  font-size: 14px !important;
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

.responsable-link {
  color: #292929;
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;
}

.responsable-link:hover {
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

.centered-column {
  text-align: center;
}

@media (max-width: 768px) {
  .clients-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .new-client-button {
    width: 100%;
  }

  .search-container {
    width: 100%;
    max-width: 100%;
  }
}
</style>
