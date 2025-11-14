import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Customer } from "../../types";
import { format } from "date-fns";
import { Phone, MapPin, Mail, Edit, Trash2 } from "lucide-react";
import { CustomerModal } from "./CustomerModal";

interface CustomerDetailsModalProps {
  customer: Customer;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const CustomerDetailsModal = ({ customer, onClose, onEdit, onDelete }: CustomerDetailsModalProps) => {
  const orders = useDashboardStore((state) => state.orders);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter orders by customer phone number
  const customerOrders = useMemo(() => {
    return orders
      .filter((order) => order.customerPhone === customer.phone)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, customer.phone]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "ready":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Menunggu",
      processing: "Diproses",
      ready: "Siap",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pelanggan</DialogTitle>
            <DialogDescription>Informasi lengkap dan riwayat order pelanggan</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="space-y-4">
            <TabsList>
              <TabsTrigger value="info">Informasi</TabsTrigger>
              <TabsTrigger value="orders">
                Riwayat Order ({customerOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">{customer.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span>{customer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Order</p>
                      <p className="text-2xl font-semibold">{customer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Belanja</p>
                      <p className="text-2xl font-semibold text-primary">
                        Rp {customer.totalSpent.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {customer.lastOrderDate && (
                    <div className="text-sm text-muted-foreground pt-2 border-t">
                      Order terakhir: {format(new Date(customer.lastOrderDate), "dd/MM/yyyy HH:mm")}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditModalOpen(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) {
                          onDelete(customer.id);
                          onClose();
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              {customerOrders.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">Belum ada order untuk pelanggan ini</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((order) => (
                    <Card key={order.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Order #{order.id.slice(-8)}</span>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                            {order.express && (
                              <Badge variant="outline" className="text-xs">
                                Express
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>{order.serviceName || "Layanan"}</div>
                            <div>{order.weight} kg</div>
                            <div>
                              {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            Rp {order.totalAmount.toLocaleString("id-ID")}
                          </div>
                          {order.completedAt && (
                            <div className="text-xs text-muted-foreground">
                              Selesai: {format(new Date(order.completedAt), "dd/MM/yyyy HH:mm")}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {isEditModalOpen && (
        <CustomerModal
          customer={customer}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
};

