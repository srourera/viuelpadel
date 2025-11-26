<script lang="ts">
import AuthService from "@/services/AuthService";

export default {
  name: "HomeView",
  methods: {
    logout() {
      AuthService.logout();
    },
  },
};
</script>

<template>
  <div>HomeView</div>
  <button @click="logout()">Logout</button>
</template>

<style scoped></style>
