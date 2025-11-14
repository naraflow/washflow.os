import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { PickupDelivery } from "../../types";
import { toast } from "sonner";

interface PickupDeliveryModalProps {
  pickupDelivery?: PickupDelivery | null;
  onClose: () => void;
}

export const PickupDeliveryModal = ({ pickupDelivery, onClose }: PickupDeliveryModalProps) => {
  const addPickupDelivery = useDashboardStore((state) => state.addPickupDelivery);
  const updatePickupDelivery = useDashboardStore((state) => state.updatePickupDelivery);
  const orders = useDashboardStore((state) => state.orders);
  const staff = useDashboardStore((state) => state.staff);

  const [formData, setFormData] = useState({
    type: "pickup" as "pickup" | "delivery",
    customerName: "",
    customerPhone: "",
    address: "",
    notes: "",
    courierId: "",
    orderId: "",
    scheduledDate: "",
  });

  useEffect(() => {
    if (pickupDelivery) {
      setFormData({
        type: pickupDelivery.type,
        customerName: pickupDelivery.customerName,
        customerPhone: pickupDelivery.customerPhone,
        address: pickupDelivery.address,
        notes: pickupDelivery.notes || "",
        courierId: pickupDelivery.courierId || "",
        orderId: pickupDelivery.orderId || "",
        scheduledDate: pickupDelivery.scheduledDate || "",
      });
    }
  }, [pickupDelivery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || !formData.address) {
      toast.error("Nama, telepon, dan alamat wajib diisi");
      return;
    }

    const courier = staff.find((s) => s.id === formData.courierId && s.role === "kurir");

    const pdData: PickupDelivery = {
      id: pickupDelivery?.id || `pd-${Date.now()}`,
      type: formData.type,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      address: formData.address,
      notes: formData.notes || undefined,
      status: pickupDelivery?.status || "pending",
      courierId: formData.courierId || undefined,
      courierName: courier?.name,
      orderId: formData.orderId || undefined,
      scheduledDate: formData.scheduledDate || undefined,
      completedAt: pickupDelivery?.completedAt,
      createdAt: pickupDelivery?.createdAt || new Date().toISOString(),
    };

    if (pickupDelivery) {
      updatePickupDelivery(pickupDelivery.id, pdData);
      toast.success("Pickup/Delivery berhasil diperbarui");
    } else {
      addPickupDelivery(pdData);
      toast.success("Pickup/Delivery berhasil ditambahkan");
    }

    onClose();
  };

  const availableOrders = orders.filter((o) => o.status !== "completed" && !o.pickupDelivery);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {pickupDelivery ? "Edit" : "Tambah"} {formData.type === "pickup" ? "Pickup" : "Delivery"}
          </DialogTitle>
          <DialogDescription>
            {pickupDelivery
              ? "Perbarui informasi pickup/delivery"
              : "Tambahkan pickup/delivery baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipe *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as "pickup" | "delivery" })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pickup">Pickup (Jemput)</SelectItem>
                <SelectItem value="delivery">Delivery (Antar)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nama Pelanggan *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Nomor Telepon *</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courierId">Kurir</Label>
              <Select
                value={formData.courierId}
                onValueChange={(value) => setFormData({ ...formData, courierId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kurir" />
                </SelectTrigger>
                <SelectContent>
                  {staff
                    .filter((s) => s.role === "kurir" && s.status === "active")
                    .map((kurir) => (
                      <SelectItem key={kurir.id} value={kurir.id}>
                        {kurir.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">Link ke Order</Label>
              <Select
                value={formData.orderId}
                onValueChange={(value) => setFormData({ ...formData, orderId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {availableOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      #{order.id} - {order.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Jadwal</Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Catatan tambahan..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              {pickupDelivery ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

