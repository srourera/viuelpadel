<script lang="ts">
import ApiService from "@/services/ApiService";
import type { IInvoice } from "@/interfaces/Invoice";
import type { IClientListItem } from "@/interfaces/Client";

interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  count: number;
}

interface TopClient {
  client: string;
  revenue: number;
  count: number;
}

export default {
  name: "HomeView",
  data() {
    return {
      invoices: [] as IInvoice[],
      clients: [] as IClientListItem[],
      loading: true,
      error: "",
    };
  },
  computed: {
    totalClients(): number {
      return this.clients.length;
    },
    activeClients(): number {
      return this.clients.filter((client) => client.isActive).length;
    },
    currentMonthRevenue(): number {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      return this.getMonthRevenue(currentYear, currentMonth);
    },
    currentYearRevenue(): number {
      const now = new Date();
      const currentYear = now.getFullYear();
      return this.invoices
        .filter((inv) => {
          const date = this.parseDate(inv.dueDate);
          return date && date.getFullYear() === currentYear;
        })
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    },
    currentMonthInvoices(): number {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      return this.invoices.filter((inv) => {
        const date = this.parseDate(inv.dueDate);
        return (
          date &&
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      }).length;
    },
    monthlyRevenue(): MonthlyRevenue[] {
      const now = new Date();
      const months: MonthlyRevenue[] = [];
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

      // Empezar desde mes actual + 1 (próximo mes) y retroceder 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() + 1 - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const revenue = this.getMonthRevenue(year, month);
        const count = this.invoices.filter((inv) => {
          const invDate = this.parseDate(inv.dueDate);
          return (
            invDate &&
            invDate.getFullYear() === year &&
            invDate.getMonth() + 1 === month
          );
        }).length;

        months.push({
          month: monthNames[date.getMonth()] || "",
          year,
          revenue,
          count,
        });
      }

      return months;
    },
    topClients(): TopClient[] {
      const clientRevenue = new Map<
        string,
        { revenue: number; count: number }
      >();

      this.invoices.forEach((inv) => {
        const client = inv.client.name;
        const current = clientRevenue.get(client) || { revenue: 0, count: 0 };
        clientRevenue.set(client, {
          revenue: current.revenue + (inv.amount || 0),
          count: current.count + 1,
        });
      });

      return Array.from(clientRevenue.entries())
        .map(([client, data]) => ({
          client,
          revenue: data.revenue,
          count: data.count,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        this.error = "";

        const [invoicesResponse, clientsResponse] = await Promise.all([
          ApiService.getInvoices(),
          ApiService.getClients(),
        ]);

        this.invoices = invoicesResponse.invoices;
        this.clients = clientsResponse.clients;
      } catch (err) {
        this.error = "Error al cargar los datos. Por favor, intenta de nuevo.";
        console.error("Error fetching dashboard data:", err);
      } finally {
        this.loading = false;
      }
    },
    parseDate(dateString: string): Date | null {
      if (!dateString) return null;
      try {
        const parts = dateString.split("-");
        if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
          }
        }
        return new Date(dateString);
      } catch {
        return null;
      }
    },
    getMonthRevenue(year: number, month: number): number {
      return this.invoices
        .filter((inv) => {
          const date = this.parseDate(inv.dueDate);
          return (
            date && date.getFullYear() === year && date.getMonth() + 1 === month
          );
        })
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    },
    formatCurrency(amount: number): string {
      if (amount === null || amount === undefined) return "0,00 €";
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
    },
    getClientUrl(clientId: number): string {
      return `/client/${clientId}`;
    },
    getClientUrlFromName(clientName: string): string {
      const client = this.clients.find((c) => c.name === clientName);
      if (client) {
        return `/client/${client.id}`;
      }
      return "#";
    },
  },
};
</script>

<template>
  <div class="home-view">
    <h1 class="home-title">Dashboard</h1>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchData" class="retry-button">Reintentar</button>
    </div>

    <div v-else class="dashboard-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ activeClients }}</div>
            <div class="stat-label">
              {{ activeClients }}/{{ totalClients }} Clientes Activos
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-content">
            <div class="stat-value">{{ currentMonthInvoices }}</div>
            <div class="stat-label">Facturas Mes Actual</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-value">
              {{ formatCurrency(currentMonthRevenue) }}
            </div>
            <div class="stat-label">Facturación Mes Actual</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">
              {{ formatCurrency(currentYearRevenue) }}
            </div>
            <div class="stat-label">Facturación Año Actual</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Monthly Revenue Chart -->
        <div class="chart-card">
          <h2 class="chart-title">Facturación por Mes (Últimos 6 meses)</h2>
          <div class="chart-content">
            <div
              v-for="month in monthlyRevenue"
              :key="`${month.year}-${month.month}`"
              class="month-bar"
            >
              <div class="month-info">
                <span class="month-name"
                  >{{ month.month }} {{ month.year }}</span
                >
                <span class="month-value">{{
                  formatCurrency(month.revenue)
                }}</span>
              </div>
              <div class="bar-container">
                <div
                  class="bar-fill"
                  :style="{
                    width: `${
                      monthlyRevenue.length > 0
                        ? (month.revenue /
                            Math.max(...monthlyRevenue.map((m) => m.revenue))) *
                          100
                        : 0
                    }%`,
                  }"
                ></div>
              </div>
              <div class="month-count">{{ month.count }} facturas</div>
            </div>
          </div>
        </div>

        <!-- Top Clients -->
        <div class="chart-card">
          <h2 class="chart-title">Top 5 Clientes por Facturación</h2>
          <div class="chart-content">
            <div v-if="topClients.length === 0" class="empty-state-small">
              <p>No hay datos disponibles</p>
            </div>
            <router-link
              v-for="(client, index) in topClients"
              :key="client.client"
              :to="getClientUrlFromName(client.client)"
              class="client-row"
            >
              <div class="client-rank">#{{ index + 1 }}</div>
              <div class="client-info">
                <div class="client-name">{{ client.client }}</div>
                <div class="client-details">
                  {{ formatCurrency(client.revenue) }} • {{ client.count }}
                  {{ client.count === 1 ? "factura" : "facturas" }}
                </div>
              </div>
              <div class="client-revenue">
                {{ formatCurrency(client.revenue) }}
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  max-width: 100%;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
}

.home-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #292929;
  margin: 0 0 2rem 0;
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

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #cddc39;
  box-shadow: 0 4px 12px rgba(205, 220, 57, 0.15);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #292929;
}

.stat-label {
  font-size: 0.85rem;
  color: #666666;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 1.5rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #292929;
  margin: 0 0 1.5rem 0;
}

.chart-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.month-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.month-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #292929;
}

.month-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #292929;
}

.bar-container {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: #cddc39;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.month-count {
  font-size: 0.75rem;
  color: #666666;
}

.client-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.client-row:hover {
  background-color: #f9f9f9;
  transform: translateX(4px);
}

.client-rank {
  font-size: 1.25rem;
  font-weight: 600;
  color: #cddc39;
  min-width: 40px;
}

.client-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.client-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #292929;
}

.client-details {
  font-size: 0.8rem;
  color: #666666;
}

.client-revenue {
  font-size: 1rem;
  font-weight: 600;
  color: #292929;
}

.empty-state-small {
  padding: 2rem;
  text-align: center;
  color: #666666;
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    gap: 0.75rem;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .client-row {
    flex-wrap: wrap;
  }
}
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .stat-card {
    flex-direction: row;
    text-align: center;
    padding: 1rem;
  }
}
</style>
