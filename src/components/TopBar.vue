<script lang="ts">
import AuthService from "../services/AuthService";

export default {
  name: "TopBar",
  methods: {
    handleLogout() {
      AuthService.logout();
    },
  },
};
</script>

<template>
  <header class="topbar">
    <div class="topbar-content">
      <div class="topbar-left">
        <h1 class="topbar-title">Panel de Administración</h1>
      </div>
      <div class="topbar-right">
        <button @click="handleLogout" class="logout-button">
          <span class="logout-icon">🚪</span>
          <span class="logout-text">Salir</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 200px;
  right: 0;
  height: 70px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  z-index: 99;
  font-family: "Signika", sans-serif;
}

.topbar-content {
  width: 100%;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topbar-left {
  display: flex;
  align-items: center;
}

.topbar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background-color: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #666666;
  font-size: 0.9rem;
  font-family: "Signika", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #f5f5f5;
  border-color: #cddc39;
  color: #292929;
}

.logout-icon {
  font-size: 1rem;
}

.logout-text {
  font-weight: 500;
}
</style>
