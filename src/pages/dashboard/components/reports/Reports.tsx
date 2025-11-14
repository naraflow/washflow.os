import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, Users, Receipt } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

export const Reports = () => {
  const orders = useDashboardStore((state) => state.orders);
  const customers = useDashboardStore((state) => state.customers);
  const services = useDashboardStore((state) => state.services);

  // Today's stats
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  
  const todayOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= todayStart && orderDate <= todayEnd;
  });
  
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const todayCompleted = todayOrders.filter((o) => o.status === "completed").length;

  // This week stats
  const weekStart = startOfDay(subDays(today, 7));
  const weekOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= weekStart;
  });
  const weekRevenue = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Service breakdown
  const serviceBreakdown = services.map((service) => {
    const serviceOrders = orders.filter((o) => o.serviceId === service.id);
    const revenue = serviceOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      name: service.name,
      orders: serviceOrders.length,
      revenue,
    };
  }).filter((s) => s.orders > 0);

  const handleExport = () => {
    const data = {
      orders,
      customers,
      services,
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        totalCustomers: customers.length,
        exportDate: new Date().toISOString(),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `washflow-export-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hari Ini</p>
              <p className="text-2xl font-bold">{todayOrders.length}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendapatan Hari Ini</p>
              <p className="text-2xl font-bold text-primary">
                Rp {todayRevenue.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Minggu Ini</p>
              <p className="text-2xl font-bold">{weekOrders.length}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Users className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pelanggan</p>
              <p className="text-2xl font-bold">{customers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Service Breakdown */}
      {serviceBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Breakdown Layanan</h3>
          <div className="space-y-3">
            {serviceBreakdown.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">{service.orders} orders</p>
                </div>
                <p className="font-semibold text-primary">
                  Rp {service.revenue.toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Export Button */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Export Data</h3>
            <p className="text-sm text-muted-foreground">
              Download semua data orders, customers, dan services dalam format JSON
            </p>
          </div>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </Card>
    </div>
  );
};

