import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ClientsView from "@/views/ClientsView.vue";
import ClientView from "@/views/ClientView.vue";
import NewClientView from "@/views/NewClientView.vue";
import EditClientView from "@/views/EditClientView.vue";
import InvoicesView from "@/views/InvoicesView.vue";
import ManualInvoiceView from "@/views/ManualInvoiceView.vue";
import ResponsableView from "@/views/ResponsableView.vue";
import RemittanceTypesView from "@/views/RemittanceTypesView.vue";
import RemittanceTypeView from "@/views/RemittanceTypeView.vue";
import RemittanceView from "@/views/RemittanceView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/clients",
      name: "clients",
      component: ClientsView,
    },
    {
      path: "/clients/new",
      name: "new-client",
      component: NewClientView,
    },
    {
      path: "/client/:clientId",
      name: "client",
      component: ClientView,
    },
    {
      path: "/client/:clientId/edit",
      name: "edit-client",
      component: EditClientView,
    },
    {
      path: "/invoices",
      name: "invoices",
      component: InvoicesView,
    },
    {
      path: "/invoices/manual",
      name: "manual-invoice",
      component: ManualInvoiceView,
    },
    {
      path: "/responsable/:responsibleId",
      name: "responsable",
      component: ResponsableView,
    },
    {
      path: "/remittance-types",
      name: "remittance-types",
      component: RemittanceTypesView,
    },
    {
      path: "/remittance-type/:id",
      name: "remittance-type",
      component: RemittanceTypeView,
    },
    {
      path: "/remittance-type/:id/remittance/:remittanceId",
      name: "remittance",
      component: RemittanceView,
    },
  ],
});

export default router;
