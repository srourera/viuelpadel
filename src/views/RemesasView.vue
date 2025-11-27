<script lang="ts">
export default {
  name: "RemesasView",
  data() {
    return {
      remesas: [
        {
          path: "escola-viu-el-padel",
          name: "Remesa Escola Viu el Pàdel",
          route: "/remesa/escola-viu-el-padel",
        },
      ],
    };
  },
};
</script>

<template>
  <div class="remesas-view">
    <div class="remesas-header">
      <h1 class="remesas-title">Remesas</h1>
    </div>

    <div v-if="remesas.length === 0" class="empty-state">
      <p>No hay remesas disponibles.</p>
    </div>

    <div v-else class="remesas-grid">
      <router-link
        v-for="remesa in remesas"
        :key="remesa.path"
        :to="remesa.route"
        class="remesa-card"
      >
        <div class="remesa-card-content">
          <div class="remesa-card-icon">💳</div>
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #666666;
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
