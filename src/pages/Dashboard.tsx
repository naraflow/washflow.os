import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DashboardHeader } from "./dashboard/components/layout/DashboardHeader";
import { QuickActions } from "./dashboard/components/layout/QuickActions";
import { OrderList } from "./dashboard/components/orders/OrderList";
import { CustomerList } from "./dashboard/components/customers/CustomerList";
import { ServiceList } from "./dashboard/components/services/ServiceList";
import { Reports } from "./dashboard/components/reports/Reports";
import { AdvancedReports } from "./dashboard/components/reports/AdvancedReports";
import { PickupDeliveryList } from "./dashboard/components/pickup-delivery/PickupDeliveryList";
import { MachineList } from "./dashboard/components/machines/MachineList";
import { OrderModal } from "./dashboard/components/orders/OrderModal";
import { useDashboardStore } from "./dashboard/store/useDashboardStore";
import { useMachineTimer } from "./dashboard/hooks/useMachineTimer";

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const setSelectedTab = useDashboardStore((state) => state.setSelectedTab);
  const selectedTab = useDashboardStore((state) => state.selectedTab);
  
  // Start machine timer updates
  useMachineTimer();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
      toast.success("Login berhasil! Selamat datang di washflow.os Dashboard");
    } else {
      toast.error("Silakan masukkan email dan password yang valid");
    }
  };

  const handleExport = () => {
    const orders = useDashboardStore.getState().orders;
    const customers = useDashboardStore.getState().customers;
    const services = useDashboardStore.getState().services;

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
    a.download = `washflow-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data berhasil diexport");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-hover flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">washflow.os Admin</h1>
            <p className="text-muted-foreground">Silakan masuk untuk mengakses dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@washflow.os"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardHeader />
      
      <div className="container py-8 px-4">
        <QuickActions
          onNewOrder={() => setIsOrderModalOpen(true)}
          onExport={handleExport}
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 lg:w-auto">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Pelanggan</TabsTrigger>
            <TabsTrigger value="services">Layanan</TabsTrigger>
            <TabsTrigger value="pickup-delivery">Pickup/Delivery</TabsTrigger>
            <TabsTrigger value="machines">Mesin</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <OrderList />
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <CustomerList />
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <ServiceList />
          </TabsContent>

          <TabsContent value="pickup-delivery" className="space-y-4">
            <PickupDeliveryList />
          </TabsContent>

          <TabsContent value="machines" className="space-y-4">
            <MachineList />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <AdvancedReports />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ringkasan Bisnis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Status Operasional</span>
                  <span className="text-success font-semibold">● Aktif</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-semibold">
                    {useDashboardStore.getState().orders.length} pesanan
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Total Pelanggan</span>
                  <span className="font-semibold">
                    {useDashboardStore.getState().customers.length} pelanggan
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Pendapatan</span>
                  <span className="font-semibold text-success">
                    Rp{" "}
                    {useDashboardStore
                      .getState()
                      .orders.reduce((sum, o) => sum + o.totalAmount, 0)
                      .toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {isOrderModalOpen && (
        <OrderModal
          order={null}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
