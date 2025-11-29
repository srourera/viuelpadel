<script lang="ts">
import ApiService from "@/services/ApiService";
import type { IClientReference } from "@/interfaces/Client";
import InvoiceList from "@/components/InvoiceList.vue";

export default {
  name: "ResponsableView",
  components: {
    InvoiceList,
  },
  data() {
    return {
      clients: [] as IClientReference[],
      loading: true,
      error: "",
      responsableName: "",
    };
  },
  async mounted() {
    await this.fetchResponsible();
  },
  methods: {
    getResponsibleIdFromRoute(): number {
      const routeParam = this.$route.params.responsibleId as string;
      return parseInt(routeParam, 10);
    },
    async fetchResponsible() {
      try {
        this.loading = true;
        this.error = "";
        const responsibleId = this.getResponsibleIdFromRoute();
        const responsible = await ApiService.getResponsible(responsibleId);
        this.responsableName = responsible.name;
        this.clients = responsible.clients || [];
      } catch (err) {
        this.error =
          "Error al cargar el responsable. Por favor, intenta de nuevo.";
        console.error("Error fetching responsible:", err);
      } finally {
        this.loading = false;
      }
    },
    getClientUrl(clientId: number): string {
      return `/client/${clientId}`;
    },
  },
  computed: {
    clientIds(): number[] {
      return this.clients.map((client) => client.id);
    },
  },
};
</script>

<template>
  <div class="responsable-view">
    <div class="responsable-header">
      <h1 class="responsable-title">{{ responsableName || "Cargando..." }}</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando información...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchResponsible" class="retry-button">Reintentar</button>
    </div>

    <div v-else class="responsable-content">
      <div class="clients-section">
        <div class="section-card">
          <h2 class="section-title">Clientes</h2>
          <div v-if="clients.length === 0" class="empty-state">
            <p>No hay clientes asignados a este responsable.</p>
          </div>
          <div v-else class="clients-list">
            <router-link
              v-for="client in clients"
              :key="client.id"
              :to="getClientUrl(client.id)"
              class="client-item"
            >
              {{ client.name }} {{ client.isActive ? "🟢" : "⚪️" }}
            </router-link>
          </div>
        </div>
      </div>

      <div class="invoices-section">
        <InvoiceList
          :show-title="true"
          title="Facturas"
          :only-from-client-ids="clientIds"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.responsable-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.responsable-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.responsable-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

.loading-state,
.error-state {
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

.responsable-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.clients-section {
  width: 100%;
}

.section-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #292929;
  margin: 0 0 1.5rem 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #666666;
}

.clients-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.client-item {
  padding: 0.875rem 1rem;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #292929;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.client-item:hover {
  background-color: #f0f0f0;
  border-color: #cddc39;
  color: #cddc39;
}

.invoices-section {
  width: 100%;
}
</style>
