import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Settings, Play, Pause, Square } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Machine } from "../../types";
import { MachineModal } from "./MachineModal";
import { toast } from "sonner";

export const MachineList = () => {
  const machines = useDashboardStore((state) => state.machines);
  const orders = useDashboardStore((state) => state.orders);
  const deleteMachine = useDashboardStore((state) => state.deleteMachine);
  const updateMachine = useDashboardStore((state) => state.updateMachine);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  const handleAdd = () => {
    setEditingMachine(null);
    setIsModalOpen(true);
  };

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus mesin ini?")) {
      deleteMachine(id);
      toast.success("Mesin berhasil dihapus");
    }
  };

  const handleStart = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    if (!machine) return;

    if (machine.status === "in-use") {
      toast.error("Mesin sedang digunakan");
      return;
    }

    updateMachine(machineId, {
      status: "in-use",
      timer: {
        startTime: new Date().toISOString(),
        duration: 60, // default 60 minutes
        remaining: 60,
      },
    });
    toast.success("Mesin mulai beroperasi");
  };

  const handleComplete = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    if (!machine) return;

    updateMachine(machineId, {
      status: "completed",
      timer: undefined,
    });
    toast.success("Siklus mesin selesai");
  };

  const handleReset = (machineId: string) => {
    updateMachine(machineId, {
      status: "empty",
      timer: undefined,
      currentOrderId: undefined,
    });
    toast.success("Mesin direset");
  };

  const getStatusColor = (status: Machine["status"]) => {
    switch (status) {
      case "empty":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "in-use":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "maintenance":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: Machine["status"]) => {
    switch (status) {
      case "empty":
        return "Kosong";
      case "in-use":
        return "Digunakan";
      case "completed":
        return "Selesai";
      case "maintenance":
        return "Maintenance";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: Machine["type"]) => {
    switch (type) {
      case "washer":
        return "Mesin Cuci";
      case "dryer":
        return "Mesin Pengering";
      case "iron":
        return "Mesin Setrika";
      case "folder":
        return "Mesin Lipat";
      default:
        return type;
    }
  };

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}:${mins.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Mesin
        </Button>
      </div>

      {machines.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Belum ada mesin. Tambah mesin baru untuk memulai.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {machines.map((machine) => {
            const currentOrder = machine.currentOrderId
              ? orders.find((o) => o.id === machine.currentOrderId)
              : null;

            return (
              <Card key={machine.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{machine.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {getTypeLabel(machine.type)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(machine.status)}>
                      {getStatusLabel(machine.status)}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Serial:</span> {machine.serialNumber}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Kapasitas:</span> {machine.capacity} kg
                    </p>
                    {machine.iotEnabled && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        IoT Enabled
                      </Badge>
                    )}
                    {currentOrder && (
                      <p className="text-xs text-muted-foreground">
                        Order: #{currentOrder.id}
                      </p>
                    )}
                  </div>

                  {machine.timer && machine.status === "in-use" && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Timer</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatTime(machine.timer.remaining || 0)}
                      </p>
                      <p className="text-xs text-blue-600">
                        Sisa waktu
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {machine.status === "empty" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStart(machine.id)}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {machine.status === "in-use" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleComplete(machine.id)}
                        className="flex-1"
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Selesai
                      </Button>
                    )}
                    {machine.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReset(machine.id)}
                        className="flex-1"
                      >
                        Reset
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(machine)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(machine.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <MachineModal
          machine={editingMachine}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMachine(null);
          }}
        />
      )}
    </div>
  );
};

