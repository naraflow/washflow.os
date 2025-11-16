import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Order } from "../../types";
import { toast } from "sonner";
import { CheckCircle2, Circle, Radio, Camera, Upload, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface TaggingModalProps {
  order: Order;
  onClose: () => void;
  onTagged: () => void;
}

export const TaggingModal = ({ order, onClose, onTagged }: TaggingModalProps) => {
  const updateOrder = useDashboardStore((state) => state.updateOrder);
  const currentRole = useDashboardStore((state) => state.currentRole);
  const [rfidUid, setRfidUid] = useState("");
  const [tagType, setTagType] = useState<'rfid' | 'qr'>('rfid');
  const [taggingPhoto, setTaggingPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isMissingRfid, setIsMissingRfid] = useState(false);
  const [rfidError, setRfidError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rfidInputRef = useRef<HTMLInputElement>(null);

  // Steps progress
  const steps = [
    { id: 1, label: "Order berhasil dibuat", completed: true },
    { id: 2, label: "Tempelkan tag RFID ke cucian", completed: false },
    { id: 3, label: "Tap tag ke RFID reader", completed: false },
    { id: 4, label: "Sistem membaca UID", completed: rfidUid.length > 0 },
    { id: 5, label: "Tag berhasil terhubung", completed: false },
  ];

  // Validate RFID UID format
  const validateRfidUid = (uid: string): boolean => {
    if (!uid || uid.trim().length === 0) {
      return false;
    }
    // Accept formats like: XXXX-XXXX-XXXX or XXXXXXXXXXXX
    const cleaned = uid.replace(/-/g, '').toUpperCase();
    // Should be alphanumeric and at least 8 characters
    return /^[A-Z0-9]{8,}$/.test(cleaned);
  };

  // Simulate RFID scan (in real app, this would connect to RFID reader)
  const handleScanRFID = () => {
    setIsScanning(true);
    setRfidError(null);
    setIsMissingRfid(false);
    // Simulate RFID reader scan
    setTimeout(() => {
      // Generate mock RFID UID
      const mockUid = `${Math.random().toString(16).substr(2, 4).toUpperCase()}-${Math.random().toString(16).substr(2, 4).toUpperCase()}-${Math.random().toString(16).substr(2, 4).toUpperCase()}`;
      setRfidUid(mockUid);
      setIsScanning(false);
      toast.success("RFID tag berhasil dibaca!");
    }, 1500);
  };

  // Handle manual RFID input
  const handleRfidInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setRfidUid(value);
    setRfidError(null);
    setIsMissingRfid(false);
    
    // Validate on blur or when user stops typing
    if (value.length > 0 && !validateRfidUid(value)) {
      setRfidError("Format RFID UID tidak valid. Gunakan format: XXXX-XXXX-XXXX");
    }
  };

  // Handle Missing RFID flow
  const handleMissingRfid = () => {
    setIsMissingRfid(true);
    setRfidUid("");
    setRfidError(null);
    toast.info("Mode Missing RFID diaktifkan. Anda dapat melanjutkan tanpa RFID atau menggunakan QR Code.");
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTaggingPhoto(reader.result as string);
        toast.success("Foto berhasil diambil");
      };
      reader.readAsDataURL(file);
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTaggingPhoto(reader.result as string);
        toast.success("Foto berhasil diupload");
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    // Validate RFID if not in missing RFID mode
    if (tagType === 'rfid' && !isMissingRfid) {
      if (!rfidUid || rfidUid.trim().length === 0) {
        setRfidError("Mohon scan atau masukkan RFID UID terlebih dahulu");
        toast.error("RFID UID tidak boleh kosong");
        return;
      }
      
      if (!validateRfidUid(rfidUid)) {
        setRfidError("Format RFID UID tidak valid. Gunakan format: XXXX-XXXX-XXXX");
        toast.error("Format RFID UID tidak valid");
        return;
      }
    }

    // If missing RFID, switch to QR code
    const finalTagType = isMissingRfid ? 'qr' : tagType;
    const finalTagId = isMissingRfid ? `QR-MISSING-${order.id}-${Date.now()}` : (rfidUid || `QR-${order.id}`);

    // Update order with tagging information
    const updatedOrder: Partial<Order> = {
      rfidTagId: finalTagId,
      taggingStatus: 'tagged',
      taggedBy: currentRole === 'supervisor-outlet' ? 'Supervisor Outlet' : 
                currentRole === 'supervisor' ? 'Supervisor' : 'System',
      taggedAt: new Date().toISOString(),
      tagType: finalTagType,
      currentStage: 'sorting', // Auto-move to sorting
      status: 'processing', // Update status to processing when RFID is tagged
      updatedAt: new Date().toISOString(),
      // Store tagging photo if uploaded
      initialConditionPhotos: taggingPhoto 
        ? [...(order.initialConditionPhotos || []), taggingPhoto]
        : order.initialConditionPhotos,
      // Add workflow log
      workflowLogs: [
        ...(order.workflowLogs || []),
        {
          id: `log-${Date.now()}`,
          orderId: order.id,
          oldStep: 'reception',
          newStep: 'sorting',
          changedAt: new Date().toISOString(),
          changedBy: currentRole === 'supervisor-outlet' ? 'Supervisor Outlet' : 
                     currentRole === 'supervisor' ? 'Supervisor' : 'System',
          notes: isMissingRfid 
            ? `Tag QR Code digunakan (RFID hilang): ${finalTagId}`
            : `Tag ${finalTagType.toUpperCase()} berhasil dipasang: ${finalTagId}`,
        },
      ],
    };

    updateOrder(order.id, updatedOrder);
    toast.success(
      isMissingRfid 
        ? "Tagging berhasil dengan QR Code (RFID hilang)! Order dipindahkan ke Sorting Queue"
        : "Tagging berhasil! Order dipindahkan ke Sorting Queue"
    );
    onTagged();
    onClose();
  };

  // Calculate total weight from services
  const totalWeight = order.services?.reduce((sum, s) => sum + (s.weight || s.quantity || 0), 0) || order.weight || 0;
  const serviceNames = order.services?.map(s => s.serviceName).join(", ") || order.serviceName || "Layanan";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tag & Identifikasi Cucian</DialogTitle>
          <DialogDescription>
            Order #{order.id} - {order.customerName}
          </DialogDescription>
        </DialogHeader>

        {/* Steps Progress */}
        <Card className="p-4 mb-4">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={step.completed ? "text-green-700 font-medium" : "text-muted-foreground"}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Order Info */}
        <Card className="p-4 mb-4 bg-muted/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Customer:</span>
              <p className="font-semibold">{order.customerName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Berat:</span>
              <p className="font-semibold">{totalWeight} kg</p>
            </div>
            <div>
              <span className="text-muted-foreground">Layanan:</span>
              <p className="font-semibold">{serviceNames}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p className="font-semibold">{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</p>
            </div>
            {order.express && (
              <div className="col-span-2">
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  Express Order
                </Badge>
              </div>
            )}
          </div>
        </Card>

        {/* RFID Scanning */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tag Type</Label>
            <Select value={tagType} onValueChange={(value) => setTagType(value as 'rfid' | 'qr')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rfid">RFID Tag</SelectItem>
                <SelectItem value="qr">QR Code (Fallback)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tagType === 'rfid' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>RFID UID</Label>
                {!isMissingRfid && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleMissingRfid}
                    className="text-xs text-destructive hover:text-destructive"
                    data-testid="missing-rfid-button"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    RFID Hilang?
                  </Button>
                )}
              </div>
              {isMissingRfid ? (
                <Card className="p-3 bg-yellow-50 border-yellow-200">
                  <p className="text-sm text-yellow-800 mb-2">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    <strong>Mode Missing RFID:</strong> RFID tag tidak tersedia. Sistem akan menggunakan QR Code sebagai pengganti.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsMissingRfid(false);
                      setRfidUid("");
                      setRfidError(null);
                      rfidInputRef.current?.focus();
                    }}
                  >
                    Kembali ke Mode RFID
                  </Button>
                </Card>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      ref={rfidInputRef}
                      value={rfidUid}
                      onChange={handleRfidInputChange}
                      onBlur={() => {
                        if (rfidUid && !validateRfidUid(rfidUid)) {
                          setRfidError("Format RFID UID tidak valid. Gunakan format: XXXX-XXXX-XXXX");
                        }
                      }}
                      placeholder="32AC-9921-55F7 atau masukkan manual"
                      className="font-mono"
                      data-testid="rfid-uid-input"
                      autoFocus
                    />
                    <Button
                      type="button"
                      onClick={handleScanRFID}
                      disabled={isScanning}
                      className="gap-2"
                      data-testid="scan-rfid-button"
                    >
                      <Radio className="h-4 w-4" />
                      {isScanning ? "Scanning..." : "Scan RFID"}
                    </Button>
                  </div>
                  {rfidError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {rfidError}
                    </p>
                  )}
                  {rfidUid && !rfidError && validateRfidUid(rfidUid) && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      RFID UID valid: {rfidUid}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Foto Cucian dengan Tag</Label>
            <div className="flex gap-2">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                className="gap-2"
                data-testid="capture-photo-button"
              >
                <Camera className="h-4 w-4" />
                Ambil Foto
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadPhoto}
                className="hidden"
                data-testid="upload-photo-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
                data-testid="upload-photo-button"
              >
                <Upload className="h-4 w-4" />
                Upload Foto
              </Button>
            </div>
            {taggingPhoto && (
              <div className="relative mt-2">
                <img
                  src={taggingPhoto}
                  alt="Tagged laundry"
                  className="w-full h-48 object-cover rounded border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setTaggingPhoto(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Warning */}
          <Card className="p-3 bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Peringatan:</strong> Pastikan tag terpasang di sisi kain agar tidak lepas.
            </p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={tagType === 'rfid' && !isMissingRfid && (!rfidUid || !validateRfidUid(rfidUid))}
            data-testid="save-tagging-button"
          >
            Simpan Tagging
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

