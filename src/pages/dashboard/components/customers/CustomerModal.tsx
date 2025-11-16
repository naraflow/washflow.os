import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Customer } from "../../types";
import { toast } from "sonner";

interface CustomerModalProps {
  customer?: Customer | null;
  onClose: () => void;
}

export const CustomerModal = ({ customer, onClose }: CustomerModalProps) => {
  const addCustomer = useDashboardStore((state) => state.addCustomer);
  const updateCustomer = useDashboardStore((state) => state.updateCustomer);
  const customers = useDashboardStore((state) => state.customers);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        address: customer.address || "",
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error("Nama dan nomor telepon wajib diisi");
      return;
    }

    // Check if phone already exists (for new customers)
    if (!customer) {
      const existingCustomer = customers.find((c) => c.phone === formData.phone);
      if (existingCustomer) {
        toast.error("Nomor telepon sudah terdaftar");
        return;
      }
    }

    const customerData: Customer = {
      id: customer?.id || `cust-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      totalOrders: customer?.totalOrders || 0,
      totalSpent: customer?.totalSpent || 0,
      lastOrderDate: customer?.lastOrderDate,
      createdAt: customer?.createdAt || new Date().toISOString(),
    };

    if (customer) {
      // Update existing customer (local state only for now)
      updateCustomer(customer.id, customerData);
      toast.success("Pelanggan berhasil diperbarui");
      onClose();
    } else {
      // Create new customer - try API first, fallback to local state
      try {
        const response = await fetch('/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            email: formData.email || undefined,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Use the customer data from API response if available
          if (result.data) {
            addCustomer(result.data);
            toast.success("Pelanggan berhasil ditambahkan");
          } else {
            // Fallback to local state if API doesn't return data
            addCustomer(customerData);
            toast.success("Pelanggan berhasil ditambahkan");
          }
        } else {
          // API failed, use local state as fallback
          console.warn('API call failed, using local state:', response.status);
          addCustomer(customerData);
          toast.success("Pelanggan berhasil ditambahkan (local)");
        }
      } catch (error) {
        // Network error or API unavailable, use local state
        console.warn('API call error, using local state:', error);
        addCustomer(customerData);
        toast.success("Pelanggan berhasil ditambahkan (local)");
      }
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Pelanggan" : "Tambah Pelanggan"}</DialogTitle>
          <DialogDescription>
            {customer ? "Perbarui informasi pelanggan" : "Tambahkan pelanggan baru ke sistem"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              {customer ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

