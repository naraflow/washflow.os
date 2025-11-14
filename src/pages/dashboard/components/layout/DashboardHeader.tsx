import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardStore } from "../../store/useDashboardStore";
import { format } from "date-fns";

export const DashboardHeader = () => {
  const orders = useDashboardStore((state) => state.orders);
  const customers = useDashboardStore((state) => state.customers);
  
  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(
    (o) => o.createdAt.split('T')[0] === today
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">washflow.os</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-sm">
              <span className="text-muted-foreground">Hari Ini</span>
              <p className="font-semibold text-primary">Rp {todayRevenue.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Orders</span>
              <p className="font-semibold">{todayOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <p className="font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

