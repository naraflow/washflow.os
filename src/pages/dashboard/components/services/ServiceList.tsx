import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Service } from "../../types";
import { ServiceModal } from "./ServiceModal";
import { toast } from "sonner";

export const ServiceList = () => {
  const services = useDashboardStore((state) => state.services);
  const deleteService = useDashboardStore((state) => state.deleteService);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const activeServices = services.filter((s) => s.isActive);

  const handleAdd = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const service = services.find((s) => s.id === id);
    if (service?.isDefault) {
      toast.error("Layanan default tidak dapat dihapus");
      return;
    }

    if (confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      deleteService(id);
      toast.success("Layanan berhasil dihapus");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Layanan
        </Button>
      </div>

      {activeServices.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Belum ada layanan. Tambah layanan baru untuk memulai.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeServices.map((service) => (
            <Card key={service.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{service.name}</h4>
                    {service.isDefault && (
                      <Badge variant="outline" className="mt-1">Default</Badge>
                    )}
                  </div>
                </div>

                {service.description && (
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                )}

                <div className="pt-2 border-t">
                  <p className="text-2xl font-bold text-primary">
                    Rp {service.unitPrice.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-muted-foreground">per {service.unit}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {!service.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setIsModalOpen(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
};

