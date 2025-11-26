<script lang="ts">
import AuthService from "../services/AuthService";

export default {
  name: "AdminLogin",
  data() {
    return {
      adminKey: "",
      error: "",
    };
  },
  methods: {
    handleSubmit() {
      if (!this.adminKey.trim()) {
        this.error = "Por favor, ingresa la clave de administrador";
        return;
      }
      AuthService.login(this.adminKey);
    },
  },
};
</script>

<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="logo-container">
        <img
          src="https://res.cloudinary.com/srourera/image/upload/t_700/v1762816426/ANAGRAMA_JUGADOR_VIU_EL_PADEL_jsbwuo.png"
          alt="Viu el Padel Logo"
          class="logo"
        />
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="admin-key" class="form-label"
            >Clave de Administrador</label
          >
          <input
            id="admin-key"
            v-model="adminKey"
            type="password"
            class="form-input"
            placeholder="Ingresa la clave secreta"
            autofocus
          />
          <p v-if="error" class="error-message">{{ error }}</p>
        </div>

        <button type="submit" class="submit-button">Acceder</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.admin-login {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  display: flex;
  justify-content: center;
  padding-top: 2rem;
  z-index: 9999;
  font-family: "Signika", sans-serif;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.logo-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo {
  max-width: 100%;
  height: auto;
  object-fit: contain;
  max-height: 250px;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  color: #666666;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  font-family: "Signika", sans-serif;
  color: #292929;
  background-color: #fff;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #cddc39;
}

.form-input::placeholder {
  color: #999;
}

.error-message {
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.submit-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background-color: #cddc39;
  color: #292929;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  font-family: "Signika", sans-serif;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.1s ease;
}

.submit-button:hover {
  background-color: #b8c837;
  transform: translateY(-1px);
}

.submit-button:active {
  transform: translateY(0);
}
</style>
