<script lang="ts">
import { RouterView } from "vue-router";
import AdminLogin from "./components/AdminLogin.vue";
import AdminLoading from "./components/AdminLoading.vue";
import Sidebar from "./components/Sidebar.vue";
import TopBar from "./components/TopBar.vue";
import AuthService from "./services/AuthService";
import PWAService from "./services/PWAService";

export default {
  name: "App",
  components: {
    RouterView,
    AdminLogin,
    AdminLoading,
    Sidebar,
    TopBar,
  },
  data() {
    return {
      loadingAuth: true,
      isAuthenticated: false,
      isSidebarCollapsed: false,
      pwaMode: PWAService.isStandalone(),
    };
  },
  async mounted() {
    await this.checkAuth();
    this.checkScreenSize();
    window.addEventListener("resize", this.checkScreenSize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkScreenSize);
  },
  methods: {
    async checkAuth() {
      this.loadingAuth = true;
      this.isAuthenticated = await AuthService.isAuthenticated();
      this.loadingAuth = false;
    },
    checkScreenSize() {
      if (window.innerWidth <= 768) {
        this.isSidebarCollapsed = true;
      } else {
        this.isSidebarCollapsed = false;
      }
    },
  },
};
</script>

<template>
  <div>
    <template v-if="loadingAuth">
      <AdminLoading />
    </template>
    <template v-else>
      <AdminLogin v-if="!isAuthenticated" />
      <div v-else class="app-layout" :class="{ 'pwa-mode': pwaMode }">
        <Sidebar :is-collapsed="isSidebarCollapsed" :pwa-mode="pwaMode" />
        <TopBar :is-sidebar-collapsed="isSidebarCollapsed" />
        <main
          class="main-content"
          :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
        >
          <RouterView />
        </main>
      </div>
    </template>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Signika", sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  margin-left: 200px;
  margin-top: 70px;
  flex: 1;
  padding: 2rem;
  background-color: #f9f9f9;
  min-height: calc(100vh - 70px);
  max-width: 100%;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-collapsed {
  margin-left: 60px;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 60px;
    padding: 1rem;
  }

  .main-content.sidebar-collapsed {
    margin-left: 60px;
  }
}

.pwa-mode .main-content {
  margin-left: 0;
  margin-bottom: calc(60px + env(safe-area-inset-bottom));
}
</style>
