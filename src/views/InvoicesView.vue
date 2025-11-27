<script lang="ts">
import ApiService from "@/services/ApiService";
import type { IInvoice } from "@/interfaces/Invoice";
import InvoiceList from "@/components/InvoiceList.vue";

export default {
  name: "InvoicesView",
  components: {
    InvoiceList,
  },
  data() {
    return {
      invoices: [] as IInvoice[],
      loading: true,
      error: "",
    };
  },
  async mounted() {
    await this.fetchInvoices();
  },
  methods: {
    async fetchInvoices() {
      try {
        this.loading = true;
        this.error = "";
        const response = await ApiService.getInvoices();
        this.invoices = response.invoices;
      } catch (err) {
        this.error =
          "Error al cargar las facturas. Por favor, intenta de nuevo.";
        console.error("Error fetching invoices:", err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div class="invoices-view">
    <InvoiceList
      :invoices="invoices"
      :loading="loading"
      :error="error"
      :show-title="true"
      title="Facturas"
    />
    <div v-if="error && !loading" class="retry-container">
      <button @click="fetchInvoices" class="retry-button">Reintentar</button>
    </div>
  </div>
</template>

<style scoped>
.invoices-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.retry-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
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
</style>
