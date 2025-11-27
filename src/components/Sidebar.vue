<script lang="ts">
export default {
  name: "AppSidebar",
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <img
        src="https://res.cloudinary.com/srourera/image/upload/t_700/v1762816426/ANAGRAMA_JUGADOR_VIU_EL_PADEL_jsbwuo.png"
        alt="Viu el Padel Logo"
        class="sidebar-logo"
        :class="{ 'sidebar-logo-collapsed': isCollapsed }"
      />
    </div>
    <nav class="sidebar-nav">
      <router-link
        to="/"
        class="nav-item"
        active-class="active"
        :title="isCollapsed ? 'Inicio' : ''"
      >
        <span class="nav-icon">🏠</span>
        <span class="nav-text" v-if="!isCollapsed">Inicio</span>
      </router-link>
      <router-link
        to="/clients"
        class="nav-item"
        active-class="active"
        :title="isCollapsed ? 'Clientes' : ''"
      >
        <span class="nav-icon">👥</span>
        <span class="nav-text" v-if="!isCollapsed">Clientes</span>
      </router-link>
      <router-link
        to="/invoices"
        class="nav-item"
        active-class="active"
        :title="isCollapsed ? 'Facturas' : ''"
      >
        <span class="nav-icon">🧾</span>
        <span class="nav-text" v-if="!isCollapsed">Facturas</span>
      </router-link>
      <router-link
        to="/remesas"
        class="nav-item"
        active-class="active"
        :title="isCollapsed ? 'Remesas' : ''"
      >
        <span class="nav-icon">💳</span>
        <span class="nav-text" v-if="!isCollapsed">Remesas</span>
      </router-link>
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
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  height: 70px;
  padding: 0 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: padding 0.3s ease;
}

.sidebar.collapsed .sidebar-header {
  padding: 0;
}

.sidebar-logo {
  max-width: 100%;
  height: 50px;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .sidebar-logo {
  height: 40px;
}

.sidebar-logo-icon {
  font-size: 1.5rem;
  font-weight: 700;
  color: #cddc39;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #f5f5f5;
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
  position: relative;
  white-space: nowrap;
}

.sidebar.collapsed .nav-item {
  padding: 0.875rem;
  justify-content: center;
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
  flex-shrink: 0;
}

.sidebar.collapsed .nav-icon {
  width: auto;
}

.nav-text {
  font-size: 0.95rem;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .nav-text {
  display: none;
}

/* Responsive: colapsar automáticamente en pantallas pequeñas */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .sidebar:not(.collapsed) {
    width: 200px;
  }

  .sidebar-header {
    padding: 0;
  }

  .sidebar:not(.collapsed) .sidebar-header {
    padding: 0 1.5rem;
  }

  .sidebar:not(.collapsed) .sidebar-logo {
    display: block;
  }

  .sidebar-logo-icon {
    display: flex;
  }

  .sidebar:not(.collapsed) .sidebar-logo-icon {
    display: none;
  }

  .nav-item {
    padding: 0.875rem;
    justify-content: center;
  }

  .sidebar:not(.collapsed) .nav-item {
    padding: 0.875rem 1.5rem;
    justify-content: flex-start;
  }

  .nav-text {
    display: none;
  }

  .sidebar:not(.collapsed) .nav-text {
    display: block;
  }
}
</style>
