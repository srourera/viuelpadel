<script lang="ts">
export default {
  name: "RemesaEscolaViuElPadelView",
  data() {
    return {
      remesa: {
        path: "escola-viu-el-padel",
        name: "Remesa Escola Viu el Pàdel",
      },
    };
  },
};
</script>

<template>
  <div class="remesa-detail-view">
    <div class="remesa-header">
      <h1 class="remesa-title">{{ remesa.name }}</h1>
    </div>

    <div class="remesa-details">
      <div class="remesa-card">
        <div class="remesa-section">
          <h2 class="section-title">Información de la Remesa</h2>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">{{ remesa.name }}</span>
          </div>
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
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.remesa-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

.remesa-details {
  width: 100%;
}

.remesa-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.remesa-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.remesa-section:last-child {
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
