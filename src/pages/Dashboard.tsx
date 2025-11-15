import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { WashflowLogo } from "@/components/WashflowLogo";
import { DashboardHeader } from "./dashboard/components/layout/DashboardHeader";
import { QuickActions } from "./dashboard/components/layout/QuickActions";
import { OrderList } from "./dashboard/components/orders/OrderList";
import { CustomerList } from "./dashboard/components/customers/CustomerList";
import { ServiceList } from "./dashboard/components/services/ServiceList";
import { AdvancedReports } from "./dashboard/components/reports/AdvancedReports";
import { PickupDeliveryList } from "./dashboard/components/pickup-delivery/PickupDeliveryList";
import { MachineList } from "./dashboard/components/machines/MachineList";
import { OutletForm } from "./dashboard/components/outlets/OutletForm";
import { OrderModal } from "./dashboard/components/orders/OrderModal";
import { WorkflowOverview } from "./dashboard/components/workflow/WorkflowOverview";
import { ReceptionView } from "./dashboard/components/workflow/ReceptionView";
import { SortingView } from "./dashboard/components/workflow/SortingView";
import { WashingView } from "./dashboard/components/workflow/WashingView";
import { DryingView } from "./dashboard/components/workflow/DryingView";
import { IronView } from "./dashboard/components/workflow/IronView";
import { PackingView } from "./dashboard/components/workflow/PackingView";
import { ReadyView } from "./dashboard/components/workflow/ReadyView";
import { useDashboardStore } from "./dashboard/store/useDashboardStore";
import { useMachineTimer } from "./dashboard/hooks/useMachineTimer";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { WorkflowStage } from "./dashboard/types/workflow";

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const setSelectedTab = useDashboardStore((state) => state.setSelectedTab);
  const selectedTab = useDashboardStore((state) => state.selectedTab);
  const orders = useDashboardStore((state) => state.orders);
  
  // Start machine timer updates
  useMachineTimer();

  // Calculate order counts per stage
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'workflow-overview': 0, // Overview doesn't need count
      'reception': 0,
      'sorting': 0,
      'washing': 0,
      'drying': 0,
      'ironing': 0,
      'packing': 0,
      'ready': 0,
      'pickup-delivery': 0,
    };

    orders.forEach((order) => {
      const currentStage = order.currentStage || 'reception';
      
      // Map stage to tab value
      if (currentStage === 'reception') counts['reception']++;
      else if (currentStage === 'sorting') counts['sorting']++;
      else if (currentStage === 'washing') counts['washing']++;
      else if (currentStage === 'drying') counts['drying']++;
      else if (currentStage === 'ironing') counts['ironing']++;
      else if (currentStage === 'packing') counts['packing']++;
      else if (currentStage === 'ready') counts['ready']++;
      else if (currentStage === 'picked') counts['pickup-delivery']++;
    });

    return counts;
  }, [orders]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
      toast.success("Login berhasil! Selamat datang di washflow.os Dashboard");
    } else {
      toast.error("Silakan masukkan email dan password yang valid");
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password && confirmPassword) {
      if (password !== confirmPassword) {
        toast.error("Password dan konfirmasi password tidak cocok");
        return;
      }
      setIsLoggedIn(true);
      toast.success("Registrasi berhasil! Selamat datang di washflow.os Dashboard");
    } else {
      toast.error("Silakan lengkapi semua field");
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
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-hover">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <WashflowLogo size={28} />
              <span className="text-xl font-bold text-primary">washflow.os</span>
            </div>
            
          </nav>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <Card className="w-full max-w-md p-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Main Page
            </Link>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">washflow.os Admin</h1>
              <p className="text-muted-foreground">
                {isSignUp 
                  ? "Buat akun baru untuk mengakses dashboard" 
                  : "Silakan masuk untuk mengakses dashboard"}
              </p>
            </div>
            
            {isSignUp ? (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="admin@washflow.os"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Daftar
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsSignUp(false)}
                >
                  Masuk
                </Button>
              </form>
            ) : (
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
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsSignUp(true)}
                >
                  Daftar
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardHeader />
      
      <div className="container py-8 px-4">
        <QuickActions
          onNewOrder={() => setIsOrderModalOpen(true)}
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          {/* Workflow Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Workflow
              </span>
              <div className="h-px flex-1 bg-border"></div>
            </div>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-9 lg:w-auto gap-2 p-2 bg-transparent">
              <TabsTrigger 
                value="workflow-overview" 
                className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="reception" 
                className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative"
              >
                Order
                {stageCounts['reception'] > 0 && (
                  <Badge 
                    variant="default" 
                    className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                  >
                    {stageCounts['reception']}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="sorting" 
                className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative"
              >
                Sorting
                {stageCounts['sorting'] > 0 && (
                  <Badge 
                    variant="default" 
                    className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                  >
                    {stageCounts['sorting']}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="washing" 
                className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative"
              >
                Washing
                {stageCounts['washing'] > 0 && (
                  <Badge 
                    variant="default" 
                    className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                  >
                    {stageCounts['washing']}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="drying" 
                className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative"
              >
                Drying
                {stageCounts['drying'] > 0 && (
                  <Badge 
                    variant="default" 
                    className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                  >
                    {stageCounts['drying']}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="ironing" 
                className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative"
              >
                Ironing
                {stageCounts['ironing'] > 0 && (
                  <Badge 
                    variant="default" 
                    className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                  >
                    {stageCounts['ironing']}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="packing" 
                className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative"
              >
                Packing
                {stageCounts['packing'] > 0 && (
                  <Badge 
                    variant="default" 
                    className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                  >
                    {stageCounts['packing']}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="ready" 
                className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative"
              >
                Ready
                {stageCounts['ready'] > 0 && (
                  <Badge 
                    variant="default" 
                    className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                  >
                    {stageCounts['ready']}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="pickup-delivery" 
                className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative"
              >
                Pickup/Delivery
                {stageCounts['pickup-delivery'] > 0 && (
                  <Badge 
                    variant="default" 
                    className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                  >
                    {stageCounts['pickup-delivery']}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Services & Promo Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Services & Promo
              </span>
              <div className="h-px flex-1 bg-border"></div>
            </div>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-2 lg:w-auto gap-2 p-2 bg-transparent">
              <TabsTrigger value="services" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">Layanan</TabsTrigger>
              <TabsTrigger value="promo" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">Promo</TabsTrigger>
            </TabsList>
          </div>

          {/* Management Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Management
              </span>
              <div className="h-px flex-1 bg-border"></div>
            </div>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 lg:w-auto gap-2 p-2 bg-transparent">
              <TabsTrigger value="outlets" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">Outlet</TabsTrigger>
              <TabsTrigger value="customers" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">Pelanggan</TabsTrigger>
              <TabsTrigger value="machines" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">Mesin</TabsTrigger>
              <TabsTrigger value="reports" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">Laporan</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="workflow-overview" className="space-y-4">
            <WorkflowOverview />
          </TabsContent>

          <TabsContent value="reception" className="space-y-4">
            <ReceptionView />
          </TabsContent>

          <TabsContent value="sorting" className="space-y-4">
            <SortingView />
          </TabsContent>

          <TabsContent value="washing" className="space-y-4">
            <WashingView />
          </TabsContent>

          <TabsContent value="drying" className="space-y-4">
            <DryingView />
          </TabsContent>

          <TabsContent value="ironing" className="space-y-4">
            <IronView />
          </TabsContent>

          <TabsContent value="packing" className="space-y-4">
            <PackingView />
          </TabsContent>

          <TabsContent value="ready" className="space-y-4">
            <ReadyView />
          </TabsContent>

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

          <TabsContent value="promo" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Promo Management</h3>
              <p className="text-muted-foreground">
                Fitur promo akan segera tersedia. Di sini Anda dapat mengelola promosi dan diskon untuk layanan.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="outlets" className="space-y-4">
            <OutletForm />
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
