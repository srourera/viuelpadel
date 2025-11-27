<script lang="ts">
import ApiService from "@/services/ApiService";
import type { IClient } from "@/interfaces/Client";
import InvoiceList from "@/components/InvoiceList.vue";

export default {
  name: "ClientView",
  components: {
    InvoiceList,
  },
  data() {
    return {
      client: null as IClient | null,
      loading: true,
      error: "",
      clientName: "",
    };
  },
  async mounted() {
    await this.fetchClient();
  },
  methods: {
    getClientNameFromRoute(): string {
      const routeParam = this.$route.params.clientName as string;
      return routeParam.replace(/_/g, " ");
    },
    async fetchClient() {
      try {
        this.loading = true;
        this.error = "";
        this.clientName = this.getClientNameFromRoute();
        this.client = await ApiService.getClient(this.clientName);
      } catch (err) {
        this.error = "Error al cargar el cliente. Por favor, intenta de nuevo.";
        console.error("Error fetching client:", err);
      } finally {
        this.loading = false;
      }
    },
    getResponsableUrl(responsableName: string): string {
      const urlFriendlyName = responsableName.replace(/\s+/g, "_");
      return `/responsable/${urlFriendlyName}`;
    },
  },
  computed: {
    clientNames(): string[] {
      if (!this.client) return [];
      return [this.client.Client];
    },
  },
};
</script>

<template>
  <div class="client-view">
    <div class="client-header">
      <h1 class="client-title">{{ getClientNameFromRoute() }}</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando cliente...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchClient" class="retry-button">Reintentar</button>
    </div>

    <div v-else-if="client" class="client-details">
      <div class="client-card">
        <div class="client-section">
          <h2 class="section-title">Información General</h2>
          <div class="detail-row">
            <span class="detail-label">Cliente:</span>
            <span class="detail-value">{{ client.Client }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Responsable:</span>
            <span class="detail-value">
              <router-link
                v-if="client['Nom Responsable']"
                :to="getResponsableUrl(client['Nom Responsable'])"
                class="responsable-link"
              >
                {{ client["Nom Responsable"] }}
              </router-link>
              <span v-else class="no-data">-</span>
            </span>
          </div>
        </div>

        <div class="client-section">
          <h2 class="section-title">Dirección</h2>
          <div class="detail-row">
            <span class="detail-label">Dirección 1:</span>
            <span class="detail-value">{{ client["Direcció 1"] || "-" }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Dirección 2:</span>
            <span class="detail-value">{{ client["Direcció 2"] || "-" }}</span>
          </div>
        </div>

        <div class="client-section">
          <h2 class="section-title">Contacto</h2>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">
              <a
                v-if="client.Email"
                :href="`mailto:${client.Email}`"
                class="contact-link"
              >
                {{ client.Email }}
              </a>
              <span v-else class="no-data">-</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Teléfono:</span>
            <span class="detail-value">
              <a
                v-if="client.Telèfon"
                :href="`tel:${client.Telèfon}`"
                class="contact-link"
              >
                {{ client.Telèfon }}
              </a>
              <span v-else class="no-data">-</span>
            </span>
          </div>
        </div>
      </div>

      <div class="invoices-section">
        <InvoiceList
          :show-title="true"
          title="Facturas"
          :only-from-client="clientNames"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.client-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.client-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  width: fit-content;
}

.back-link:hover {
  color: #cddc39;
}

.back-icon {
  font-size: 1.25rem;
}

.client-title {
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

.client-details {
  width: 100%;
}

.client-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.client-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.client-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  color: #292929;
}

.contact-link {
  color: #cddc39;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #b8c837;
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

.no-data {
  color: #999;
  font-style: italic;
}

.invoices-section {
  margin-top: 2rem;
}

.retry-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .detail-row {
    flex-direction: row;
    align-items: center;
  }

  .detail-label {
    min-width: 150px;
  }
}
</style>
