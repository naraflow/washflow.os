import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Machine } from "../../types";
import { toast } from "sonner";

interface MachineModalProps {
  machine?: Machine | null;
  onClose: () => void;
}

export const MachineModal = ({ machine, onClose }: MachineModalProps) => {
  const addMachine = useDashboardStore((state) => state.addMachine);
  const updateMachine = useDashboardStore((state) => state.updateMachine);

  const [formData, setFormData] = useState({
    name: "",
    type: "washer" as Machine["type"],
    serialNumber: "",
    capacity: 10,
    iotEnabled: false,
  });

  useEffect(() => {
    if (machine) {
      setFormData({
        name: machine.name,
        type: machine.type,
        serialNumber: machine.serialNumber,
        capacity: machine.capacity,
        iotEnabled: machine.iotEnabled,
      });
    }
  }, [machine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.serialNumber || formData.capacity <= 0) {
      toast.error("Nama, serial number, dan kapasitas wajib diisi");
      return;
    }

    const machineData: Machine = {
      id: machine?.id || `machine-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      serialNumber: formData.serialNumber,
      capacity: formData.capacity,
      status: machine?.status || "empty",
      iotEnabled: formData.iotEnabled,
      currentOrderId: machine?.currentOrderId,
      timer: machine?.timer,
      createdAt: machine?.createdAt || new Date().toISOString(),
    };

    if (machine) {
      updateMachine(machine.id, machineData);
      toast.success("Mesin berhasil diperbarui");
    } else {
      addMachine(machineData);
      toast.success("Mesin berhasil ditambahkan");
    }

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{machine ? "Edit Mesin" : "Tambah Mesin"}</DialogTitle>
          <DialogDescription>
            {machine ? "Perbarui informasi mesin" : "Tambahkan mesin baru ke sistem"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Mesin *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Mesin Cuci 1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Mesin *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as Machine["type"] })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="washer">Mesin Cuci</SelectItem>
                  <SelectItem value="dryer">Mesin Pengering</SelectItem>
                  <SelectItem value="iron">Mesin Setrika</SelectItem>
                  <SelectItem value="folder">Mesin Lipat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Kapasitas (kg) *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number *</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="Contoh: MC-001"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="iotEnabled"
              checked={formData.iotEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, iotEnabled: checked as boolean })}
            />
            <Label htmlFor="iotEnabled" className="cursor-pointer">
              IoT Enabled (Remote monitoring & control)
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              {machine ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

