import { Button } from "@/components/ui/button";
import { LogOut, User, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDashboardStore } from "../../store/useDashboardStore";
import { format } from "date-fns";
import { WashflowLogo } from "@/components/WashflowLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

const roleLabels: Record<string, string> = {
  kasir: 'Kasir',
  supervisor: 'Supervisor (Legacy)',
  'supervisor-outlet': 'Supervisor Outlet',
  'supervisor-produksi': 'Supervisor Produksi',
  owner: 'Owner',
};

export const DashboardHeader = () => {
  const orders = useDashboardStore((state) => state.orders);
  const customers = useDashboardStore((state) => state.customers);
  const currentRole = useDashboardStore((state) => state.currentRole);
  const setCurrentRole = useDashboardStore((state) => state.setCurrentRole);
  const navigate = useNavigate();
  
  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(
    (o) => o.createdAt.split('T')[0] === today
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <WashflowLogo size={28} animated />
            <span className="text-xl font-bold text-primary">washflow.os</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 ml-6 pl-6 border-l">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Hari Ini</span>
              <span className="font-semibold text-primary">Rp {todayRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Orders</span>
              <span className="font-semibold text-primary">{todayOrders.length}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Admin User</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{roleLabels[currentRole] || currentRole}</span>
                  <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Pilih Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={currentRole} onValueChange={(value) => setCurrentRole(value as 'kasir' | 'supervisor' | 'supervisor-outlet' | 'supervisor-produksi' | 'owner')}>
                  <DropdownMenuRadioItem value="kasir">
                    Kasir
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="supervisor-outlet">
                    Supervisor Outlet
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="supervisor-produksi">
                    Supervisor Produksi
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="supervisor">
                    Supervisor (Legacy)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="owner">
                    Owner
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              useDashboardStore.getState().setIsLoggedIn(false);
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>
    </header>
  );
};

