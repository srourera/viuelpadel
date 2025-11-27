<script lang="ts">
import InvoiceList from "@/components/InvoiceList.vue";
import ApiService from "@/services/ApiService";

export default {
  name: "InvoicesView",
  components: {
    InvoiceList,
  },
  data() {
    return {
      lastInvoiceNumber: null as number | null,
      loadingLastNumber: true,
    };
  },
  async mounted() {
    await this.fetchLastInvoiceNumber();
  },
  methods: {
    goToManualInvoice() {
      this.$router.push("/invoices/manual");
    },
    async fetchLastInvoiceNumber() {
      try {
        this.loadingLastNumber = true;
        const response = await ApiService.getLastInvoiceNumber();
        this.lastInvoiceNumber = response.lastInvoiceNumber;
      } catch (err) {
        console.error("Error fetching last invoice number:", err);
      } finally {
        this.loadingLastNumber = false;
      }
    },
  },
};
</script>

<template>
  <div class="invoices-view">
    <div class="invoices-header">
      <div class="invoices-title-section">
        <h1 class="invoices-title">Facturas</h1>
        <p v-if="!loadingLastNumber && lastInvoiceNumber" class="last-invoice-number">
          Último número de factura: {{ lastInvoiceNumber }}
        </p>
      </div>
      <button @click="goToManualInvoice" class="manual-invoice-button">
        + Factura manual
      </button>
    </div>
    <InvoiceList :show-title="false" title="Facturas" />
  </div>
</template>

<style scoped>
.invoices-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.invoices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.invoices-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.invoices-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0;
}

.last-invoice-number {
  font-size: 0.85rem;
  color: #666666;
  margin: 0;
}

.manual-invoice-button {
  padding: 0.75rem 1.5rem;
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

.manual-invoice-button:hover {
  background-color: #b8c837;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(205, 220, 57, 0.3);
}

@media (max-width: 768px) {
  .invoices-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .manual-invoice-button {
    width: 100%;
  }
}
</style>
