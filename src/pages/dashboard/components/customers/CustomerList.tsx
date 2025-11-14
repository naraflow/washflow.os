import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Trash2, Phone, MapPin } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Customer } from "../../types";
import { format } from "date-fns";
import { CustomerModal } from "./CustomerModal";

export const CustomerList = () => {
  const customers = useDashboardStore((state) => state.customers);
  const deleteCustomer = useDashboardStore((state) => state.deleteCustomer);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCustomers = [...filteredCustomers].sort(
    (a, b) => b.totalOrders - a.totalOrders
  );

  const handleAdd = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) {
      deleteCustomer(id);
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
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pelanggan
        </Button>
      </div>

      {sortedCustomers.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery
              ? "Tidak ada pelanggan yang sesuai"
              : "Belum ada pelanggan. Tambah pelanggan baru untuk memulai."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedCustomers.map((customer) => (
            <Card key={customer.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-lg">{customer.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3" />
                    {customer.phone}
                  </div>
                  {customer.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Order</p>
                    <p className="font-semibold">{customer.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Belanja</p>
                    <p className="font-semibold text-primary">
                      Rp {customer.totalSpent.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {customer.lastOrderDate && (
                  <p className="text-xs text-muted-foreground">
                    Order terakhir: {format(new Date(customer.lastOrderDate), "dd/MM/yyyy")}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(customer)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(customer.id)}
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
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </div>
  );
};

