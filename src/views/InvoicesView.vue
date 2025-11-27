<script lang="ts">
import InvoiceList from "@/components/InvoiceList.vue";

export default {
  name: "InvoicesView",
  components: {
    InvoiceList,
  },
};
</script>

<template>
  <div class="invoices-view">
    <InvoiceList :show-title="true" title="Facturas" />
  </div>
</template>

<style scoped>
.invoices-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}
</style>
