import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Order } from "../../types";
import { toast } from "sonner";

interface OrderModalProps {
  order?: Order | null;
  onClose: () => void;
}

export const OrderModal = ({ order, onClose }: OrderModalProps) => {
  const services = useDashboardStore((state) => state.services);
  const customers = useDashboardStore((state) => state.customers);
  const addOrder = useDashboardStore((state) => state.addOrder);
  const updateOrder = useDashboardStore((state) => state.updateOrder);
  const updateCustomerStats = useDashboardStore((state) => state.updateCustomerStats);
  const addCustomer = useDashboardStore((state) => state.addCustomer);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    serviceId: "",
    weight: 1,
    express: false,
    discount: 0,
    surcharge: 0,
    paymentMethod: "cash" as Order["paymentMethod"],
    notes: "",
  });

  const [calculatedTotal, setCalculatedTotal] = useState(0);

  useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        serviceId: order.serviceId,
        weight: order.weight,
        express: order.express || false,
        discount: order.discount || 0,
        surcharge: order.surcharge || 0,
        paymentMethod: order.paymentMethod,
        notes: order.notes || "",
      });
    }
  }, [order]);

  useEffect(() => {
    const service = services.find((s) => s.id === formData.serviceId);
    if (service) {
      let subtotal = service.unitPrice * formData.weight;
      if (formData.express) {
        subtotal = subtotal * 1.5; // Express 50% lebih mahal
      }
      const total = subtotal - (formData.discount || 0) + (formData.surcharge || 0);
      setCalculatedTotal(Math.max(0, total));
    } else {
      setCalculatedTotal(0);
    }
  }, [formData, services]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || !formData.serviceId) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    const service = services.find((s) => s.id === formData.serviceId);
    if (!service) {
      toast.error("Layanan tidak ditemukan");
      return;
    }

    // Check if customer exists, if not create one
    let customer = customers.find((c) => c.phone === formData.customerPhone);
    if (!customer) {
      const newCustomer = {
        id: `cust-${Date.now()}`,
        name: formData.customerName,
        phone: formData.customerPhone,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
      addCustomer(newCustomer);
      customer = newCustomer;
    }

    // Generate unique order ID with format: ORD-YYYYMMDD-HHMMSS-XXXX
    const generateOrderId = () => {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${hours}${minutes}${seconds}`; // HHMMSS
      const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
      return `ORD-${dateStr}-${timeStr}-${randomStr}`;
    };

    const orderData: Order = {
      id: order?.id || generateOrderId(),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      serviceId: formData.serviceId,
      serviceName: service.name,
      serviceType: service.type, // Store service type for workflow
      weight: formData.weight,
      unitPrice: service.unitPrice,
      subtotal: service.unitPrice * formData.weight * (formData.express ? 1.5 : 1),
      discount: formData.discount || 0,
      surcharge: formData.surcharge || 0,
      totalAmount: calculatedTotal,
      paymentMethod: formData.paymentMethod,
      status: order?.status || "pending",
      notes: formData.notes,
      express: formData.express,
      createdAt: order?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Initialize workflow tracking
      currentStage: order?.currentStage || 'reception',
      completedStages: order?.completedStages || [],
    };

    if (order) {
      updateOrder(order.id, orderData);
      toast.success("Order berhasil diperbarui");
    } else {
      addOrder(orderData);
      updateCustomerStats(customer.id, calculatedTotal);
      toast.success("Order berhasil ditambahkan");
    }

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? "Edit Order" : "Order Baru"}</DialogTitle>
          <DialogDescription>
            {order ? "Perbarui informasi order" : "Buat order baru untuk pelanggan"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceId">Layanan *</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Layanan" />
                </SelectTrigger>
                <SelectContent>
                  {services
                    .filter((s) => s.isActive)
                    .map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - Rp {service.unitPrice.toLocaleString("id-ID")}/{service.unit}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Berat (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="express"
              checked={formData.express}
              onCheckedChange={(checked) => setFormData({ ...formData, express: checked as boolean })}
            />
            <Label htmlFor="express" className="cursor-pointer">
              Express (50% lebih cepat, +50% harga)
            </Label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Diskon (Rp)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surcharge">Tambahan (Rp)</Label>
              <Input
                id="surcharge"
                type="number"
                min="0"
                value={formData.surcharge}
                onChange={(e) => setFormData({ ...formData, surcharge: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Metode Bayar *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as Order["paymentMethod"] })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                  <SelectItem value="credit">Kredit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan tambahan..."
            />
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">
                Rp {calculatedTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              {order ? "Perbarui" : "Simpan"} Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

