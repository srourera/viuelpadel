<script lang="ts">
import ApiService from "@/services/ApiService";
import type { IRemittanceType, IRemittance } from "@/interfaces/Remittance";

export default {
  name: "RemittanceTypeView",
  data() {
    return {
      remesa: null as IRemittanceType | null,
      remittances: [] as IRemittance[],
      loading: true,
      loadingRemittances: true,
      error: "",
      errorRemittances: "",
    };
  },
  async mounted() {
    await Promise.all([this.fetchRemittanceType(), this.fetchRemittances()]);
  },
  methods: {
    getRemittanceTypeIdFromRoute(): number {
      const routeParam = this.$route.params.id as string;
      return parseInt(routeParam, 10);
    },
    async fetchRemittanceType() {
      try {
        this.loading = true;
        this.error = "";
        const remittanceTypeId = this.getRemittanceTypeIdFromRoute();
        this.remesa = await ApiService.getRemittanceType(remittanceTypeId);
      } catch (err) {
        this.error =
          "Error al cargar la información de la remesa. Por favor, intenta de nuevo.";
        console.error("Error fetching remittance type:", err);
      } finally {
        this.loading = false;
      }
    },
    async fetchRemittances() {
      try {
        this.loadingRemittances = true;
        this.errorRemittances = "";
        const remittanceTypeId = this.getRemittanceTypeIdFromRoute();
        const response = await ApiService.getRemittances(remittanceTypeId);
        this.remittances = response.remittances || [];
      } catch (err) {
        this.errorRemittances =
          "Error al cargar las remesas. Por favor, intenta de nuevo.";
        console.error("Error fetching remittances:", err);
      } finally {
        this.loadingRemittances = false;
      }
    },
    getRemittanceRoute(remittanceId: number): string {
      const remittanceTypeId = this.getRemittanceTypeIdFromRoute();
      return `/remittance-type/${remittanceTypeId}/remittance/${remittanceId}`;
    },
    getStatusLabel(status: string): string {
      return status === "validated" ? "Validada" : "Pendiente";
    },
    getStatusIcon(status: string): string {
      return status === "validated" ? "✅" : "⏳";
    },
    formatMonthYear(month: number, year: number): string {
      const monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return `${monthNames[month - 1]} ${year}`;
    },
  },
};
</script>

<template>
  <div class="remesa-detail-view">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando información...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchRemittanceType" class="retry-button">
        Reintentar
      </button>
    </div>

    <div v-else-if="remesa">
      <div class="remesa-header">
        <div class="remesa-title-section">
          <h1 class="remesa-title">
            <span class="remesa-icon">{{ remesa.icon }}</span>
            {{ remesa.name }}
          </h1>
          <p v-if="remesa.generationDay" class="generation-day-info">
            Generada automáticamente cada día {{ remesa.generationDay }}
          </p>
        </div>
        <router-link
          :to="`/remittance-type/${getRemittanceTypeIdFromRoute()}/clients`"
          class="clients-quotas-button"
        >
          ⚙️ Cuotas de clientes
        </router-link>
      </div>

      <div class="remittances-section">
        <h2 class="section-title">Remesas</h2>

        <div v-if="loadingRemittances" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando remesas...</p>
        </div>

        <div v-else-if="errorRemittances" class="error-state">
          <p class="error-message">{{ errorRemittances }}</p>
          <button @click="fetchRemittances" class="retry-button">
            Reintentar
          </button>
        </div>

        <div v-else-if="remittances.length === 0" class="empty-state">
          <p>No hay remesas disponibles.</p>
        </div>

        <div v-else class="remittances-list">
          <router-link
            v-for="remittance in remittances"
            :key="remittance.id"
            :to="getRemittanceRoute(remittance.id)"
            class="remittance-card"
          >
            <div class="remittance-card-content">
              <div class="remittance-card-header">
                <div class="remittance-date">
                  {{ formatMonthYear(remittance.month, remittance.year) }}
                </div>
                <div
                  class="remittance-status"
                  :class="{
                    'status-validated': remittance.status === 'validated',
                    'status-pending': remittance.status === 'pending',
                  }"
                >
                  <span class="status-icon">{{
                    getStatusIcon(remittance.status)
                  }}</span>
                  <span class="status-label">{{
                    getStatusLabel(remittance.status)
                  }}</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.remesa-detail-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.remesa-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.remesa-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.remesa-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.generation-day-info {
  font-size: 0.85rem;
  color: #666666;
  margin: 0;
}

.remesa-icon {
  font-size: 2rem;
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

.remittances-section {
  width: 100%;
}

.clients-quotas-button {
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
  text-decoration: none;
  display: inline-block;
}

.clients-quotas-button:hover {
  background-color: #b8c837;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #292929;
  margin: 0 0 1.5rem 0;
}

.remittances-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.remittance-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  cursor: pointer;
  display: block;
  width: 100%;
}

.remittance-card:hover {
  border-color: #cddc39;
  box-shadow: 0 4px 12px rgba(205, 220, 57, 0.15);
  transform: translateY(-2px);
}

.remittance-card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.remittance-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.remittance-date {
  font-size: 1.1rem;
  font-weight: 600;
  color: #292929;
}

.remittance-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-validated {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-pending {
  background-color: #fff3e0;
  color: #e65100;
}

.status-icon {
  font-size: 1rem;
}

.status-label {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .remesa-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .clients-quotas-button {
    width: 100%;
    text-align: center;
  }

  .remittance-card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
