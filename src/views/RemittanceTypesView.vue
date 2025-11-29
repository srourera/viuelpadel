<script lang="ts">
import ApiService from "@/services/ApiService";
import type { IRemittanceType } from "@/interfaces/Remittance";

export default {
  name: "RemittanceTypesView",
  data() {
    return {
      remesas: [] as IRemittanceType[],
      loading: true,
      error: "",
    };
  },
  async mounted() {
    await this.fetchRemittanceTypes();
  },
  methods: {
    async fetchRemittanceTypes() {
      try {
        this.loading = true;
        this.error = "";
        const response = await ApiService.getRemittanceTypes();
        this.remesas = response.remittanceTypes || [];
      } catch (err) {
        this.error =
          "Error al cargar las remesas. Por favor, intenta de nuevo.";
        console.error("Error fetching remittance types:", err);
      } finally {
        this.loading = false;
      }
    },
    getRemesaRoute(remittanceTypeId: number): string {
      return `/remittance-type/${remittanceTypeId}`;
    },
  },
};
</script>

<template>
  <div class="remesas-view">
    <div class="remesas-header">
      <h1 class="remesas-title">Remesas</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando remesas...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchRemittanceTypes" class="retry-button">
        Reintentar
      </button>
    </div>

    <div v-else-if="remesas.length === 0" class="empty-state">
      <p>No hay remesas disponibles.</p>
    </div>

    <div v-else class="remesas-grid">
      <router-link
        v-for="remesa in remesas"
        :key="remesa.id"
        :to="getRemesaRoute(remesa.id)"
        class="remesa-card"
      >
        <div class="remesa-card-content">
          <div class="remesa-card-icon">{{ remesa.icon }}</div>
          <h2 class="remesa-card-title">{{ remesa.name }}</h2>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.remesas-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.remesas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.remesas-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
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

.remesas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.remesa-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  cursor: pointer;
  display: block;
}

.remesa-card:hover {
  border-color: #cddc39;
  box-shadow: 0 4px 12px rgba(205, 220, 57, 0.15);
  transform: translateY(-2px);
}

.remesa-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  text-align: center;
}

.remesa-card-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.remesa-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

@media (max-width: 768px) {
  .remesas-grid {
    grid-template-columns: 1fr;
  }
}
</style>

