<script lang="ts">
export default {
  name: "AppSidebar",
};
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <img
        src="https://res.cloudinary.com/srourera/image/upload/t_700/v1762816426/ANAGRAMA_JUGADOR_VIU_EL_PADEL_jsbwuo.png"
        alt="Viu el Padel Logo"
        class="sidebar-logo"
      />
    </div>
    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" active-class="active">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">Inicio</span>
      </router-link>
      <!-- Agrega más items de navegación aquí según necesites -->
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  height: 100vh;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  z-index: 100;
  font-family: "Signika", sans-serif;
}

.sidebar-header {
  height: 70px;
  padding: 0 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sidebar-logo {
  max-width: 100%;
  height: 50px;
  object-fit: contain;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: #666666;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: #f5f5f5;
  color: #292929;
}

.nav-item.active {
  background-color: #f9f9f9;
  color: #292929;
  border-left-color: #cddc39;
  font-weight: 600;
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 0.95rem;
}
</style>
