<script lang="ts">
import ApiService from "@/services/ApiService";
import type {
  IRemittance,
  IRemittanceLine,
  IRemittanceType,
} from "@/interfaces/Remittance";
import type { IClientListItem } from "@/interfaces/Client";
import InvoiceList from "@/components/InvoiceList.vue";

export default {
  name: "RemittanceView",
  components: {
    InvoiceList,
  },
  data() {
    return {
      remittance: null as IRemittance | null,
      remittanceType: null as IRemittanceType | null,
      remittanceLines: [] as IRemittanceLine[],
      loading: true,
      loadingRemittanceType: false,
      loadingLines: true,
      validating: false,
      error: "",
      errorLines: "",
      editingAmounts: {} as Record<number, number>,
      showAddLineModal: false,
      clients: [] as IClientListItem[],
      loadingClients: false,
      addLineForm: {
        clientId: null as number | null,
        amount: "",
      },
      addingLine: false,
      showConfirmModal: false,
      confirmModalData: {
        line: null as IRemittanceLine | null,
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
        this.remittanceLines.map((line) => line.client.id)
      );
      return this.clients.filter(
        (client) => client.isActive && !existingClientIds.has(client.id)
      );
    },
    filteredRemittanceLines(): IRemittanceLine[] {
      if (!this.searchQuery.trim()) {
        return this.remittanceLines;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.remittanceLines.filter((line) =>
        line.client.name.toLowerCase().includes(query)
      );
    },
  },
  async mounted() {
    await Promise.all([this.fetchRemittance(), this.fetchRemittanceLines()]);
  },
  methods: {
    getRemittanceIdFromRoute(): number {
      const routeParam = this.$route.params.remittanceId as string;
      return parseInt(routeParam, 10);
    },
    getClientUrl(clientId: number): string {
      return `/client/${clientId}`;
    },
    async fetchRemittance() {
      try {
        this.loading = true;
        this.error = "";
        const remittanceId = this.getRemittanceIdFromRoute();
        this.remittance = await ApiService.getRemittance(remittanceId);
        // Cargar el tipo de remesa después de obtener la remesa
        if (this.remittance?.remittanceTypeId) {
          await this.fetchRemittanceType();
        }
      } catch (err) {
        this.error =
          "Error al cargar la información de la remesa. Por favor, intenta de nuevo.";
        console.error("Error fetching remittance:", err);
      } finally {
        this.loading = false;
      }
    },
    async fetchRemittanceType() {
      if (!this.remittance?.remittanceTypeId) return;
      try {
        this.loadingRemittanceType = true;
        const remittanceTypeId = this.remittance.remittanceTypeId;
        if (remittanceTypeId) {
          this.remittanceType =
            await ApiService.getRemittanceType(remittanceTypeId);
        }
      } catch (err) {
        console.error("Error fetching remittance type:", err);
      } finally {
        this.loadingRemittanceType = false;
      }
    },
    getStatusLabel(status: string): string {
      if (status === "validated") return "Validada";
      if (status === "processing_validation") return "Procesando validación";
      return "Pendiente validar";
    },
    getStatusIcon(status: string): string {
      if (status === "validated") return "✅";
      if (status === "processing_validation") return "🕒";
      return "⏳";
    },
    isReadOnlyStatus(status: string): boolean {
      return status === "validated" || status === "processing_validation";
    },
    formatMonthYear(month: number, year: number): string {
      const monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return `${monthNames[month - 1]} ${year}`;
    },
    formatDate(dateString: string): string {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    async fetchRemittanceLines() {
      try {
        this.loadingLines = true;
        this.errorLines = "";
        const remittanceId = this.getRemittanceIdFromRoute();
        const response = await ApiService.getRemittanceLines(remittanceId);
        this.remittanceLines = response.remittanceLines || [];
        // Inicializar los valores editables
        this.remittanceLines.forEach((line) => {
          this.editingAmounts[line.id] = line.amountMinUnit;
        });
      } catch (err) {
        this.errorLines =
          "Error al cargar las líneas de remesa. Por favor, intenta de nuevo.";
        console.error("Error fetching remittance lines:", err);
      } finally {
        this.loadingLines = false;
      }
    },
    async validateRemittance() {
      if (!this.remittance) return;
      try {
        this.validating = true;
        this.error = "";
        await ApiService.validateRemittance(this.remittance.id);
        // Limpiar caché y recargar la remesa
        ApiService.clearCache();
        await Promise.all([
          this.fetchRemittance(),
          this.fetchRemittanceLines(),
        ]);
      } catch (err) {
        this.error = "Error al validar la remesa. Por favor, intenta de nuevo.";
        console.error("Error validating remittance:", err);
      } finally {
        this.validating = false;
      }
    },
    formatCurrency(amountMinUnit: number): string {
      const amount = amountMinUnit / 100;
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
    },
    updateAmountInEuros(lineId: number, euros: number) {
      // Convertir euros a centavos
      this.editingAmounts[lineId] = Math.round(euros * 100);
    },
    async handleAmountBlur(line: IRemittanceLine) {
      const newAmountMinUnit = this.editingAmounts[line.id];
      const originalAmountMinUnit = line.amountMinUnit;
      // Si no ha cambiado o el nuevo valor es undefined, no hacer nada
      if (
        newAmountMinUnit === undefined ||
        newAmountMinUnit === originalAmountMinUnit
      ) {
        return;
      }

      // Mostrar modal de confirmación personalizado
      this.confirmModalData = {
        line,
        originalAmount: originalAmountMinUnit,
        newAmount: newAmountMinUnit,
      };
      this.showConfirmModal = true;
    },
    async fetchClients() {
      try {
        this.loadingClients = true;
        const response = await ApiService.getClients();
        this.clients = response.clients;
      } catch (err) {
        console.error("Error fetching clients:", err);
      } finally {
        this.loadingClients = false;
      }
    },
    openAddLineModal() {
      this.showAddLineModal = true;
      this.addLineForm = {
        clientId: null,
        amount: "",
      };
      if (this.clients.length === 0) {
        this.fetchClients();
      }
    },
    closeAddLineModal() {
      this.showAddLineModal = false;
      this.addLineForm = {
        clientId: null,
        amount: "",
      };
    },
    async submitAddLine() {
      if (
        !this.remittance ||
        !this.addLineForm.clientId ||
        !this.addLineForm.amount
      ) {
        return;
      }

      try {
        this.addingLine = true;
        const amountMinUnit = Math.round(
          parseFloat(this.addLineForm.amount) * 100
        );
        await ApiService.addRemittanceLine(
          this.remittance.id,
          this.addLineForm.clientId,
          amountMinUnit
        );
        // Limpiar caché y recargar las líneas
        ApiService.clearCache();
        await this.fetchRemittanceLines();
        this.closeAddLineModal();
      } catch (err) {
        const errorMessage =
          err instanceof Error && err.message
            ? err.message
            : "Error al añadir la línea. Por favor, intenta de nuevo.";
        alert(errorMessage);
        console.error("Error adding remittance line:", err);
      } finally {
        this.addingLine = false;
      }
    },
    closeConfirmModal() {
      this.showConfirmModal = false;
      // Revertir el valor si se cancela
      if (this.confirmModalData.line) {
        this.editingAmounts[this.confirmModalData.line.id] =
          this.confirmModalData.originalAmount;
      }
      this.confirmModalData = {
        line: null,
        originalAmount: 0,
        newAmount: 0,
      };
    },
    async confirmUpdateAmount() {
      if (!this.confirmModalData.line) return;

      try {
        this.confirming = true;
        await ApiService.updateRemittanceLine(
          this.confirmModalData.line.id,
          this.confirmModalData.newAmount
        );
        // Limpiar caché y recargar las líneas
        ApiService.clearCache();
        await this.fetchRemittanceLines();
        this.showConfirmModal = false;
        this.confirmModalData = {
          line: null,
          originalAmount: 0,
          newAmount: 0,
        };
      } catch (err) {
        // Revertir el valor en caso de error
        if (this.confirmModalData.line) {
          this.editingAmounts[this.confirmModalData.line.id] =
            this.confirmModalData.originalAmount;
        }
        alert("Error al actualizar el importe. Por favor, intenta de nuevo.");
        console.error("Error updating remittance line:", err);
      } finally {
        this.confirming = false;
      }
    },
  },
};
</script>

<template>
  <div class="remittance-detail-view">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando información...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchRemittance" class="retry-button">Reintentar</button>
    </div>

    <div v-else-if="remittance">
      <div class="remittance-header">
        <h1 class="remittance-title">
          Remesa
          <span v-if="remittanceType" class="remittance-type-info">
            <span class="remittance-type-icon">{{ remittanceType.icon }}</span>
            {{ remittanceType.name }}
          </span>
          <span
            v-else-if="loadingRemittanceType"
            class="remittance-type-loading"
            >...</span
          >
        </h1>
        <button
          v-if="remittance.status === 'pending'"
          @click="validateRemittance"
          :disabled="validating"
          class="validate-button"
        >
          <span v-if="validating">Validando...</span>
          <span v-else>Validar</span>
        </button>
      </div>

      <div class="remittance-details">
        <div class="remittance-card">
          <div class="remittance-section">
            <h2 class="section-title">Información de la Remesa</h2>
            <div class="detail-row">
              <span class="detail-label">Período:</span>
              <span class="detail-value">{{
                formatMonthYear(remittance.month, remittance.year)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estado:</span>
              <span
                class="detail-value status-badge"
                :class="{
                  'status-validated':
                    remittance.status === 'validated' ||
                    remittance.status === 'processing_validation',
                  'status-pending': remittance.status === 'pending',
                }"
              >
                <span class="status-icon">{{
                  getStatusIcon(remittance.status)
                }}</span>
                <span class="status-label">{{
                  getStatusLabel(remittance.status)
                }}</span>
              </span>
            </div>
            <div
              v-if="remittance.status === 'processing_validation'"
              class="processing-alert"
            >
              <span class="alert-icon">🕒</span>
              <div class="alert-content">
                <p class="alert-text">
                  El proceso de validación puede tardar varios minutos. Te
                  llegará un correo electrónico en cuanto haya terminado.
                </p>
              </div>
            </div>
            <div v-if="remittance.createdAt" class="detail-row">
              <span class="detail-label">Creación:</span>
              <span class="detail-value">{{
                formatDate(remittance.createdAt)
              }}</span>
            </div>
            <div
              v-if="remittance.validatedAt && remittance.status === 'validated'"
              class="detail-row"
            >
              <span class="detail-label">Validación:</span>
              <span class="detail-value">{{
                formatDate(remittance.validatedAt)
              }}</span>
            </div>
            <div
              v-if="remittance.status === 'validated' && remittance.fileUrl"
              class="detail-row"
            >
              <span class="detail-label">Fichero:</span>
              <span class="detail-value">
                <a
                  :href="remittance.fileUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="file-link"
                >
                  📄 Fichero de la remesa
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="remittance-lines-section">
        <div class="remittance-lines-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">Líneas de Remesa</h2>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre..."
              class="search-input"
            />
          </div>
          <button
            v-if="remittance.status === 'pending'"
            @click="openAddLineModal"
            class="add-line-button"
          >
            + Añadir línea
          </button>
        </div>

        <div v-if="loadingLines" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando líneas...</p>
        </div>

        <div v-else-if="errorLines" class="error-state">
          <p class="error-message">{{ errorLines }}</p>
          <button @click="fetchRemittanceLines" class="retry-button">
            Reintentar
          </button>
        </div>

        <div v-else-if="remittanceLines.length === 0" class="empty-state">
          <p>No hay líneas de remesa disponibles.</p>
        </div>

        <div
          v-else-if="filteredRemittanceLines.length === 0"
          class="empty-state"
        >
          <p>No se encontraron líneas con ese nombre.</p>
        </div>

        <div v-else class="remittance-lines-table-container">
          <table class="remittance-lines-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th class="text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in filteredRemittanceLines" :key="line.id">
                <td class="client-name-cell">
                  <div class="client-name">
                    <router-link
                      :to="getClientUrl(line.client.id)"
                      class="client-link"
                    >
                      {{ line.client.name }}
                    </router-link>
                    <span v-if="!line.client.isActive" class="inactive-badge"
                      >⚪️</span
                    >
                  </div>
                </td>
                <td class="amount-cell">
                  <span
                    v-if="isReadOnlyStatus(remittance?.status || '')"
                    class="amount-text"
                  >
                    {{ formatCurrency(line.amountMinUnit) }}
                  </span>
                  <input
                    v-else
                    :value="editingAmountsInEuros[line.id]"
                    @input="
                      updateAmountInEuros(
                        line.id,
                        parseFloat(($event.target as HTMLInputElement).value) ||
                          0
                      )
                    "
                    @blur="handleAmountBlur(line)"
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

      <!-- Listado de facturas (solo cuando está validada) -->
      <div v-if="remittance.status === 'validated'" class="invoices-section">
        <div class="invoices-header">
          <h2 class="section-title">Facturas de la Remesa</h2>
        </div>
        <InvoiceList
          :only-from-remittance-id="remittance.id"
          :show-title="false"
        />
      </div>
    </div>

    <!-- Modal para añadir línea -->
    <div
      v-if="showAddLineModal"
      class="modal-overlay"
      @click="closeAddLineModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Añadir línea de remesa</h2>
          <button @click="closeAddLineModal" class="modal-close-button">
            ×
          </button>
        </div>
        <form @submit.prevent="submitAddLine" class="modal-form">
          <div class="form-group">
            <label for="client-select" class="form-label">
              Cliente <span class="required">*</span>
            </label>
            <select
              id="client-select"
              v-model.number="addLineForm.clientId"
              class="form-input"
              required
              :disabled="loadingClients"
            >
              <option :value="null" disabled>
                {{
                  loadingClients
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
              v-model="addLineForm.amount"
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
              @click="closeAddLineModal"
              class="cancel-button"
              :disabled="addingLine"
            >
              Cancelar
            </button>
            <button type="submit" class="submit-button" :disabled="addingLine">
              <span v-if="addingLine">Añadiendo...</span>
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
                ? "Eliminar línea de remesa"
                : "Confirmar cambio de importe"
            }}
          </h2>
          <button @click="closeConfirmModal" class="modal-close-button">
            ×
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-message" v-if="confirmModalData.newAmount === 0">
            ¿Confirmas eliminar la línea de remesa?<br />
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
.remittance-detail-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.remittance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.remittance-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.remittance-type-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remittance-type-icon {
  font-size: 1.5rem;
}

.remittance-type-loading {
  color: #666666;
  font-weight: 400;
}

.validate-button {
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
  white-space: nowrap;
}

.validate-button:hover:not(:disabled) {
  background-color: #b8c837;
}

.validate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.remittance-details {
  width: 100%;
  margin-bottom: 2rem;
}

.remittance-lines-section {
  width: 100%;
  margin-bottom: 2rem;
}

.remittance-lines-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.invoices-section {
  width: 100%;
  margin-top: 2rem;
}

.invoices-header {
  margin-bottom: 1.5rem;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.add-line-button {
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

.add-line-button:hover {
  background-color: #b8c837;
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

.remittance-lines-table-container {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100%;
}

.remittance-lines-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.remittance-lines-table thead {
  background-color: #f5f5f5;
}

.remittance-lines-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #292929;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
}

.remittance-lines-table th.text-right {
  text-align: right;
}

.remittance-lines-table td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  color: #666666;
  font-size: 0.95rem;
  vertical-align: middle;
}

.remittance-lines-table tbody tr:hover {
  background-color: #f9f9f9;
}

.remittance-lines-table tbody tr:last-child td {
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

.amount-text {
  font-size: 1rem;
  font-weight: 500;
  color: #292929;
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

.remittance-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.remittance-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

.remittance-section .section-title {
  margin: 0 0 1rem 0;
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

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  color: #292929;
}

.file-link {
  color: #cddc39;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.file-link:hover {
  color: #b8c837;
  text-decoration: underline;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  width: fit-content;
}

.status-validated {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-pending {
  background-color: #fff3e0;
  color: #e65100;
}

.status-icon {
  font-size: 1rem;
}

.status-label {
  font-size: 0.9rem;
}

.processing-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background-color: #e8f5e9;
  border-left: 3px solid #4caf50;
  border-radius: 4px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.alert-icon {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-content {
  flex: 1;
}

.alert-text {
  margin: 0;
  font-size: 0.85rem;
  color: #2e7d32;
  line-height: 1.4;
}

@media (min-width: 768px) {
  .detail-row {
    flex-direction: row;
    align-items: center;
  }

  .detail-label {
    min-width: 150px;
  }
}
</style>
