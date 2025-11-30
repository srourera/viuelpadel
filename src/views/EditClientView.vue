<script lang="ts">
import ApiService from "@/services/ApiService";
import type {
  INewClientPayload,
  IClient,
  IResponsibleListItem,
} from "@/interfaces/Client";

export default {
  name: "EditClientView",
  data() {
    return {
      client: null as IClient | null,
      form: {
        name: "",
        responsibleId: undefined as number | undefined,
        responsibleName: "",
        address1: "",
        address2: "",
        email: "",
        phone: "",
        idType: "",
        idValue: "",
        bankClientReference: "",
        bankMandateReference: "",
        bankMandateSignedAt: "",
        iban: "",
      } as INewClientPayload,
      responsibles: [] as IResponsibleListItem[],
      responsibleType: "existing" as "existing" | "new",
      loading: true,
      loadingResponsibles: false,
      saving: false,
      error: "",
      success: false,
      nameEditable: false,
    };
  },
  async mounted() {
    await Promise.all([this.fetchClient(), this.fetchResponsibles()]);
  },
  watch: {
    "form.name"(newValue: string) {
      // Auto-rellenar referencias con el nombre
      this.form.bankClientReference = newValue;
      this.form.bankMandateReference = newValue;
    },
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
    async fetchResponsibles() {
      try {
        this.loadingResponsibles = true;
        const response = await ApiService.getResponsibles();
        this.responsibles = response.responsibles;
      } catch (err) {
        console.error("Error fetching responsibles:", err);
      } finally {
        this.loadingResponsibles = false;
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

      // Formatear teléfono con espacios
      let phoneFormatted = this.client.phone || "";
      if (phoneFormatted) {
        phoneFormatted = phoneFormatted.replace(/\D/g, "");
        let formatted = "";
        for (let i = 0; i < phoneFormatted.length; i += 3) {
          if (i > 0) formatted += " ";
          formatted += phoneFormatted.substring(i, i + 3);
        }
        phoneFormatted = formatted;
      }

      // Formatear IBAN con espacios
      let ibanFormatted = this.client.iban || "";
      if (ibanFormatted) {
        ibanFormatted = ibanFormatted.replace(/\s/g, "").toUpperCase();
        let formatted = "";
        for (let i = 0; i < ibanFormatted.length; i += 4) {
          if (i > 0) formatted += " ";
          formatted += ibanFormatted.substring(i, i + 4);
        }
        ibanFormatted = formatted;
      }

      // Determinar tipo de responsable
      if (this.client.responsible?.id) {
        this.responsibleType = "existing";
        this.form.responsibleId = this.client.responsible.id;
      } else if (this.client.responsible?.name) {
        this.responsibleType = "new";
        this.form.responsibleName = this.client.responsible.name;
      }

      this.form = {
        name: this.client.name || "",
        responsibleId: this.client.responsible?.id,
        responsibleName: this.client.responsible?.name || "",
        address1: this.client.address1 || "",
        address2: this.client.address2 || "",
        email: this.client.email || "",
        phone: phoneFormatted,
        idType: this.client.id_type || "",
        idValue: this.client.id_value || "",
        bankClientReference: this.client.bank_client_reference || "",
        bankMandateReference: this.client.bank_mandate_reference || "",
        bankMandateSignedAt: fechaFormateada,
        iban: ibanFormatted,
      };
    },
    async submitForm() {
      if (!this.client) return;
      // Validar campos requeridos básicos
      if (!this.form.name) {
        this.error = "Por favor, introduce el nombre del cliente.";
        return;
      }

      // Validar responsable
      if (this.responsibleType === "existing" && !this.form.responsibleId) {
        this.error = "Por favor, selecciona un responsable existente.";
        return;
      }
      if (this.responsibleType === "new" && !this.form.responsibleName) {
        this.error = "Por favor, introduce el nombre del responsable.";
        return;
      }

      // Validar dirección 1
      if (!this.form.address1) {
        this.error = "Por favor, introduce la dirección 1.";
        return;
      }

      // Validar dirección 2
      if (!this.form.address2) {
        this.error = "Por favor, introduce la dirección 2.";
        return;
      }

      // Validar email
      if (!this.form.email) {
        this.error = "Por favor, introduce el email.";
        return;
      }

      // Validar teléfono
      if (!this.form.phone) {
        this.error = "Por favor, introduce el teléfono.";
        return;
      }

      // Validar ID Type
      if (!this.form.idType) {
        this.error = "Por favor, selecciona un tipo de ID.";
        return;
      }

      // Validar ID Value
      if (!this.form.idValue) {
        this.error = "Por favor, introduce el valor del ID.";
        return;
      }

      // Validar campos bancarios si IBAN está presente
      const ibanTrimmed = (this.form.iban || "").replace(/\s/g, "");
      if (ibanTrimmed) {
        if (!this.form.bankClientReference) {
          this.error = "Por favor, introduce la referencia del cliente.";
          return;
        }
        if (!this.form.bankMandateReference) {
          this.error = "Por favor, introduce la referencia del mandato.";
          return;
        }
        if (!this.form.bankMandateSignedAt) {
          this.error = "Por favor, introduce la fecha de firma del mandato.";
          return;
        }
      }

      this.saving = true;
      this.error = "";
      this.success = false;

      try {
        // Preparar payload: eliminar responsibleId o responsibleName según el tipo
        const ibanTrimmed = (this.form.iban || "").replace(/\s/g, ""); // Eliminar espacios del IBAN

        const payload: INewClientPayload = {
          id: this.client.id,
          name: this.form.name,
          address1: this.form.address1,
          address2: this.form.address2,
          email: this.form.email,
          phone: this.form.phone.replace(/\s/g, ""), // Eliminar espacios del teléfono
          idType: this.form.idType,
          idValue: this.form.idValue,
          iban: ibanTrimmed || null,
          // Solo incluir campos bancarios si IBAN no está vacío, sino enviar null
          bankClientReference: ibanTrimmed
            ? this.form.bankClientReference
            : null,
          bankMandateReference: ibanTrimmed
            ? this.form.bankMandateReference
            : null,
          bankMandateSignedAt: ibanTrimmed
            ? this.form.bankMandateSignedAt
            : null, // Enviar en formato dd/mm/yyyy
        };

        // Agregar responsibleId o responsibleName según el tipo seleccionado
        if (this.responsibleType === "existing" && this.form.responsibleId) {
          payload.responsibleId = this.form.responsibleId;
        } else if (
          this.responsibleType === "new" &&
          this.form.responsibleName
        ) {
          payload.responsibleName = this.form.responsibleName;
        }

        await ApiService.editClient(payload);

        this.success = true;

        // Redirigir después de 500 milisegundos
        setTimeout(() => {
          if (this.client) {
            location.href = `/client/${this.client.id}`;
          }
        }, 500);
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

      this.form.bankMandateSignedAt = value;
    },
    formatPhoneInput(event: Event) {
      const input = event.target as HTMLInputElement;
      let value = input.value.replace(/\D/g, ""); // Solo números

      // Limitar a 9 dígitos
      if (value.length > 9) {
        value = value.substring(0, 9);
      }

      // Formatear en grupos de 3 dígitos
      if (value.length > 0) {
        let formatted = "";
        for (let i = 0; i < value.length; i += 3) {
          if (i > 0) formatted += " ";
          formatted += value.substring(i, i + 3);
        }
        value = formatted;
      }

      this.form.phone = value;
    },
    formatIbanInput(event: Event) {
      const input = event.target as HTMLInputElement;
      let value = input.value.replace(/\s/g, "").toUpperCase(); // Eliminar espacios y convertir a mayúsculas

      // Limitar a 24 caracteres (IBAN español: 2 letras + 22 dígitos)
      if (value.length > 24) {
        value = value.substring(0, 24);
      }

      // Formatear IBAN en grupos de 4 caracteres
      if (value.length > 0) {
        let formatted = "";
        for (let i = 0; i < value.length; i += 4) {
          if (i > 0) formatted += " ";
          formatted += value.substring(i, i + 4);
        }
        value = formatted;
      }

      this.form.iban = value;
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
        <h1 class="edit-client-title">Editar cliente</h1>
        <p class="edit-client-subtitle">{{ client?.name }}</p>
      </div>

      <form @submit.prevent="submitForm" class="edit-client-form">
        <div class="form-group">
          <label for="client" class="form-label">
            Cliente <span class="required">*</span>
          </label>
          <div v-if="!nameEditable" class="name-edit-warning">
            <p class="warning-text">
              Al editar Nombre, se edita Referencia cliente y Referencia
              Mandato.
            </p>
            <button
              type="button"
              class="edit-name-button"
              @click="nameEditable = true"
            >
              Editar igualmente
            </button>
          </div>
          <input
            id="client"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="Nombre del cliente"
            :readonly="!nameEditable"
            required
          />
        </div>

        <div class="form-group">
          <label for="responsable" class="form-label">
            Responsable <span class="required">*</span>
          </label>
          <div class="switch-container">
            <button
              type="button"
              :class="[
                'switch-option',
                { active: responsibleType === 'existing' },
              ]"
              @click="responsibleType = 'existing'"
            >
              Existente
            </button>
            <button
              type="button"
              :class="['switch-option', { active: responsibleType === 'new' }]"
              @click="responsibleType = 'new'"
            >
              Nuevo
            </button>
          </div>
          <select
            v-if="responsibleType === 'existing'"
            v-model="form.responsibleId"
            class="form-input"
            :disabled="loadingResponsibles"
            required
          >
            <option value="" disabled>Selecciona un responsable</option>
            <option
              v-for="responsible in responsibles"
              :key="responsible.id"
              :value="responsible.id"
            >
              {{ responsible.name }}
            </option>
          </select>
          <input
            v-if="responsibleType === 'new'"
            v-model="form.responsibleName"
            type="text"
            class="form-input"
            placeholder="Nombre del responsable"
            required
          />
        </div>

        <div class="form-group">
          <label for="direccio1" class="form-label">
            Dirección 1 <span class="required">*</span>
          </label>
          <input
            id="direccio1"
            v-model="form.address1"
            type="text"
            class="form-input"
            placeholder="Primera línea de dirección"
            required
          />
        </div>

        <div class="form-group">
          <label for="direccio2" class="form-label">
            Dirección 2 <span class="required">*</span>
          </label>
          <input
            id="direccio2"
            v-model="form.address2"
            type="text"
            class="form-input"
            placeholder="Segunda línea de dirección"
            required
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">
            Email <span class="required">*</span>
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="email@exemple.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="telefon" class="form-label">
            Teléfono <span class="required">*</span>
          </label>
          <input
            id="telefon"
            v-model="form.phone"
            @input="formatPhoneInput"
            type="tel"
            class="form-input"
            placeholder="Teléfono de contacto"
            required
          />
        </div>

        <div class="form-group">
          <label for="id-type" class="form-label">
            ID Type <span class="required">*</span>
          </label>
          <select
            id="id-type"
            v-model="form.idType"
            class="form-input"
            required
          >
            <option value="" disabled>Selecciona un tipo</option>
            <option value="DNI">DNI</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
        </div>

        <div class="form-group">
          <label for="id-value" class="form-label">
            ID Value <span class="required">*</span>
          </label>
          <input
            id="id-value"
            v-model="form.idValue"
            type="text"
            class="form-input"
            placeholder="Valor de la identificación"
            required
          />
        </div>

        <div class="form-group">
          <label for="iban" class="form-label">IBAN</label>
          <input
            id="iban"
            v-model="form.iban"
            @input="formatIbanInput"
            type="text"
            class="form-input"
            placeholder="IBAN de la cuenta bancaria"
          />
        </div>

        <div v-if="form.iban && form.iban.trim()" class="form-group">
          <label for="referencia-client" class="form-label">
            Referencia Cliente <span class="required">*</span>
          </label>
          <input
            id="referencia-client"
            v-model="form.bankClientReference"
            type="text"
            class="form-input"
            placeholder="Referencia del cliente"
            readonly
            required
          />
        </div>

        <div v-if="form.iban && form.iban.trim()" class="form-group">
          <label for="referencia-mandat" class="form-label">
            Referencia Mandato <span class="required">*</span>
          </label>
          <input
            id="referencia-mandat"
            v-model="form.bankMandateReference"
            type="text"
            class="form-input"
            placeholder="Referencia del mandato"
            readonly
            required
          />
        </div>

        <div v-if="form.iban && form.iban.trim()" class="form-group">
          <label for="data-firma-mandat" class="form-label">
            Fecha Firma Mandato <span class="required">*</span>
          </label>
          <div class="date-input-wrapper">
            <input
              id="data-firma-mandat"
              v-model="form.bankMandateSignedAt"
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
          Cliente editado correctamente. Redirigiendo...
        </div>

        <button type="submit" class="submit-button" :disabled="saving">
          <span v-if="saving">Guardando...</span>
          <span v-else>Guardar Cambios</span>
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

.form-input[readonly] {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.name-edit-warning {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.warning-text {
  margin: 0;
  font-size: 0.8rem;
  color: #999;
  line-height: 1.4;
  flex: 1;
  min-width: 200px;
}

.edit-name-button {
  padding: 0.25rem 0.75rem;
  background-color: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 400;
  font-family: "Signika", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.edit-name-button:hover {
  background-color: #f5f5f5;
  border-color: #cddc39;
  color: #292929;
}

.switch-container {
  display: flex;
  gap: 0.25rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 0.15rem;
  margin-bottom: 0.5rem;
}

.switch-option {
  flex: 1;
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 3px;
  font-size: 0.85rem;
  font-weight: 500;
  font-family: "Signika", sans-serif;
  color: #666666;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.switch-option:hover {
  background-color: rgba(205, 220, 57, 0.1);
}

.switch-option.active {
  background-color: #cddc39;
  color: #292929;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
