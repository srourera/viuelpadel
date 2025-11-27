<script lang="ts">
import ApiService from "@/services/ApiService";
import type { IClientListItem } from "@/interfaces/Client";

interface ManualInvoiceForm {
  client: string;
  import: string;
  concepte: string;
  metodePagament: string;
  venciment: string;
}

export default {
  name: "ManualInvoiceView",
  data() {
    return {
      form: {
        client: "",
        import: "",
        concepte: "",
        metodePagament: "",
        venciment: "",
      } as ManualInvoiceForm,
      clients: [] as IClientListItem[],
      loadingClients: true,
      loading: false,
      error: "",
      success: false,
    };
  },
  async mounted() {
    await this.fetchClients();
  },
  methods: {
    async fetchClients() {
      try {
        this.loadingClients = true;
        const response = await ApiService.getClients();
        this.clients = response.clients;
      } catch (err) {
        this.error =
          "Error al cargar los clientes. Por favor, intenta de nuevo.";
        console.error("Error fetching clients:", err);
      } finally {
        this.loadingClients = false;
      }
    },
    async submitForm() {
      // Validar campos requeridos
      if (
        !this.form.client ||
        !this.form.import ||
        !this.form.concepte ||
        !this.form.metodePagament ||
        !this.form.venciment
      ) {
        this.error = "Por favor, completa todos los campos requeridos.";
        return;
      }

      // Validar formato de fecha
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(this.form.venciment)) {
        this.error = "Por favor, introduce una fecha válida (dd/mm/aaaa).";
        return;
      }

      // Validar importe
      const importValue = parseFloat(this.form.import);
      if (isNaN(importValue) || importValue <= 0) {
        this.error = "Por favor, introduce un importe válido.";
        return;
      }

      this.loading = true;
      this.error = "";
      this.success = false;

      try {
        // Convertir fecha de dd/mm/aaaa a formato ISO (YYYY-MM-DD)
        const dateParts = this.form.venciment.split("/");
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        // Construir el payload en el formato requerido
        const payload = {
          Client: this.form.client,
          "Import (IVA inclòs)": importValue,
          Concepte: this.form.concepte,
          "Mètode pagament": this.form.metodePagament,
          Venciment: formattedDate,
        };

        await ApiService.createManualInvoice(payload);

        this.success = true;
        // Limpiar formulario
        this.form = {
          client: "",
          import: "",
          concepte: "",
          metodePagament: "",
          venciment: "",
        };

        // Redirigir después de 2 segundos
        setTimeout(() => {
          location.href = "/invoices";
        }, 2000);
      } catch (err) {
        this.error =
          "Error al generar la factura. Por favor, intenta de nuevo.";
        console.error("Error creating manual invoice:", err);
      } finally {
        this.loading = false;
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

      this.form.venciment = value;
    },
  },
};
</script>

<template>
  <div class="manual-invoice-view">
    <div class="manual-invoice-container">
      <div class="manual-invoice-header">
        <h1 class="manual-invoice-title">Nova factura manual</h1>
        <p class="manual-invoice-subtitle">Generació de factura manual</p>
      </div>

      <form @submit.prevent="submitForm" class="manual-invoice-form">
        <div class="form-group">
          <label for="client" class="form-label">
            Client <span class="required">*</span>
          </label>
          <select
            id="client"
            v-model="form.client"
            class="form-input form-select"
            required
            :disabled="loadingClients"
          >
            <option value="" disabled>
              {{
                loadingClients ? "Carregant clients..." : "Selecciona un client"
              }}
            </option>
            <option
              v-for="client in clients"
              :key="client.Client"
              :value="client.Client"
            >
              {{ client.Client }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="import" class="form-label">
            Import (IVA inclòs) <span class="required">*</span>
          </label>
          <input
            id="import"
            v-model="form.import"
            type="number"
            step="0.01"
            min="0"
            class="form-input"
            placeholder="0.00"
            required
          />
        </div>

        <div class="form-group">
          <label for="concepte" class="form-label">
            Concepte <span class="required">*</span>
          </label>
          <input
            id="concepte"
            v-model="form.concepte"
            type="text"
            class="form-input"
            placeholder="Descripció del concepte"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            Mètode pagament <span class="required">*</span>
          </label>
          <div class="radio-group">
            <label class="radio-label">
              <input
                v-model="form.metodePagament"
                type="radio"
                value="Gir bancari"
                class="radio-input"
                required
              />
              <span class="radio-text">Gir bancari</span>
            </label>
            <label class="radio-label">
              <input
                v-model="form.metodePagament"
                type="radio"
                value="Transferència"
                class="radio-input"
                required
              />
              <span class="radio-text">Transferència</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="venciment" class="form-label">
            Venciment <span class="required">*</span>
          </label>
          <div class="date-input-wrapper">
            <input
              id="venciment"
              v-model="form.venciment"
              @input="formatDateInput"
              type="text"
              class="form-input date-input"
              placeholder="dd/mm/aaaa"
              maxlength="10"
              required
            />
            <span class="date-icon">📅</span>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          Factura generada correctament. Redirigint...
        </div>

        <button type="submit" class="submit-button" :disabled="loading">
          <span v-if="loading">Generant...</span>
          <span v-else>Generar Factura</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.manual-invoice-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.manual-invoice-container {
  max-width: 600px;
}

.manual-invoice-header {
  margin-bottom: 1.5rem;
}

.manual-invoice-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0 0 0.5rem 0;
}

.manual-invoice-subtitle {
  font-size: 1rem;
  color: #666666;
  margin: 0;
}

.manual-invoice-form {
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

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.radio-label:hover {
  background-color: #f5f5f5;
}

.radio-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #cddc39;
}

.radio-text {
  font-size: 0.9rem;
  color: #292929;
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
