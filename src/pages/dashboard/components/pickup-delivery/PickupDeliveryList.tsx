import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Truck, MapPin, Phone, Edit, Trash2 } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { PickupDelivery } from "../../types";
import { PickupDeliveryModal } from "./PickupDeliveryModal";
import { format } from "date-fns";

export const PickupDeliveryList = () => {
  const pickupsDeliveries = useDashboardStore((state) => state.pickupsDeliveries);
  const orders = useDashboardStore((state) => state.orders);
  const deletePickupDelivery = useDashboardStore((state) => state.deletePickupDelivery);
  const updatePickupDelivery = useDashboardStore((state) => state.updatePickupDelivery);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPD, setEditingPD] = useState<PickupDelivery | null>(null);

  const filteredPD = pickupsDeliveries.filter((pd) => {
    const matchesSearch =
      pd.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pd.customerPhone.includes(searchQuery) ||
      pd.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || pd.type === typeFilter;
    const matchesStatus = statusFilter === "all" || pd.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedPD = [...filteredPD].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleAdd = () => {
    setEditingPD(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pd: PickupDelivery) => {
    setEditingPD(pd);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pickup/delivery ini?")) {
      deletePickupDelivery(id);
    }
  };

  const handleStatusUpdate = (id: string, newStatus: PickupDelivery["status"]) => {
    updatePickupDelivery(id, { status: newStatus });
  };

  const getStatusColor = (status: PickupDelivery["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "enroute":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "arrived":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "picked":
      case "transit":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: PickupDelivery["status"]) => {
    const labels: Record<PickupDelivery["status"], string> = {
      pending: "Menunggu",
      assigned: "Ditugaskan",
      enroute: "Dalam Perjalanan",
      arrived: "Tiba",
      picked: "Diambil",
      transit: "Transit",
      completed: "Selesai",
    };
    return labels[status] || status;
  };

  const getNextStatus = (currentStatus: PickupDelivery["status"], type: "pickup" | "delivery") => {
    if (type === "pickup") {
      switch (currentStatus) {
        case "pending":
          return "assigned";
        case "assigned":
          return "enroute";
        case "enroute":
          return "arrived";
        case "arrived":
          return "picked";
        case "picked":
          return "completed";
        default:
          return currentStatus;
      }
    } else {
      switch (currentStatus) {
        case "pending":
          return "assigned";
        case "assigned":
          return "transit";
        case "transit":
          return "completed";
        default:
          return currentStatus;
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, telepon, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="assigned">Ditugaskan</SelectItem>
            <SelectItem value="enroute">Dalam Perjalanan</SelectItem>
            <SelectItem value="arrived">Tiba</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah
        </Button>
      </div>

      {sortedPD.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery || typeFilter !== "all" || statusFilter !== "all"
              ? "Tidak ada data yang sesuai dengan filter"
              : "Belum ada pickup/delivery. Tambah baru untuk memulai."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedPD.map((pd) => (
            <Card key={pd.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      pd.type === "pickup" ? "bg-blue-100" : "bg-green-100"
                    }`}>
                      <Truck className={`h-4 w-4 ${
                        pd.type === "pickup" ? "text-blue-600" : "text-green-600"
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">
                        {pd.type === "pickup" ? "Pickup" : "Delivery"}
                      </h4>
                      <Badge className={getStatusColor(pd.status)}>
                        {getStatusLabel(pd.status)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{pd.customerName}</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {pd.customerPhone}
                    </div>
                    {pd.address && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3 mt-0.5" />
                        <span className="line-clamp-2">{pd.address}</span>
                      </div>
                    )}
                    {pd.notes && (
                      <p className="text-muted-foreground italic">Catatan: {pd.notes}</p>
                    )}
                    <p className="text-muted-foreground">
                      {format(new Date(pd.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                    {pd.courierName && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Kurir:</span> {pd.courierName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {pd.status !== "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const nextStatus = getNextStatus(pd.status, pd.type);
                        handleStatusUpdate(pd.id, nextStatus);
                      }}
                    >
                      Update Status
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(pd)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(pd.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <PickupDeliveryModal
          pickupDelivery={editingPD}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPD(null);
          }}
        />
      )}
    </div>
  );
};

