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

// Historial de rutas visitadas (stack)
const routeHistory: string[] = [];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { isMainPage: true },
    },
    {
      path: "/clients",
      name: "clients",
      component: ClientsView,
      meta: { isMainPage: true },
    },
    {
      path: "/clients/new",
      name: "new-client",
      component: NewClientView,
      meta: { fallbackRoute: "/clients" },
    },
    {
      path: "/client/:clientId",
      name: "client",
      component: ClientView,
      meta: { fallbackRoute: "/clients" },
    },
    {
      path: "/client/:clientId/edit",
      name: "edit-client",
      component: EditClientView,
      meta: { fallbackRoute: "/clients" },
    },
    {
      path: "/invoices",
      name: "invoices",
      component: InvoicesView,
      meta: { isMainPage: true },
    },
    {
      path: "/invoices/manual",
      name: "manual-invoice",
      component: ManualInvoiceView,
      meta: { fallbackRoute: "/invoices" },
    },
    {
      path: "/responsable/:responsibleId",
      name: "responsable",
      component: ResponsableView,
      meta: { fallbackRoute: "/" },
    },
    {
      path: "/remittance-types",
      name: "remittance-types",
      component: RemittanceTypesView,
      meta: { isMainPage: true },
    },
    {
      path: "/remittance-type/:id",
      name: "remittance-type",
      component: RemittanceTypeView,
      meta: { fallbackRoute: "/remittance-types" },
    },
    {
      path: "/remittance-type/:id/remittance/:remittanceId",
      name: "remittance",
      component: RemittanceView,
      meta: { fallbackRoute: "/remittance-types" },
    },
  ],
});

// Guardar la ruta anterior en cada navegación
router.beforeEach((to, from, next) => {
  // Guardar la ruta anterior en los metadatos de la ruta de destino
  if (from.name && from.fullPath !== to.fullPath) {
    // Solo guardamos si venimos de una ruta válida (no es la primera carga)
    to.meta.previousRoute = from.fullPath;

    // Agregar al historial solo si es una navegación hacia adelante
    // (no cuando se hace pop del historial)
    const isBackNavigation =
      routeHistory.length > 0 &&
      routeHistory[routeHistory.length - 1] === to.fullPath;

    if (!isBackNavigation) {
      routeHistory.push(from.fullPath);
      // Limitar el historial a las últimas 50 rutas
      if (routeHistory.length > 50) {
        routeHistory.shift();
      }
    } else {
      // Si es navegación hacia atrás, remover la última entrada del historial
      routeHistory.pop();
    }
  }
  next();
});

// Función para obtener la ruta anterior del historial
export const getPreviousRoute = (currentRoute: string): string | null => {
  // Buscar la última ruta en el historial que no sea la actual
  for (let i = routeHistory.length - 1; i >= 0; i--) {
    const route = routeHistory[i];
    if (route && route !== currentRoute) {
      return route;
    }
  }
  return null;
};

export default router;
