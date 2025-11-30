<script lang="ts">
import ApiService from "@/services/ApiService";
import type {
  IRemittanceType,
  IRemittanceTypeClient,
} from "@/interfaces/Remittance";
import type { IClientListItem } from "@/interfaces/Client";

export default {
  name: "RemittanceTypeClientsView",
  data() {
    return {
      remittanceType: null as IRemittanceType | null,
      remittanceTypeClients: [] as IRemittanceTypeClient[],
      loading: true,
      loadingRemittanceType: false,
      loadingClients: true,
      error: "",
      errorClients: "",
      editingAmounts: {} as Record<number, number>,
      showAddClientModal: false,
      clients: [] as IClientListItem[],
      loadingClientsList: false,
      addClientForm: {
        clientId: null as number | null,
        amount: "",
      },
      addingClient: false,
      showConfirmModal: false,
      confirmModalData: {
        client: null as IRemittanceTypeClient | null,
        originalAmount: 0,
        newAmount: 0,
      },
      confirming: false,
      searchQuery: "",
    };
  },
  computed: {
    editingAmountsInEuros(): Record<number, number> {
      const result: Record<number, number> = {};
      Object.keys(this.editingAmounts).forEach((key) => {
        const id = parseInt(key, 10);
        const amount = this.editingAmounts[id];
        if (amount !== undefined) {
          result[id] = amount / 100;
        }
      });
      return result;
    },
    availableClients(): IClientListItem[] {
      const existingClientIds = new Set(
        this.remittanceTypeClients.map((rtc) => rtc.client.id)
      );
      return this.clients.filter(
        (client) => client.isActive && !existingClientIds.has(client.id)
      );
    },
    filteredRemittanceTypeClients(): IRemittanceTypeClient[] {
      if (!this.searchQuery.trim()) {
        return this.remittanceTypeClients;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.remittanceTypeClients.filter((rtc) =>
        rtc.client.name.toLowerCase().includes(query)
      );
    },
  },
  async mounted() {
    await Promise.all([
      this.fetchRemittanceType(),
      this.fetchRemittanceTypeClients(),
    ]);
  },
  methods: {
    getRemittanceTypeIdFromRoute(): number {
      const routeParam = this.$route.params.id as string;
      return parseInt(routeParam, 10);
    },
    getClientUrl(clientId: number): string {
      return `/client/${clientId}`;
    },
    async fetchRemittanceType() {
      try {
        this.loadingRemittanceType = true;
        const remittanceTypeId = this.getRemittanceTypeIdFromRoute();
        this.remittanceType = await ApiService.getRemittanceType(
          remittanceTypeId
        );
      } catch (err) {
        this.error =
          "Error al cargar la información del tipo de remesa. Por favor, intenta de nuevo.";
        console.error("Error fetching remittance type:", err);
      } finally {
        this.loadingRemittanceType = false;
        this.loading = false;
      }
    },
    async fetchRemittanceTypeClients() {
      try {
        this.loadingClients = true;
        this.errorClients = "";
        const remittanceTypeId = this.getRemittanceTypeIdFromRoute();
        const response =
          await ApiService.getRemittanceTypeClients(remittanceTypeId);
        this.remittanceTypeClients = response.remittanceTypeClients || [];
        // Inicializar los valores editables
        this.remittanceTypeClients.forEach((client) => {
          this.editingAmounts[client.id] = client.amountMinUnit;
        });
      } catch (err) {
        this.errorClients =
          "Error al cargar las cuotas de clientes. Por favor, intenta de nuevo.";
        console.error("Error fetching remittance type clients:", err);
      } finally {
        this.loadingClients = false;
        this.loading = false;
      }
    },
    formatCurrency(amountMinUnit: number): string {
      const amount = amountMinUnit / 100;
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
    },
    updateAmountInEuros(clientId: number, euros: number) {
      // Convertir euros a centavos
      this.editingAmounts[clientId] = Math.round(euros * 100);
    },
    async handleAmountBlur(client: IRemittanceTypeClient) {
      const newAmountMinUnit = this.editingAmounts[client.id];
      const originalAmountMinUnit = client.amountMinUnit;
      // Si no ha cambiado o el nuevo valor es undefined, no hacer nada
      if (
        newAmountMinUnit === undefined ||
        newAmountMinUnit === originalAmountMinUnit
      ) {
        return;
      }

      // Mostrar modal de confirmación personalizado
      this.confirmModalData = {
        client,
        originalAmount: originalAmountMinUnit,
        newAmount: newAmountMinUnit,
      };
      this.showConfirmModal = true;
    },
    async fetchClientsList() {
      try {
        this.loadingClientsList = true;
        const response = await ApiService.getClients();
        this.clients = response.clients;
      } catch (err) {
        console.error("Error fetching clients:", err);
      } finally {
        this.loadingClientsList = false;
      }
    },
    openAddClientModal() {
      this.showAddClientModal = true;
      this.addClientForm = {
        clientId: null,
        amount: "",
      };
      if (this.clients.length === 0) {
        this.fetchClientsList();
      }
    },
    closeAddClientModal() {
      this.showAddClientModal = false;
      this.addClientForm = {
        clientId: null,
        amount: "",
      };
    },
    async submitAddClient() {
      const remittanceTypeId = this.getRemittanceTypeIdFromRoute();
      if (
        !remittanceTypeId ||
        !this.addClientForm.clientId ||
        !this.addClientForm.amount
      ) {
        return;
      }

      try {
        this.addingClient = true;
        const amountMinUnit = Math.round(
          parseFloat(this.addClientForm.amount) * 100
        );
        await ApiService.addRemittanceTypeClient(
          remittanceTypeId,
          this.addClientForm.clientId,
          amountMinUnit
        );
        // Limpiar caché y recargar los clientes
        ApiService.clearCache();
        await this.fetchRemittanceTypeClients();
        this.closeAddClientModal();
      } catch (err) {
        alert("Error al añadir el cliente. Por favor, intenta de nuevo.");
        console.error("Error adding remittance type client:", err);
      } finally {
        this.addingClient = false;
      }
    },
    closeConfirmModal() {
      this.showConfirmModal = false;
      // Revertir el valor si se cancela
      if (this.confirmModalData.client) {
        this.editingAmounts[this.confirmModalData.client.id] =
          this.confirmModalData.originalAmount;
      }
      this.confirmModalData = {
        client: null,
        originalAmount: 0,
        newAmount: 0,
      };
    },
    async confirmUpdateAmount() {
      if (!this.confirmModalData.client) return;

      try {
        this.confirming = true;
        await ApiService.updateRemittanceTypeClient(
          this.confirmModalData.client.id,
          this.confirmModalData.newAmount
        );
        // Limpiar caché y recargar los clientes
        ApiService.clearCache();
        await this.fetchRemittanceTypeClients();
        this.showConfirmModal = false;
        this.confirmModalData = {
          client: null,
          originalAmount: 0,
          newAmount: 0,
        };
      } catch (err) {
        // Revertir el valor en caso de error
        if (this.confirmModalData.client) {
          this.editingAmounts[this.confirmModalData.client.id] =
            this.confirmModalData.originalAmount;
        }
        alert("Error al actualizar el importe. Por favor, intenta de nuevo.");
        console.error("Error updating remittance type client:", err);
      } finally {
        this.confirming = false;
      }
    },
  },
};
</script>

<template>
  <div class="remittance-type-clients-view">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando información...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchRemittanceType" class="retry-button">
        Reintentar
      </button>
    </div>

    <div v-else-if="remittanceType">
      <div class="remittance-type-header">
        <div class="remittance-type-title-section">
          <h1 class="remittance-type-title">
            <span class="remittance-type-icon">{{ remittanceType.icon }}</span>
            {{ remittanceType.name }} - Cuotas de clientes
          </h1>
          <p class="info-text">
            Los cambios que hagas afectarán a las siguientes remesas. Nunca
            afectarán a remesas ya generadas.
          </p>
        </div>
      </div>

      <div class="remittance-type-clients-section">
        <div class="remittance-type-clients-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">Clientes</h2>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre..."
              class="search-input"
            />
          </div>
          <button
            @click="openAddClientModal"
            class="add-client-button"
          >
            + Añadir cliente
          </button>
        </div>

        <div v-if="loadingClients" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando clientes...</p>
        </div>

        <div v-else-if="errorClients" class="error-state">
          <p class="error-message">{{ errorClients }}</p>
          <button @click="fetchRemittanceTypeClients" class="retry-button">
            Reintentar
          </button>
        </div>

        <div
          v-else-if="remittanceTypeClients.length === 0"
          class="empty-state"
        >
          <p>No hay clientes disponibles.</p>
        </div>

        <div
          v-else-if="filteredRemittanceTypeClients.length === 0"
          class="empty-state"
        >
          <p>No se encontraron clientes con ese nombre.</p>
        </div>

        <div v-else class="remittance-type-clients-table-container">
          <table class="remittance-type-clients-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th class="text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="client in filteredRemittanceTypeClients"
                :key="client.id"
              >
                <td class="client-name-cell">
                  <div class="client-name">
                    <router-link
                      :to="getClientUrl(client.client.id)"
                      class="client-link"
                    >
                      {{ client.client.name }}
                    </router-link>
                    <span
                      v-if="!client.client.isActive"
                      class="inactive-badge"
                      >⚪️</span
                    >
                  </div>
                </td>
                <td class="amount-cell">
                  <input
                    :value="editingAmountsInEuros[client.id]"
                    @input="
                      updateAmountInEuros(
                        client.id,
                        parseFloat(($event.target as HTMLInputElement).value) ||
                          0
                      )
                    "
                    @blur="handleAmountBlur(client)"
                    type="number"
                    step="0.01"
                    min="0"
                    class="amount-input"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para añadir cliente -->
    <div
      v-if="showAddClientModal"
      class="modal-overlay"
      @click="closeAddClientModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Añadir cliente</h2>
          <button @click="closeAddClientModal" class="modal-close-button">
            ×
          </button>
        </div>
        <form @submit.prevent="submitAddClient" class="modal-form">
          <div class="form-group">
            <label for="client-select" class="form-label">
              Cliente <span class="required">*</span>
            </label>
            <select
              id="client-select"
              v-model.number="addClientForm.clientId"
              class="form-input"
              required
              :disabled="loadingClientsList"
            >
              <option :value="null" disabled>
                {{
                  loadingClientsList
                    ? "Cargando clientes..."
                    : availableClients.length === 0
                    ? "No hay clientes disponibles"
                    : "Selecciona un cliente"
                }}
              </option>
              <option
                v-for="client in availableClients"
                :key="client.id"
                :value="client.id"
              >
                {{ client.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="amount-input" class="form-label">
              Importe (€) <span class="required">*</span>
            </label>
            <input
              id="amount-input"
              v-model="addClientForm.amount"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              placeholder="0.00"
              required
            />
          </div>

          <div class="modal-actions">
            <button
              type="button"
              @click="closeAddClientModal"
              class="cancel-button"
              :disabled="addingClient"
            >
              Cancelar
            </button>
            <button type="submit" class="submit-button" :disabled="addingClient">
              <span v-if="addingClient">Añadiendo...</span>
              <span v-else>Añadir</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación para actualizar importe -->
    <div
      v-if="showConfirmModal"
      class="modal-overlay"
      @click="closeConfirmModal"
    >
      <div class="modal-content modal-content-small" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            {{
              confirmModalData.newAmount === 0
                ? "Eliminar cuota del cliente"
                : "Confirmar cambio de importe"
            }}
          </h2>
          <button @click="closeConfirmModal" class="modal-close-button">
            ×
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-message" v-if="confirmModalData.newAmount === 0">
            ¿Confirmas eliminar la cuota del cliente?<br />
            <span class="confirm-message-secondary"
              >Dejará de salir en este listado (siempre lo puedes volver a
              añadir).</span
            >
          </p>
          <p class="confirm-message" v-else>
            ¿Confirmas cambiar el importe de
            <strong>{{
              formatCurrency(confirmModalData.originalAmount)
            }}</strong>
            a <strong>{{ formatCurrency(confirmModalData.newAmount) }}</strong
            >?
          </p>
        </div>
        <div class="modal-actions">
          <button
            type="button"
            @click="closeConfirmModal"
            class="cancel-button"
            :disabled="confirming"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmUpdateAmount"
            class="submit-button"
            :disabled="confirming"
          >
            <span v-if="confirming">Actualizando...</span>
            <span v-else>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.remittance-type-clients-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.remittance-type-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.remittance-type-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.remittance-type-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.remittance-type-icon {
  font-size: 2rem;
}

.info-text {
  font-size: 0.85rem;
  color: #666666;
  margin: 0;
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

.remittance-type-clients-section {
  width: 100%;
}

.remittance-type-clients-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

.search-input {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: "Signika", sans-serif;
  width: 200px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #cddc39;
}

.search-input::placeholder {
  color: #999999;
}

.add-client-button {
  padding: 0.375rem 0.75rem;
  background-color: #cddc39;
  color: #292929;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: "Signika", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.add-client-button:hover {
  background-color: #b8c837;
}

.remittance-type-clients-table-container {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100%;
}

.remittance-type-clients-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.remittance-type-clients-table thead {
  background-color: #f5f5f5;
}

.remittance-type-clients-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #292929;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
}

.remittance-type-clients-table th.text-right {
  text-align: right;
}

.remittance-type-clients-table td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  color: #666666;
  font-size: 0.95rem;
  vertical-align: middle;
}

.remittance-type-clients-table tbody tr:hover {
  background-color: #f9f9f9;
}

.remittance-type-clients-table tbody tr:last-child td {
  border-bottom: none;
}

.client-name-cell {
  height: 70px;
}

.client-name {
  font-size: 1rem;
  color: #292929;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.client-link {
  color: #292929;
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;
  font-weight: 600;
}

.client-link:hover {
  color: #cddc39;
  text-decoration: underline;
}

.inactive-badge {
  font-size: 0.875rem;
}

.amount-cell {
  text-align: right;
  height: 70px;
  padding: 0 1rem;
}

.amount-input {
  width: 120px;
  padding: 0.375rem 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  font-family: "Signika", sans-serif;
  text-align: right;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  height: 2.5rem;
}

.amount-input:focus {
  outline: none;
  border-color: #cddc39;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #666666;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content-small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: #666666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.modal-close-button:hover {
  background-color: #f5f5f5;
  color: #292929;
}

.modal-body {
  padding: 1.5rem;
}

.confirm-message {
  font-size: 1rem;
  color: #292929;
  line-height: 1.5;
  margin: 0;
}

.confirm-message strong {
  color: #cddc39;
  font-weight: 600;
}

.confirm-message-secondary {
  color: #999999;
  font-size: 0.9rem;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #292929;
  margin-bottom: 0.5rem;
}

.required {
  color: #d32f2f;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  font-family: "Signika", sans-serif;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #cddc39;
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.cancel-button {
  padding: 0.625rem 1.5rem;
  background-color: #f5f5f5;
  color: #292929;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: "Signika", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
}

.submit-button:hover:not(:disabled) {
  background-color: #b8c837;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

