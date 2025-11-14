import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Users, 
  Receipt, 
  Calendar, 
  DollarSign,
  BarChart3,
  PieChart,
  Download
} from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns";

export const AdvancedReports = () => {
  const orders = useDashboardStore((state) => state.orders);
  const customers = useDashboardStore((state) => state.customers);
  const services = useDashboardStore((state) => state.services);
  
  const [reportPeriod, setReportPeriod] = useState<"today" | "week" | "month" | "custom">("week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const getDateRange = () => {
    const now = new Date();
    switch (reportPeriod) {
      case "today":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          end: now,
        };
      case "week":
        return {
          start: startOfWeek(now),
          end: endOfWeek(now),
        };
      case "month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case "custom":
        return {
          start: customStart ? new Date(customStart) : subDays(now, 7),
          end: customEnd ? new Date(customEnd) : now,
        };
      default:
        return {
          start: startOfWeek(now),
          end: endOfWeek(now),
        };
    }
  };

  const { start, end } = getDateRange();
  
  const periodOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= start && orderDate <= end;
  });

  const periodRevenue = periodOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const periodCompleted = periodOrders.filter((o) => o.status === "completed").length;
  const periodCustomers = new Set(periodOrders.map((o) => o.customerPhone)).size;

  // Service breakdown
  const serviceBreakdown = services.map((service) => {
    const serviceOrders = periodOrders.filter((o) => o.serviceId === service.id);
    const revenue = serviceOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const count = serviceOrders.length;
    return {
      name: service.name,
      count,
      revenue,
      percentage: periodRevenue > 0 ? (revenue / periodRevenue) * 100 : 0,
    };
  }).filter((s) => s.count > 0).sort((a, b) => b.revenue - a.revenue);

  // Hourly breakdown
  const hourlyRevenue: Record<number, number> = {};
  periodOrders.forEach((order) => {
    const hour = new Date(order.createdAt).getHours();
    hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + order.totalAmount;
  });

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    revenue: hourlyRevenue[i] || 0,
  }));

  // Status breakdown
  const statusBreakdown = {
    pending: periodOrders.filter((o) => o.status === "pending").length,
    processing: periodOrders.filter((o) => o.status === "processing").length,
    ready: periodOrders.filter((o) => o.status === "ready").length,
    completed: periodOrders.filter((o) => o.status === "completed").length,
  };

  // Top customers
  const customerStats: Record<string, { name: string; orders: number; revenue: number }> = {};
  periodOrders.forEach((order) => {
    if (!customerStats[order.customerPhone]) {
      customerStats[order.customerPhone] = {
        name: order.customerName,
        orders: 0,
        revenue: 0,
      };
    }
    customerStats[order.customerPhone].orders += 1;
    customerStats[order.customerPhone].revenue += order.totalAmount;
  });

  const topCustomers = Object.values(customerStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const handleExport = () => {
    const reportData = {
      period: reportPeriod,
      dateRange: {
        start: format(start, "yyyy-MM-dd"),
        end: format(end, "yyyy-MM-dd"),
      },
      summary: {
        totalOrders: periodOrders.length,
        completedOrders: periodCompleted,
        totalRevenue: periodRevenue,
        uniqueCustomers: periodCustomers,
      },
      serviceBreakdown,
      hourlyData,
      statusBreakdown,
      topCustomers,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `washflow-report-${format(start, "yyyy-MM-dd")}-${format(end, "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const maxHourlyRevenue = Math.max(...hourlyData.map((h) => h.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Periode Laporan</label>
            <Select value={reportPeriod} onValueChange={(v) => setReportPeriod(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">Minggu Ini</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {reportPeriod === "custom" && (
            <>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Dari Tanggal</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Sampai Tanggal</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                />
              </div>
            </>
          )}
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{periodOrders.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">
                Rp {periodRevenue.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pelanggan</p>
              <p className="text-2xl font-bold">{periodCustomers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Selesai</p>
              <p className="text-2xl font-bold">{periodCompleted}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Service Breakdown */}
      {serviceBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Breakdown Layanan
          </h3>
          <div className="space-y-3">
            {serviceBreakdown.map((service) => (
              <div key={service.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{service.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {service.count} orders • Rp {service.revenue.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${service.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {service.percentage.toFixed(1)}% dari total revenue
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hourly Revenue Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Revenue per Jam
        </h3>
        <div className="space-y-2">
          {hourlyData.map((data) => (
            <div key={data.hour} className="flex items-center gap-3">
              <div className="w-12 text-sm text-muted-foreground">
                {data.hour.toString().padStart(2, "0")}:00
              </div>
              <div className="flex-1 bg-secondary rounded-full h-6 relative">
                {data.revenue > 0 && (
                  <div
                    className="bg-primary h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(data.revenue / maxHourlyRevenue) * 100}%` }}
                  >
                    {data.revenue > maxHourlyRevenue * 0.1 && (
                      <span className="text-xs text-white font-medium">
                        Rp {data.revenue.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                )}
                {data.revenue === 0 && (
                  <span className="text-xs text-muted-foreground px-2">-</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status Orders</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Pending</span>
              <span className="font-semibold">{statusBreakdown.pending}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing</span>
              <span className="font-semibold">{statusBreakdown.processing}</span>
            </div>
            <div className="flex justify-between">
              <span>Ready</span>
              <span className="font-semibold">{statusBreakdown.ready}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed</span>
              <span className="font-semibold text-success">{statusBreakdown.completed}</span>
            </div>
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top 5 Pelanggan</h3>
          {topCustomers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                  </div>
                  <p className="font-semibold text-primary">
                    Rp {customer.revenue.toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

