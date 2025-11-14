import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";

interface QuickActionsProps {
  onNewOrder: () => void;
}

export const QuickActions = ({ onNewOrder }: QuickActionsProps) => {
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
    </div>
  );
};

