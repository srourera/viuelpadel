<script lang="ts">
import { RouterView } from "vue-router";
import AdminLogin from "./components/AdminLogin.vue";
import AdminLoading from "./components/AdminLoading.vue";
import AuthService from "./services/AuthService";

export default {
  name: "App",
  components: {
    RouterView,
    AdminLogin,
    AdminLoading,
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
      <main v-else>
        <RouterView />
      </main>
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
</style>
