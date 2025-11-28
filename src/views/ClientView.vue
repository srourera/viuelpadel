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
    getClientIdFromRoute(): number {
      const routeParam = this.$route.params.clientId as string;
      return parseInt(routeParam, 10);
    },
    async fetchClient() {
      try {
        this.loading = true;
        this.error = "";
        const clientId = this.getClientIdFromRoute();
        this.client = await ApiService.getClient(clientId);
        this.clientName = this.client?.name || "";
      } catch (err) {
        this.error = "Error al cargar el cliente. Por favor, intenta de nuevo.";
        console.error("Error fetching client:", err);
      } finally {
        this.loading = false;
      }
    },
    getResponsableUrl(responsibleId: number): string {
      return `/responsable/${responsibleId}`;
    },
    goToEditClient() {
      if (this.client) {
        this.$router.push(`/client/${this.client.id}/edit`);
      }
    },
    formatDate(dateString: string): string {
      if (!dateString) return "";
      try {
        // Si viene en formato ISO (YYYY-MM-DD), convertir a dd/mm/yyyy
        if (dateString.includes("-") && dateString.length === 10) {
          const parts = dateString.split("-");
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        // Si ya está en formato dd/mm/yyyy, devolverlo tal cual
        return dateString;
      } catch {
        return dateString;
      }
    },
  },
  computed: {
    clientIds(): number[] {
      if (!this.client) return [];
      return [this.client.id];
    },
  },
};
</script>

<template>
  <div class="client-view">
    <div class="client-header">
      <h1 class="client-title">{{ clientName || "Cargando..." }}</h1>
      <button
        v-if="client"
        @click="goToEditClient"
        class="edit-client-button"
      >
        Editar
      </button>
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
            <span class="detail-value">{{ client.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Responsable:</span>
            <span class="detail-value">
              <router-link
                v-if="client.responsible?.name"
                :to="getResponsableUrl(client.responsible.id)"
                class="responsable-link"
              >
                {{ client.responsible.name }}
              </router-link>
              <span v-else class="no-data">-</span>
            </span>
          </div>
        </div>

        <div class="client-section">
          <h2 class="section-title">Dirección</h2>
          <div class="detail-row">
            <span class="detail-label">Dirección 1:</span>
            <span class="detail-value">{{ client.address1 || "-" }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Dirección 2:</span>
            <span class="detail-value">{{ client.address2 || "-" }}</span>
          </div>
        </div>

        <div class="client-section">
          <h2 class="section-title">Contacto</h2>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">
              <a
                v-if="client.email"
                :href="`mailto:${client.email}`"
                class="contact-link"
              >
                {{ client.email }}
              </a>
              <span v-else class="no-data">-</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Teléfono:</span>
            <span class="detail-value">
              <a
                v-if="client.phone"
                :href="`tel:${client.phone}`"
                class="contact-link"
              >
                {{ client.phone }}
              </a>
              <span v-else class="no-data">-</span>
            </span>
          </div>
        </div>

        <div class="client-section">
          <h2 class="section-title">Identificación</h2>
          <div class="detail-row">
            <span class="detail-label">Tipo de ID:</span>
            <span class="detail-value">{{ client.id_type || "-" }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Valor de ID:</span>
            <span class="detail-value">{{ client.id_value || "-" }}</span>
          </div>
        </div>

        <div class="client-section">
          <h2 class="section-title">Información Bancaria</h2>
          <div class="detail-row">
            <span class="detail-label">IBAN:</span>
            <span class="detail-value">{{ client.iban || "-" }}</span>
          </div>
        </div>

        <div class="client-section">
          <h2 class="section-title">Referencias</h2>
          <div class="detail-row">
            <span class="detail-label">Referència Client:</span>
            <span class="detail-value">{{
              client.bank_client_reference || "-"
            }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Referència Mandat:</span>
            <span class="detail-value">{{
              client.bank_mandate_reference || "-"
            }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Data Firma Mandat:</span>
            <span class="detail-value">{{
              formatDate(client.bank_mandate_signed_at) || "-"
            }}</span>
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
.client-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.client-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.edit-client-button {
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
  white-space: nowrap;
}

.edit-client-button:hover {
  background-color: #b8c837;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(205, 220, 57, 0.3);
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
