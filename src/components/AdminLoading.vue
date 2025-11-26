<script lang="ts">
export default {
  name: "AdminLoading",
};
</script>

<template>
  <div class="admin-loading">
    <div class="loading-container">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<style scoped>
.admin-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-family: "Signika", sans-serif;
}

.loading-container {
  width: 100px;
  height: 100px;
  background-image: url("https://res.cloudinary.com/srourera/image/upload/t_700/v1762816426/ANAGRAMA_JUGADOR_VIU_EL_PADEL_jsbwuo.png");
  background-size: 50%;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid #e0e0e0;
  border-top-color: #cddc39;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
