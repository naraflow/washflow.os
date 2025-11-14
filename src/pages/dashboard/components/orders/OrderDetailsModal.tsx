import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Printer } from "lucide-react";
import type { Order } from "../../types";
import { format } from "date-fns";

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPrint: () => void;
}

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ready":
      return "bg-green-100 text-green-800 border-green-200";
    case "completed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "processing":
      return "Diproses";
    case "ready":
      return "Siap";
    case "completed":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
    default:
      return status;
  }
};

export const OrderDetailsModal = ({
  order,
  onClose,
  onEdit,
  onDelete,
  onPrint,
}: OrderDetailsModalProps) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detail Order #{order.id}
            <Badge className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-2">Informasi Pelanggan</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Nama:</strong> {order.customerName}</p>
              <p><strong>Telepon:</strong> {order.customerPhone}</p>
            </div>
          </div>

          {/* Order Info */}
          <div>
            <h3 className="font-semibold mb-2">Detail Order</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Layanan:</strong> {order.serviceName || "N/A"}</p>
              <p><strong>Berat:</strong> {order.weight} kg</p>
              {order.express && <p><strong>Express:</strong> Ya</p>}
              <p><strong>Tanggal:</strong> {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</p>
              {order.completedAt && (
                <p><strong>Selesai:</strong> {format(new Date(order.completedAt), "dd/MM/yyyy HH:mm")}</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="font-semibold mb-2">Rincian Harga</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Harga per kg:</span>
                <span>Rp {order.unitPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon:</span>
                  <span>-Rp {order.discount.toLocaleString("id-ID")}</span>
                </div>
              )}
              {order.surcharge > 0 && (
                <div className="flex justify-between">
                  <span>Tambahan:</span>
                  <span>+Rp {order.surcharge.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="border-t pt-1 mt-1 flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-primary">Rp {order.totalAmount.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="font-semibold mb-2">Pembayaran</h3>
            <p className="text-sm">
              <strong>Metode:</strong> {
                order.paymentMethod === "cash" ? "Tunai" :
                order.paymentMethod === "transfer" ? "Transfer" :
                order.paymentMethod === "qris" ? "QRIS" : "Kredit"
              }
            </p>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="font-semibold mb-2">Catatan</h3>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onEdit} className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={onPrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Cetak Struk
            </Button>
            <Button variant="outline" onClick={onDelete} className="flex-1 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

