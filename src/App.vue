<script lang="ts">
import { RouterView } from "vue-router";
import AdminLogin from "./components/AdminLogin.vue";
import AdminLoading from "./components/AdminLoading.vue";
import Sidebar from "./components/Sidebar.vue";
import TopBar from "./components/TopBar.vue";
import AuthService from "./services/AuthService";

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
    };
  },
  async mounted() {
    await this.checkAuth();
  },
  methods: {
    async checkAuth() {
      this.loadingAuth = true;
      this.isAuthenticated = await AuthService.isAuthenticated();
      this.loadingAuth = false;
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
      <div v-else class="app-layout">
        <Sidebar />
        <TopBar />
        <main class="main-content">
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
}
</style>
