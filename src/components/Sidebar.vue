<script lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getPreviousRoute } from "../router/index";

export default {
  name: "AppSidebar",
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const isMainPage = computed(() => {
      return route.meta.isMainPage === true;
    });

    const handleBack = () => {
      // Intentar usar el historial del navegador primero (más confiable)
      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      // Si no hay historial del navegador, usar nuestro historial interno
      const previousRouteFromHistory = getPreviousRoute(route.fullPath);

      if (previousRouteFromHistory) {
        router.push(previousRouteFromHistory);
        return;
      }

      // Si no hay historial, usar el fallback definido en los metadatos
      const fallbackRoute = route.meta.fallbackRoute as string | undefined;
      if (fallbackRoute) {
        router.push(fallbackRoute);
      } else {
        // Fallback por defecto si no hay uno definido
        router.push("/");
      }
    };

    return {
      isMainPage,
      handleBack,
    };
  },
};
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <!-- Logo: solo se muestra si es página principal -->
      <img
        v-if="isMainPage"
        src="https://res.cloudinary.com/srourera/image/upload/t_700/v1762816426/ANAGRAMA_JUGADOR_VIU_EL_PADEL_jsbwuo.png"
        alt="Viu el Padel Logo"
        class="sidebar-logo"
        :class="{ 'sidebar-logo-collapsed': isCollapsed }"
      />
      <!-- Botón Volver: se muestra si NO es página principal -->
      <button
        v-else
        @click="handleBack"
        class="back-button"
        :title="isCollapsed ? 'Volver' : ''"
      >
        <span class="back-icon">←</span>
        <span class="back-text" v-if="!isCollapsed">Volver</span>
      </button>
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
        to="/remittance-types"
        class="nav-item"
        active-class="active"
        :title="isCollapsed ? 'Remesas' : ''"
      >
        <span class="nav-icon">💳</span>
        <span class="nav-text" v-if="!isCollapsed">Remesas</span>
      </router-link>
    </nav>
    <div class="sidebar-footer">
      <router-link
        to="/sergy"
        class="nav-item nav-item-footer"
        active-class="active"
        :title="isCollapsed ? 'Sergy' : ''"
      >
        <span class="nav-icon">🤖</span>
        <span class="nav-text" v-if="!isCollapsed">Sergy</span>
      </router-link>
    </div>
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

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 100%;
  min-height: 50px;
}

.back-button:hover {
  background-color: #f5f5f5;
  border-color: #cddc39;
  color: #292929;
}

.sidebar.collapsed .back-button {
  padding: 0.625rem;
  width: 40px;
  min-height: 40px;
}

.back-icon {
  font-size: 1.5rem;
  font-weight: 600;
  flex-shrink: 0;
}

.back-text {
  font-weight: 500;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.sidebar-footer {
  padding: 1rem 0;
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
  flex-shrink: 0;
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
