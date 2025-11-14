import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Service } from "../../types";
import { toast } from "sonner";

interface ServiceModalProps {
  service?: Service | null;
  onClose: () => void;
}

export const ServiceModal = ({ service, onClose }: ServiceModalProps) => {
  const addService = useDashboardStore((state) => state.addService);
  const updateService = useDashboardStore((state) => state.updateService);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "regular" as Service["type"],
    unitPrice: 0,
    unit: "kg" as Service["unit"],
    isActive: true,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || "",
        type: service.type,
        unitPrice: service.unitPrice,
        unit: service.unit,
        isActive: service.isActive,
      });
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.unitPrice <= 0) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }

    const serviceData: Service = {
      id: service?.id || `svc-${Date.now()}`,
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      unitPrice: formData.unitPrice,
      unit: formData.unit,
      isActive: formData.isActive,
      isDefault: service?.isDefault || false,
      createdAt: service?.createdAt || new Date().toISOString(),
    };

    if (service) {
      updateService(service.id, serviceData);
      toast.success("Layanan berhasil diperbarui");
    } else {
      addService(serviceData);
      toast.success("Layanan berhasil ditambahkan");
    }

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "Edit Layanan" : "Tambah Layanan"}</DialogTitle>
          <DialogDescription>
            {service ? "Perbarui informasi layanan" : "Tambahkan layanan baru ke sistem"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Layanan *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Layanan *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as Service["type"] })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="wash_iron">Cuci + Setrika</SelectItem>
                  <SelectItem value="iron_only">Setrika Saja</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="dry_clean">Dry Clean</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Satuan *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value as Service["unit"] })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="piece">Potong</SelectItem>
                  <SelectItem value="item">Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitPrice">Harga per {formData.unit} *</Label>
            <Input
              id="unitPrice"
              type="number"
              min="0"
              step="100"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              {service ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

