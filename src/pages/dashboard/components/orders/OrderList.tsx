import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Edit, Trash2, Printer } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Order } from "../../types";
import { OrderCard } from "./OrderCard";
import { OrderModal } from "./OrderModal";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { format } from "date-fns";

export const OrderList = () => {
  const orders = useDashboardStore((state) => state.orders);
  const deleteOrder = useDashboardStore((state) => state.deleteOrder);
  const updateOrder = useDashboardStore((state) => state.updateOrder);
  const sortingBags = useDashboardStore((state) => state.sortingBags);
  const updateSortingBag = useDashboardStore((state) => state.updateSortingBag);
  const currentRole = useDashboardStore((state) => state.currentRole);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort by date (newest first)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleDelete = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Business rule: Cannot delete orders that are in production or completed
    if (order.currentStage && ['washing', 'drying', 'ironing', 'packing', 'ready', 'completed'].includes(order.currentStage)) {
      alert(
        `Tidak dapat menghapus order yang sudah dalam tahap produksi.\n\n` +
        `Order saat ini di tahap: ${order.currentStage}\n` +
        `Gunakan fitur "Cancel Order" untuk membatalkan order.`
      );
      return;
    }

    // Business rule: Cannot delete orders that are in transit
    if (order.currentStage === 'in-transit-to-central' || order.sortingMetadata?.status === 'in_transit_central') {
      alert("Tidak dapat menghapus order yang sedang dalam perjalanan ke central.");
      return;
    }

    // Check if admin approval is required
    const requiresAdminApproval = order.sortingMetadata?.status === 'ready_for_central_pickup' || 
                                  order.sortingMetadata?.bagId !== undefined ||
                                  order.status === 'processing';

    if (requiresAdminApproval) {
      const adminPassword = window.prompt(
        `Order ini memerlukan persetujuan admin untuk dihapus.\n\n` +
        `Order: ${order.customerName} - ${order.id}\n` +
        `Status: ${order.sortingMetadata?.status || order.status}\n\n` +
        `Masukkan password admin untuk melanjutkan:`
      );

      if (adminPassword !== 'admin123') {
        alert("Password admin salah. Penghapusan order dibatalkan.");
        return;
      }
    }

    if (confirm(`Apakah Anda yakin ingin menghapus order ${order.id}?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      deleteOrder(orderId);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Business rule: Cannot cancel orders that are in production or completed
    if (order.currentStage && ['washing', 'drying', 'ironing', 'packing', 'ready', 'completed'].includes(order.currentStage)) {
      alert(
        `Tidak dapat membatalkan order yang sudah dalam tahap produksi.\n\n` +
        `Order saat ini di tahap: ${order.currentStage}`
      );
      return;
    }

    // Business rule: Cannot cancel orders that are in transit
    if (order.currentStage === 'in-transit-to-central' || order.sortingMetadata?.status === 'in_transit_central') {
      alert("Tidak dapat membatalkan order yang sedang dalam perjalanan ke central.");
      return;
    }

    // Check if admin approval is required (for orders with items in bags or ready status)
    const requiresAdminApproval = order.sortingMetadata?.status === 'ready_for_central_pickup' || 
                                  order.sortingMetadata?.bagId !== undefined;

    if (requiresAdminApproval) {
      const adminPassword = window.prompt(
        `Order ini memerlukan persetujuan admin untuk dibatalkan.\n\n` +
        `Order: ${order.customerName} - ${order.id}\n` +
        `Status: ${order.sortingMetadata?.status || order.status}\n\n` +
        `Masukkan password admin untuk melanjutkan:`
      );

      // Simple admin password check (in production, this should be proper authentication)
      if (adminPassword !== 'admin123') {
        alert("Password admin salah. Pembatalan order dibatalkan.");
        return;
      }
    }

    const confirmed = window.confirm(
      `Batalkan order ${order.id} untuk ${order.customerName}?\n\n` +
      `Status saat ini: ${order.status}\n` +
      `Tahap: ${order.currentStage || 'reception'}\n\n` +
      `Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    // Helper to get total weight
    const getTotalOrderWeight = (order: Order) => {
      return order.services?.reduce((sum, s) => sum + (s.weight || s.quantity || 0), 0) || order.weight || 0;
    };

    // Update order status to cancelled
    updateOrder(orderId, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
      // Remove from bag if in bag
      sortingMetadata: order.sortingMetadata?.bagId ? {
        ...order.sortingMetadata,
        status: 'cancelled',
      } : order.sortingMetadata,
      // Add workflow log
      workflowLogs: [
        ...(order.workflowLogs || []),
        {
          id: `log-${Date.now()}`,
          orderId: orderId,
          oldStep: order.currentStage || 'reception',
          newStep: 'cancelled',
          changedAt: new Date().toISOString(),
          changedBy: currentRole === 'supervisor-outlet' ? 'Supervisor Outlet' : 
                     currentRole === 'kasir' ? 'Kasir' : 'System',
          notes: `Order dibatalkan${requiresAdminApproval ? ' (dengan persetujuan admin)' : ''}`,
        },
      ],
    });

    // If order was in a bag, remove it and update bag
    if (order.sortingMetadata?.bagId) {
      const bag = sortingBags.find(b => b.id === order.sortingMetadata?.bagId);
      if (bag) {
        const totalWeight = getTotalOrderWeight(order);
        updateSortingBag(bag.id, {
          items: bag.items.filter(id => id !== orderId),
          totalWeight: Math.max(0, (bag.totalWeight || 0) - totalWeight),
          expressCount: order.express ? Math.max(0, bag.expressCount - 1) : bag.expressCount,
          regularCount: order.express ? bag.regularCount : Math.max(0, bag.regularCount - 1),
        });
      }
    }

    alert(`Order ${order.id} berhasil dibatalkan${requiresAdminApproval ? ' (dengan persetujuan admin)' : ''}`);
  };

  const handlePrintReceipt = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Struk - ${order.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .info { margin-bottom: 10px; }
              .line { border-top: 1px dashed #000; margin: 10px 0; }
              table { width: 100%; margin: 10px 0; }
              .total { font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>washflow.os Laundry</h2>
              <p>Struk Order</p>
            </div>
            <div class="info">
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Tanggal:</strong> ${format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</p>
              <p><strong>Pelanggan:</strong> ${order.customerName}</p>
              <p><strong>Telepon:</strong> ${order.customerPhone}</p>
            </div>
            <div class="line"></div>
            <table>
              <tr>
                <td>${order.serviceName || "Layanan"}</td>
                <td align="right">${order.weight} kg</td>
              </tr>
              <tr>
                <td>Harga per kg</td>
                <td align="right">Rp ${order.unitPrice.toLocaleString("id-ID")}</td>
              </tr>
              ${order.discount ? `<tr><td>Diskon</td><td align="right">-Rp ${order.discount.toLocaleString("id-ID")}</td></tr>` : ""}
              ${order.surcharge ? `<tr><td>Tambahan</td><td align="right">+Rp ${order.surcharge.toLocaleString("id-ID")}</td></tr>` : ""}
            </table>
            <div class="line"></div>
            <div class="total" style="text-align: right;">
              Total: Rp ${order.totalAmount.toLocaleString("id-ID")}
            </div>
            <p style="margin-top: 20px; text-align: center; font-size: 12px;">
              Terima kasih atas kunjungan Anda
            </p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari order ID, nama, atau telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Tidak ada order yang sesuai dengan filter"
              : "Belum ada order. Buat order baru untuk memulai."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onView={() => handleViewDetails(order)}
              onEdit={() => handleEdit(order)}
              onDelete={() => handleDelete(order.id)}
              onCancel={() => handleCancelOrder(order.id)}
              onPrint={() => handlePrintReceipt(order)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {isOrderModalOpen && (
        <OrderModal
          order={editingOrder}
          onClose={() => {
            setIsOrderModalOpen(false);
            setEditingOrder(null);
          }}
        />
      )}

      {isDetailsModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            handleEdit(selectedOrder);
          }}
          onDelete={() => {
            setIsDetailsModalOpen(false);
            handleDelete(selectedOrder.id);
          }}
          onPrint={() => handlePrintReceipt(selectedOrder)}
        />
      )}
    </div>
  );
};

