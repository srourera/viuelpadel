<script lang="ts">
import ApiService from "@/services/ApiService";
import type { INewClientPayload, IClient } from "@/interfaces/Client";

export default {
  name: "EditClientView",
  data() {
    return {
      client: null as IClient | null,
      form: {
        name: "",
        responsible_name: "",
        address1: "",
        address2: "",
        email: "",
        phone: "",
        id_type: "",
        id_value: "",
        bank_client_reference: "",
        bank_mandate_reference: "",
        bank_mandate_signed_at: "",
        iban: "",
      } as INewClientPayload,
      loading: true,
      saving: false,
      error: "",
      success: false,
    };
  },
  async mounted() {
    await this.fetchClient();
  },
  methods: {
    getClientIdFromRoute(): number {
      const routeParam = this.$route.params.clientId as string;
      return parseInt(routeParam, 10);
    },
    async fetchClient() {
      try {
        this.loading = true;
        this.error = "";
        const clientId = this.getClientIdFromRoute();
        this.client = await ApiService.getClient(clientId);
        this.loadFormData();
      } catch (err) {
        this.error = "Error al cargar el cliente. Por favor, intenta de nuevo.";
        console.error("Error fetching client:", err);
      } finally {
        this.loading = false;
      }
    },
    loadFormData() {
      if (!this.client) return;

      // Convertir fecha de ISO a dd/mm/yyyy si existe
      let fechaFormateada = "";
      if (this.client.bank_mandate_signed_at) {
        const fecha = this.client.bank_mandate_signed_at;
        if (fecha.includes("-") && fecha.length === 10) {
          const parts = fecha.split("-");
          fechaFormateada = `${parts[2]}/${parts[1]}/${parts[0]}`;
        } else {
          fechaFormateada = fecha;
        }
      }

      this.form = {
        name: this.client.name || "",
        responsible_name: this.client.responsible?.name || "",
        address1: this.client.address1 || "",
        address2: this.client.address2 || "",
        email: this.client.email || "",
        phone: this.client.phone || "",
        id_type: this.client.id_type || "",
        id_value: this.client.id_value || "",
        bank_client_reference: this.client.bank_client_reference || "",
        bank_mandate_reference: this.client.bank_mandate_reference || "",
        bank_mandate_signed_at: fechaFormateada,
        iban: this.client.iban || "",
      };
    },
    async submitForm() {
      // Validar campos requeridos básicos
      if (!this.form.name) {
        this.error = "Por favor, introduce el nombre del cliente.";
        return;
      }

      this.saving = true;
      this.error = "";
      this.success = false;

      try {
        // Convertir fecha de dd/mm/aaaa a formato ISO si está presente
        let formattedDate = this.form.bank_mandate_signed_at;
        if (formattedDate) {
          const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
          if (dateRegex.test(formattedDate)) {
            const dateParts = formattedDate.split("/");
            formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
          }
        }

        const payload: INewClientPayload = {
          ...this.form,
          bank_mandate_signed_at: formattedDate,
        };

        await ApiService.editClient(payload);

        this.success = true;

        // Redirigir después de 2 segundos
        setTimeout(() => {
          if (this.client) {
            location.href = `/client/${this.client.id}`;
          }
        }, 2000);
      } catch (err) {
        this.error = "Error al editar el cliente. Por favor, intenta de nuevo.";
        console.error("Error editing client:", err);
      } finally {
        this.saving = false;
      }
    },
    formatDateInput(event: Event) {
      const input = event.target as HTMLInputElement;
      let value = input.value.replace(/\D/g, ""); // Solo números

      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2);
      }
      if (value.length >= 5) {
        value = value.substring(0, 5) + "/" + value.substring(5, 9);
      }

      this.form.bank_mandate_signed_at = value;
    },
  },
};
</script>

<template>
  <div class="edit-client-view">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando cliente...</p>
    </div>

    <div v-else-if="error && !client" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchClient" class="retry-button">Reintentar</button>
    </div>

    <div v-else class="edit-client-container">
      <div class="edit-client-header">
        <h1 class="edit-client-title">Editar client</h1>
        <p class="edit-client-subtitle">{{ client?.name }}</p>
      </div>

      <form @submit.prevent="submitForm" class="edit-client-form">
        <div class="form-group">
          <label for="client" class="form-label">
            Client <span class="required">*</span>
          </label>
          <input
            id="client"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="Nom del client"
            required
          />
        </div>

        <div class="form-group">
          <label for="nom-responsable" class="form-label">
            Nom Responsable
          </label>
          <input
            id="nom-responsable"
            v-model="form.responsible_name"
            type="text"
            class="form-input"
            placeholder="Nom del responsable"
          />
        </div>

        <div class="form-group">
          <label for="direccio1" class="form-label">Direcció 1</label>
          <input
            id="direccio1"
            v-model="form.address1"
            type="text"
            class="form-input"
            placeholder="Primera línia de direcció"
          />
        </div>

        <div class="form-group">
          <label for="direccio2" class="form-label">Direcció 2</label>
          <input
            id="direccio2"
            v-model="form.address2"
            type="text"
            class="form-input"
            placeholder="Segona línia de direcció"
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="email@exemple.com"
          />
        </div>

        <div class="form-group">
          <label for="telefon" class="form-label">Telèfon</label>
          <input
            id="telefon"
            v-model="form.phone"
            type="tel"
            class="form-input"
            placeholder="Telèfon de contacte"
          />
        </div>

        <div class="form-group">
          <label for="id-type" class="form-label">ID Type</label>
          <input
            id="id-type"
            v-model="form.id_type"
            type="text"
            class="form-input"
            placeholder="Tipus d'identificació"
          />
        </div>

        <div class="form-group">
          <label for="id-value" class="form-label">ID Value</label>
          <input
            id="id-value"
            v-model="form.id_value"
            type="text"
            class="form-input"
            placeholder="Valor de l'identificació"
          />
        </div>

        <div class="form-group">
          <label for="referencia-client" class="form-label">
            Referència Client
          </label>
          <input
            id="referencia-client"
            v-model="form.bank_client_reference"
            type="text"
            class="form-input"
            placeholder="Referència del client"
          />
        </div>

        <div class="form-group">
          <label for="referencia-mandat" class="form-label">
            Referència Mandat
          </label>
          <input
            id="referencia-mandat"
            v-model="form.bank_mandate_reference"
            type="text"
            class="form-input"
            placeholder="Referència del mandat"
          />
        </div>

        <div class="form-group">
          <label for="data-firma-mandat" class="form-label">
            Data Firma Mandat
          </label>
          <div class="date-input-wrapper">
            <input
              id="data-firma-mandat"
              v-model="form.bank_mandate_signed_at"
              @input="formatDateInput"
              type="text"
              class="form-input date-input"
              placeholder="dd/mm/aaaa"
              maxlength="10"
            />
            <span class="date-icon">📅</span>
          </div>
        </div>

        <div class="form-group">
          <label for="iban" class="form-label">IBAN</label>
          <input
            id="iban"
            v-model="form.iban"
            type="text"
            class="form-input"
            placeholder="IBAN del compte bancari"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          Client editat correctament. Redirigint...
        </div>

        <button type="submit" class="submit-button" :disabled="saving">
          <span v-if="saving">Guardant...</span>
          <span v-else>Guardar Canvis</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-client-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #666666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #cddc39;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #d32f2f;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.retry-button {
  padding: 0.625rem 1.5rem;
  background-color: #cddc39;
  color: #292929;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: "Signika", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background-color: #b8c837;
}

.edit-client-container {
  max-width: 600px;
}

.edit-client-header {
  margin-bottom: 1.5rem;
}

.edit-client-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0 0 0.5rem 0;
}

.edit-client-subtitle {
  font-size: 1rem;
  color: #666666;
  margin: 0;
}

.edit-client-form {
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
  font-size: 0.9rem;
  font-weight: 500;
  color: #292929;
}

.required {
  color: #ff6b6b;
}

.form-input {
  padding: 0.625rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: "Signika", sans-serif;
  color: #292929;
  background-color: #fff;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #cddc39;
  box-shadow: 0 0 0 3px rgba(205, 220, 57, 0.1);
}

.form-input::placeholder {
  color: #999;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input {
  padding-right: 2.5rem;
}

.date-icon {
  position: absolute;
  right: 0.75rem;
  font-size: 1.2rem;
  pointer-events: none;
  color: #666;
}

.error-message {
  padding: 0.75rem 1rem;
  background-color: #ffebee;
  color: #d32f2f;
  border-radius: 4px;
  font-size: 0.9rem;
  border: 1px solid #ffcdd2;
}

.success-message {
  padding: 0.75rem 1rem;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  font-size: 0.9rem;
  border: 1px solid #c8e6c9;
}

.submit-button {
  padding: 0.625rem 1.5rem;
  background-color: #cddc39;
  color: #292929;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: "Signika", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background-color: #b8c837;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

