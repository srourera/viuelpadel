import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ClientsView from "@/views/ClientsView.vue";
import ClientView from "@/views/ClientView.vue";
import InvoicesView from "@/views/InvoicesView.vue";
import ResponsableView from "@/views/ResponsableView.vue";

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
      path: "/client/:clientName",
      name: "client",
      component: ClientView,
    },
    {
      path: "/invoices",
      name: "invoices",
      component: InvoicesView,
    },
    {
      path: "/responsable/:responsableName",
      name: "responsable",
      component: ResponsableView,
    },
  ],
});

export default router;
