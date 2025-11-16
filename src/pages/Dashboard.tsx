import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
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
import { SortingView } from "./dashboard/components/workflow/SortingView";
import { WashingView } from "./dashboard/components/workflow/WashingView";
import { DryingView } from "./dashboard/components/workflow/DryingView";
import { IronView } from "./dashboard/components/workflow/IronView";
import { PackingView } from "./dashboard/components/workflow/PackingView";
import { ReadyView } from "./dashboard/components/workflow/ReadyView";
import { TaggingView } from "./dashboard/components/orders/TaggingView";
import { OutletTaggingView } from "./dashboard/components/workflow-outlet/OutletTaggingView";
import { OutletSortingView } from "./dashboard/components/workflow-outlet/OutletSortingView";
import { SendToCentralView } from "./dashboard/components/workflow-outlet/SendToCentralView";
import { ReceiveFromOutletView } from "./dashboard/components/workflow-produksi/ReceiveFromOutletView";
import { useDashboardStore } from "./dashboard/store/useDashboardStore";
import { useMachineTimer } from "./dashboard/hooks/useMachineTimer";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { WorkflowStage } from "./dashboard/types/workflow";

const Dashboard = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const setSelectedTab = useDashboardStore((state) => state.setSelectedTab);
  const selectedTab = useDashboardStore((state) => state.selectedTab);
  const orders = useDashboardStore((state) => state.orders);
  const currentRole = useDashboardStore((state) => state.currentRole);
  const setCurrentRole = useDashboardStore((state) => state.setCurrentRole);
  const isLoggedIn = useDashboardStore((state) => state.isLoggedIn);
  const setIsLoggedIn = useDashboardStore((state) => state.setIsLoggedIn);
  
  // Start machine timer updates
  useMachineTimer();

  // Set default tab based on role when role changes
  useEffect(() => {
    if (currentRole === 'kasir') {
      setSelectedTab('orders');
    } else if (currentRole === 'owner') {
      setSelectedTab('reports');
    } else if (currentRole === 'supervisor-outlet') {
      // Check if there are pending tagging orders
      const pendingTagging = orders.filter(
        (o) => o.taggingRequired && o.taggingStatus === 'pending'
      );
      setSelectedTab(pendingTagging.length > 0 ? 'outlet-tagging' : 'outlet-tagging');
    } else if (currentRole === 'supervisor-produksi') {
      setSelectedTab('receive-from-outlet');
    } else if (currentRole === 'supervisor') {
      // Legacy supervisor - backward compatibility
      const pendingTagging = orders.filter(
        (o) => o.taggingRequired && o.taggingStatus === 'pending'
      );
      setSelectedTab(pendingTagging.length > 0 ? 'tagging' : 'workflow-overview');
    }
  }, [currentRole, setSelectedTab, orders]);

  // Calculate order counts per stage
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'workflow-overview': 0, // Overview doesn't need count
      'tagging': 0, // Tagging pending orders
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
      // Count pending tagging orders (only if not yet tagged)
      if (order.taggingRequired && order.taggingStatus === 'pending') {
        counts['tagging']++;
      }
      
      const currentStage = order.currentStage || 'reception';
      
      // Map stage to tab value
      // Note: 'reception' stage is for admin/kasir only, supervisor starts from tagging
      // After tagging, order goes directly to sorting
      if (currentStage === 'reception') {
        // Reception stage is only counted for admin view, not supervisor workflow
        counts['reception']++;
      } else if (currentStage === 'sorting') counts['sorting']++;
      else if (currentStage === 'washing') counts['washing']++;
      else if (currentStage === 'drying') counts['drying']++;
      else if (currentStage === 'ironing') counts['ironing']++;
      else if (currentStage === 'packing') counts['packing']++;
      else if (currentStage === 'ready') {
        counts['ready']++;
        // Also count for pickup-delivery badge (orders ready for pickup)
        if (order.status !== 'completed') {
          counts['pickup-delivery']++;
        }
      }
      // Count orders in 'picked' stage but not yet completed (in transit)
      else if (currentStage === 'picked' && order.status !== 'completed') {
        counts['pickup-delivery']++;
      }
    });

    return counts;
  }, [orders]);

  // Role-based permissions
  // Admin (Kasir): hanya create order, history order, tambah customer - TIDAK menangani barang fisik
  // Supervisor Outlet: Tagging, Outlet Sorting, Send to Central, Received from Central, Ready, Delivery
  // Supervisor Produksi: Receive from Outlet, Central Sorting, Washing, Drying, Ironing, QC, Packing, Send to Outlet
  // Owner: fokus ke laporan
  
  // Workflow access
  const isSupervisorOutlet = currentRole === 'supervisor-outlet';
  const isSupervisorProduksi = currentRole === 'supervisor-produksi';
  const isSupervisorLegacy = currentRole === 'supervisor'; // Backward compatibility
  const canAccessWorkflow = isSupervisorOutlet || isSupervisorProduksi || isSupervisorLegacy;
  
  // Other permissions
  const canCreateOrder = currentRole === 'kasir'; // Hanya kasir (admin) yang bisa create order
  const canAccessOrder = currentRole === 'kasir';
  const canAccessCustomers = currentRole === 'kasir' || isSupervisorOutlet || isSupervisorLegacy;
  const canAccessServices = isSupervisorLegacy; // Only legacy supervisor manages services
  const canAccessPromo = isSupervisorOutlet || isSupervisorLegacy; // Supervisor Outlet and legacy supervisor can access promo
  const canAccessManagement = isSupervisorLegacy; // Only legacy supervisor manages machines/outlets
  const canAccessReports = currentRole === 'owner';

  // List of disabled users (in a real app, this would come from the database)
  const disabledUsers = ['disableduser@example.com'];
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Check if user is disabled
      if (disabledUsers.includes(email.toLowerCase())) {
        toast.error("Akun Anda telah dinonaktifkan. Silakan hubungi administrator.");
        return;
      }
      
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
      
      // Check if user is disabled
      if (disabledUsers.includes(email.toLowerCase())) {
        toast.error("Email ini tidak dapat digunakan untuk registrasi.");
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
        totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
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
        {/* QuickActions - hanya untuk kasir (bisa create), supervisor hanya bisa view */}
        {currentRole === 'kasir' && (
          <QuickActions
            onNewOrder={() => setIsOrderModalOpen(true)}
          />
        )}
        {(isSupervisorOutlet || isSupervisorProduksi || isSupervisorLegacy) && (
          <div className="mb-6">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    {isSupervisorOutlet ? 'Supervisor Outlet Dashboard' :
                     isSupervisorProduksi ? 'Supervisor Produksi Dashboard' :
                     'Supervisor Dashboard'}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {isSupervisorOutlet ? 'Fokus pada operasional outlet: Tagging, Outlet Sorting, Send to Central, Received from Central, Ready, Delivery.' :
                     isSupervisorProduksi ? 'Fokus pada operasional produksi: Receive from Outlet, Central Sorting, Washing, Drying, Ironing, QC, Packing, Send to Outlet.' :
                     'Fokus pada operasional: Tagging RFID, Sorting, Washing, Drying, Ironing, QC, Packing, dan Ready.'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          {/* Workflow Section - Supervisor Outlet */}
          {isSupervisorOutlet && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  Supervisor Outlet Workflow
                </span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 lg:w-auto gap-2 p-2 bg-transparent">
                <TabsTrigger 
                  value="outlet-tagging" 
                  className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative cursor-pointer"
                  data-testid="outlet-tagging-tab"
                  type="button"
                >
                  Tagging
                  {stageCounts['tagging'] > 0 && (
                    <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground">
                      {stageCounts['tagging']}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="outlet-sorting" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                  Outlet Sorting
                </TabsTrigger>
                <TabsTrigger value="send-to-central" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                  Send to Central
                </TabsTrigger>
                <TabsTrigger value="received-from-central" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                  Received from Central
                </TabsTrigger>
                <TabsTrigger value="outlet-ready" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative">
                  Ready
                  {stageCounts['ready'] > 0 && (
                    <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground">
                      {stageCounts['ready']}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="delivery" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative">
                  Delivery/Pick Up
                  {stageCounts['pickup-delivery'] > 0 && (
                    <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground">
                      {stageCounts['pickup-delivery']}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          )}

          {/* Workflow Section - Supervisor Produksi */}
          {isSupervisorProduksi && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  Supervisor Produksi Workflow
                </span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 lg:w-auto gap-2 p-2 bg-transparent">
                <TabsTrigger value="receive-from-outlet" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                  Receive from Outlet
                </TabsTrigger>
                <TabsTrigger value="central-sorting" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                  Central Sorting
                </TabsTrigger>
                <TabsTrigger value="washing" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative">
                  Washing
                  {stageCounts['washing'] > 0 && (
                    <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground">
                      {stageCounts['washing']}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="drying" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative">
                  Drying
                  {stageCounts['drying'] > 0 && (
                    <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground">
                      {stageCounts['drying']}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="ironing" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative">
                  Ironing
                  {stageCounts['ironing'] > 0 && (
                    <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground">
                      {stageCounts['ironing']}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="qc" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                  QC
                </TabsTrigger>
                <TabsTrigger value="packing" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative">
                  Packing
                  {stageCounts['packing'] > 0 && (
                    <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground">
                      {stageCounts['packing']}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="send-to-outlet" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                  Send to Outlet
                </TabsTrigger>
              </TabsList>
            </div>
          )}

          {/* Workflow Section - Legacy Supervisor (Backward Compatibility) */}
          {isSupervisorLegacy && (
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
                  value="tagging" 
                  className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors relative"
                >
                  Tagging
                  {stageCounts['tagging'] > 0 && (
                    <Badge 
                      variant="default" 
                      className="ml-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                    >
                      {stageCounts['tagging']}
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
          )}

          {/* Services & Promo Section - hanya untuk supervisor dan owner */}
          {canAccessServices && (
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
          )}

          {/* Management Section - untuk kasir (Customers), supervisor (semua), owner (Reports) */}
          {(canAccessCustomers || canAccessManagement || canAccessReports) && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  {currentRole === 'owner' ? 'Laporan' : 'Management'}
                </span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              <TabsList className={`grid w-full gap-2 p-2 bg-transparent ${
                currentRole === 'kasir' ? 'grid-cols-1 lg:grid-cols-1' :
                currentRole === 'owner' ? 'grid-cols-1 lg:grid-cols-1' :
                isSupervisorOutlet ? 'grid-cols-2 lg:grid-cols-2' :
                'grid-cols-3 lg:grid-cols-3'
              }`}>
                {/* Customers - untuk kasir, supervisor outlet, supervisor legacy */}
                {canAccessCustomers && (
                  <TabsTrigger value="customers" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                    Pelanggan
                  </TabsTrigger>
                )}
                {/* Promo - untuk supervisor outlet dan supervisor legacy */}
                {canAccessPromo && (
                  <TabsTrigger value="promo" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                    Promo
                  </TabsTrigger>
                )}
                {/* Outlets, Machines - hanya supervisor legacy */}
                {currentRole === 'supervisor' && (
                  <>
                    <TabsTrigger value="outlets" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                      Outlet
                    </TabsTrigger>
                    <TabsTrigger value="machines" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                      Mesin
                    </TabsTrigger>
                  </>
                )}
                {/* Reports - hanya owner */}
                {canAccessReports && (
                  <TabsTrigger value="reports" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                    Laporan
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
          )}

          {/* Order Tab - hanya untuk kasir/admin (create & manage orders) */}
          {currentRole === 'kasir' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  Orders
                </span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              <TabsList className="grid w-full grid-cols-1 lg:grid-cols-1 lg:w-auto gap-2 p-2 bg-transparent">
                <TabsTrigger value="orders" className="bg-muted border border-border/60 hover:bg-muted/90 hover:border-border transition-colors">
                  History Order
                </TabsTrigger>
          </TabsList>
            </div>
          )}

          {/* TabsContent - Supervisor Outlet */}
          {isSupervisorOutlet && (
            <>
              <TabsContent value="outlet-tagging" className="space-y-4">
                <OutletTaggingView />
              </TabsContent>

              <TabsContent value="outlet-sorting" className="space-y-4">
                <OutletSortingView />
              </TabsContent>

              <TabsContent value="send-to-central" className="space-y-4">
                <SendToCentralView />
              </TabsContent>

              <TabsContent value="received-from-central" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Received from Central</h3>
                  <p className="text-muted-foreground">
                    Fitur ini akan segera tersedia. Di sini Anda dapat menerima barang yang sudah diproses dari central facility.
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="outlet-ready" className="space-y-4">
                <ReadyView />
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4">
                <PickupDeliveryList />
              </TabsContent>
            </>
          )}

          {/* TabsContent - Supervisor Produksi */}
          {isSupervisorProduksi && (
            <>
              <TabsContent value="receive-from-outlet" className="space-y-4">
                <ReceiveFromOutletView />
              </TabsContent>

              <TabsContent value="central-sorting" className="space-y-4">
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

              <TabsContent value="qc" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quality Control</h3>
                  <p className="text-muted-foreground">
                    Fitur QC akan segera tersedia. Di sini Anda dapat melakukan quality control sebelum packing.
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="packing" className="space-y-4">
                <PackingView />
              </TabsContent>

              <TabsContent value="send-to-outlet" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Send to Outlet</h3>
                  <p className="text-muted-foreground">
                    Fitur ini akan segera tersedia. Di sini Anda dapat mengirim barang yang sudah selesai diproses kembali ke outlet.
                  </p>
                </Card>
              </TabsContent>
            </>
          )}

          {/* TabsContent - Legacy Supervisor (Backward Compatibility) */}
          {isSupervisorLegacy && (
            <>
              <TabsContent value="workflow-overview" className="space-y-4">
                <WorkflowOverview />
              </TabsContent>

              <TabsContent value="tagging" className="space-y-4">
                <TaggingView />
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

              <TabsContent value="pickup-delivery" className="space-y-4">
                <PickupDeliveryList />
              </TabsContent>
            </>
          )}

          {/* Order Content - hanya untuk kasir/admin (create & manage orders) */}
          {currentRole === 'kasir' && (
          <TabsContent value="orders" className="space-y-4">
            <OrderList />
          </TabsContent>
          )}

          {/* Customers - untuk kasir, supervisor, owner */}
          {canAccessCustomers && (
            <TabsContent value="customers" className="space-y-4">
              <CustomerList currentRole={currentRole} />
            </TabsContent>
          )}

          {/* Services - untuk supervisor dan owner */}
          {canAccessServices && (
          <TabsContent value="services" className="space-y-4">
            <ServiceList />
          </TabsContent>
          )}

          {/* Promo - untuk supervisor outlet dan supervisor legacy */}
          {canAccessPromo && (
            <TabsContent value="promo" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Promo Management</h3>
                <p className="text-muted-foreground">
                  Fitur promo akan segera tersedia. Di sini Anda dapat mengelola promosi dan diskon untuk layanan.
                </p>
              </Card>
            </TabsContent>
          )}

          {/* Outlets - hanya supervisor */}
          {currentRole === 'supervisor' && (
          <TabsContent value="outlets" className="space-y-4">
            <OutletForm />
          </TabsContent>
          )}

          {/* Machines - hanya supervisor */}
          {currentRole === 'supervisor' && (
          <TabsContent value="machines" className="space-y-4">
            <MachineList />
          </TabsContent>
          )}

          {/* Reports - hanya owner */}
          {canAccessReports && (
          <TabsContent value="reports" className="space-y-4">
            <AdvancedReports />
          </TabsContent>
          )}

          {/* Overview - untuk semua role */}
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
                      .orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
                      .toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Modal - hanya untuk kasir */}
      {currentRole === 'kasir' && isOrderModalOpen && (
        <OrderModal
          order={null}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
