import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ClientsView from "@/views/ClientsView.vue";
import ClientView from "@/views/ClientView.vue";
import NewClientView from "@/views/NewClientView.vue";
import EditClientView from "@/views/EditClientView.vue";
import InvoicesView from "@/views/InvoicesView.vue";
import ManualInvoiceView from "@/views/ManualInvoiceView.vue";
import ResponsableView from "@/views/ResponsableView.vue";
import RemesasView from "@/views/RemesasView.vue";
import RemesaEscolaViuElPadelView from "@/views/RemesaEscolaViuElPadelView.vue";

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
      path: "/remesas",
      name: "remesas",
      component: RemesasView,
    },
    {
      path: "/remesa/escola-viu-el-padel",
      name: "remesa-escola-viu-el-padel",
      component: RemesaEscolaViuElPadelView,
    },
  ],
});

export default router;
