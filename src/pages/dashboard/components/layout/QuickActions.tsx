import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Users, BarChart3, Download, Truck, Settings } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";

interface QuickActionsProps {
  onNewOrder: () => void;
  onExport: () => void;
}

export const QuickActions = ({ onNewOrder, onExport }: QuickActionsProps) => {
  const setSelectedTab = useDashboardStore((state) => state.setSelectedTab);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button onClick={onNewOrder} className="gap-2">
        <Plus className="h-4 w-4" />
        Order Baru
      </Button>
      <Button variant="outline" onClick={() => setSelectedTab('orders')} className="gap-2">
        <ClipboardList className="h-4 w-4" />
        Lihat Orders
      </Button>
      <Button variant="outline" onClick={() => setSelectedTab('customers')} className="gap-2">
        <Users className="h-4 w-4" />
        Pelanggan
      </Button>
      <Button variant="outline" onClick={() => setSelectedTab('pickup-delivery')} className="gap-2">
        <Truck className="h-4 w-4" />
        Pickup/Delivery
      </Button>
      <Button variant="outline" onClick={() => setSelectedTab('machines')} className="gap-2">
        <Settings className="h-4 w-4" />
        Mesin
      </Button>
      <Button variant="outline" onClick={() => setSelectedTab('reports')} className="gap-2">
        <BarChart3 className="h-4 w-4" />
        Laporan
      </Button>
      <Button variant="outline" onClick={onExport} className="gap-2">
        <Download className="h-4 w-4" />
        Export Data
      </Button>
    </div>
  );
};

