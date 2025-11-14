import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { useDashboardStore } from "../../store/useDashboardStore";
import type {
  Outlet,
  OutletFormState,
  OutletIoTSettings,
  OutletMachine,
  OutletStaffMember,
} from "../../types";

const ownerOptions = [
  { id: "owner-1", name: "Budi Santoso" },
  { id: "owner-2", name: "Siti Rahayu" },
  { id: "owner-3", name: "Ahmad Wijaya" },
];

const provinces = ["Jawa Timur", "Jawa Tengah", "Jawa Barat", "DKI Jakarta"];
const cities = ["Malang", "Surabaya", "Jakarta", "Bandung"];
const districts = ["Lowokwaru", "Klojen", "Blimbing"];
const serviceOptions = [
  { id: "laundry", label: "Laundry Regular" },
  { id: "dry-clean", label: "Dry Clean" },
  { id: "iron", label: "Setrika" },
  { id: "express", label: "Express" },
];
const outletTypes: Outlet["type"][] = ["regular", "premium", "express", "self-service"];
const statusOptions: Outlet["status"][] = ["active", "inactive", "maintenance"];
const employeeRoles = [
  { id: "kasir", label: "Kasir" },
  { id: "operator", label: "Operator" },
  { id: "kurir", label: "Kurir" },
  { id: "supervisor", label: "Supervisor" },
];
const machineTypes = [
  { id: "washer", label: "Washer" },
  { id: "dryer", label: "Dryer" },
  { id: "iron", label: "Mesin Setrika" },
  { id: "folder", label: "Mesin Fold" },
];

const draftStorageKey = "washflow_outlet_draft";
type NestedFieldKeys = "address" | "pricing" | "operatingHours" | "manager" | "iotSettings";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `outlet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const createEmptyEmployee = (): OutletStaffMember => ({
  id: createId(),
  name: "",
  role: "",
});

const createEmptyMachine = (): OutletMachine => ({
  id: createId(),
  type: "",
  serialNumber: "",
  capacity: undefined,
  iotEnabled: false,
});

const defaultIoTSettings: OutletIoTSettings = {
  auto_start: true,
  remote_control: false,
  usage_tracking: false,
  maintenance_alert: false,
};

const createInitialFormState = (): OutletFormState => ({
  name: "",
  code: "",
  type: "regular",
  ownerId: "",
  activationDate: "",
  status: "active",
  description: "",
  address: {
    fullAddress: "",
    province: "",
    city: "",
    district: "",
    postalCode: "",
    phone: "",
    whatsapp: "",
    coordinates: "",
  },
  servicesOffered: [],
  pricing: {},
  operatingHours: {},
  manager: {
    name: "",
    phone: "",
    email: "",
  },
  employees: [createEmptyEmployee()],
  machines: [createEmptyMachine()],
  iotSettings: { ...defaultIoTSettings },
});

const validateOutlet = (data: OutletFormState) => {
  if (!data.name || !data.code || !data.ownerId || !data.activationDate) {
    return "Nama outlet, kode, pemilik, dan tanggal aktivasi wajib diisi.";
  }
  if (!data.address.fullAddress || !data.address.province || !data.address.city || !data.address.district) {
    return "Alamat lengkap beserta provinsi, kota, dan kecamatan wajib diisi.";
  }
  if (!data.address.phone || !data.address.whatsapp) {
    return "Nomor telepon dan WhatsApp wajib diisi.";
  }
  if (data.servicesOffered.length === 0) {
    return "Pilih minimal satu layanan yang tersedia di outlet.";
  }
  return null;
};

export const OutletForm = () => {
  const addOutlet = useDashboardStore((state) => state.addOutlet);
  const outlets = useDashboardStore((state) => state.outlets);
  const [activeTab, setActiveTab] = useState("basic");
  const [formState, setFormState] = useState<OutletFormState>(() => createInitialFormState());
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const totalEmployees = formState.employees.filter((employee) => employee.name.trim()).length;
  const totalMachines = formState.machines.filter((machine) => machine.serialNumber.trim()).length;

  const updateFormState = <K extends keyof OutletFormState>(key: K, value: OutletFormState[K]) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedField = <K extends NestedFieldKeys, P extends keyof OutletFormState[K]>(
    key: K,
    nestedKey: P,
    value: OutletFormState[K][P],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [nestedKey]: value,
      },
    }));
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      servicesOffered: checked
        ? [...prev.servicesOffered, serviceId]
        : prev.servicesOffered.filter((service) => service !== serviceId),
    }));
  };

  const handleAddEmployee = () => {
    setFormState((prev) => ({
      ...prev,
      employees: [...prev.employees, createEmptyEmployee()],
    }));
  };

  const handleRemoveEmployee = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      employees: prev.employees.filter((employee) => employee.id !== id),
    }));
  };

  const handleEmployeeChange = (id: string, field: keyof OutletStaffMember, value: string) => {
    setFormState((prev) => ({
      ...prev,
      employees: prev.employees.map((employee) =>
        employee.id === id ? { ...employee, [field]: value } : employee,
      ),
    }));
  };

  const handleAddMachine = () => {
    setFormState((prev) => ({
      ...prev,
      machines: [...prev.machines, createEmptyMachine()],
    }));
  };

  const handleRemoveMachine = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      machines: prev.machines.filter((machine) => machine.id !== id),
    }));
  };

  const handleMachineChange = (id: string, field: keyof OutletMachine, value: string | number | boolean) => {
    setFormState((prev) => ({
      ...prev,
      machines: prev.machines.map((machine) =>
        machine.id === id ? { ...machine, [field]: value } : machine,
      ),
    }));
  };

  const handleIoTSettingToggle = (key: keyof OutletIoTSettings, checked: boolean) => {
    updateNestedField("iotSettings", key, checked);
  };

  const resetForm = () => {
    setFormState(createInitialFormState());
    setActiveTab("basic");
    setLastSavedAt(null);
  };

  const saveDraft = useCallback(
    (showToast = false) => {
      if (typeof window === "undefined") return;
      try {
        const payload = {
          data: formState,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(draftStorageKey, JSON.stringify(payload));
        setLastSavedAt(payload.savedAt);
        if (showToast) {
          toast.success("Draft outlet tersimpan");
        }
      } catch (error) {
        console.error("Failed to save draft", error);
        if (showToast) {
          toast.error("Gagal menyimpan draft");
        }
      } finally {
        setIsSavingDraft(false);
      }
    },
    [formState],
  );

  const clearDraft = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(draftStorageKey);
  };

  const loadDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(draftStorageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { data: OutletFormState; savedAt?: string };
      setFormState({
        ...createInitialFormState(),
        ...parsed.data,
        employees:
          parsed.data.employees && parsed.data.employees.length > 0
            ? parsed.data.employees
            : [createEmptyEmployee()],
        machines:
          parsed.data.machines && parsed.data.machines.length > 0
            ? parsed.data.machines
            : [createEmptyMachine()],
      });
      if (parsed.savedAt) {
        setLastSavedAt(parsed.savedAt);
      }
      toast.success("Draft outlet berhasil dimuat");
    } catch (error) {
      console.error("Failed to load draft", error);
      toast.error("Draft rusak, tidak dapat dimuat");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(draftStorageKey);
    if (stored) {
      setTimeout(() => {
        if (window.confirm("Draft outlet belum selesai ditemukan. Muat draft tersebut?")) {
          loadDraft();
        } else {
          localStorage.removeItem(draftStorageKey);
        }
      }, 600);
    }
  }, [loadDraft]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = window.setInterval(() => {
      saveDraft();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [saveDraft]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setIsSavingDraft(true);
        saveDraft(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveDraft]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = validateOutlet(formState);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    const now = new Date().toISOString();
    const newOutlet: Outlet = {
      id: createId(),
      ...formState,
      servicesOffered: [...formState.servicesOffered],
      employees: formState.employees.filter((employee) => employee.name.trim() && employee.role),
      machines: formState.machines.filter(
        (machine) => machine.serialNumber.trim() && machine.type,
      ),
      createdAt: now,
      lastUpdated: now,
    };

    addOutlet(newOutlet);
    clearDraft();
    resetForm();
    toast.success("Outlet baru berhasil ditambahkan");
  };

  const handleSaveDraftClick = () => {
    setIsSavingDraft(true);
    saveDraft(true);
  };

  const handleCancel = () => {
    if (window.confirm("Batalkan perubahan? Data yang belum disimpan akan hilang.")) {
      resetForm();
      clearDraft();
    }
  };

  const getOwnerName = useCallback(
    (ownerId: string) => ownerOptions.find((owner) => owner.id === ownerId)?.name || "-",
    [],
  );

  const formattedLastSaved = useMemo(() => {
    if (!lastSavedAt) return null;
    try {
      return format(new Date(lastSavedAt), "dd MMM yyyy HH:mm");
    } catch {
      return null;
    }
  }, [lastSavedAt]);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Tambah Outlet Baru</h2>
              <p className="text-muted-foreground">
                Kelola onboarding outlet secara menyeluruh sebelum aktif ke sistem.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {formattedLastSaved ? `Draft tersimpan: ${formattedLastSaved}` : "Belum ada draft tersimpan"}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-2">
                <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
                <TabsTrigger value="location">Lokasi & Kontak</TabsTrigger>
                <TabsTrigger value="services">Layanan & Harga</TabsTrigger>
                <TabsTrigger value="staff">Staff & Kasir</TabsTrigger>
                <TabsTrigger value="machines">Mesin & IoT</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="outlet-name">Nama Outlet *</Label>
                    <Input
                      id="outlet-name"
                      value={formState.name}
                      onChange={(event) => updateFormState("name", event.target.value)}
                      placeholder="Contoh: SmartLink Laundry Soekarno Hatta"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outlet-code">Kode Outlet *</Label>
                    <Input
                      id="outlet-code"
                      value={formState.code}
                      onChange={(event) => updateFormState("code", event.target.value.toUpperCase())}
                      placeholder="SL-001"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Gunakan format unik, ex: SL-001.</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Tipe Outlet *</Label>
                    <Select
                      value={formState.type}
                      onValueChange={(value: Outlet["type"]) => updateFormState("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe outlet" />
                      </SelectTrigger>
                      <SelectContent>
                        {outletTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "self-service" ? "Self Service" : type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pemilik Outlet *</Label>
                    <Select value={formState.ownerId} onValueChange={(value) => updateFormState("ownerId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pemilik" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownerOptions.map((owner) => (
                          <SelectItem key={owner.id} value={owner.id}>
                            {owner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activation-date">Tanggal Aktivasi *</Label>
                    <Input
                      id="activation-date"
                      type="date"
                      value={formState.activationDate}
                      onChange={(event) => updateFormState("activationDate", event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select value={formState.status} onValueChange={(value: Outlet["status"]) => updateFormState("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status === "active" ? "Aktif" : status === "inactive" ? "Nonaktif" : "Maintenance"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outlet-description">Deskripsi</Label>
                    <Textarea
                      id="outlet-description"
                      value={formState.description}
                      onChange={(event) => updateFormState("description", event.target.value)}
                      rows={3}
                      placeholder="Catatan tambahan mengenai outlet..."
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full-address">Alamat Lengkap *</Label>
                  <Textarea
                    id="full-address"
                    value={formState.address.fullAddress}
                    onChange={(event) => updateNestedField("address", "fullAddress", event.target.value)}
                    rows={3}
                    placeholder="Jl. Soekarno Hatta No. 123, Malang"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Provinsi *</Label>
                    <Select
                      value={formState.address.province}
                      onValueChange={(value) => updateNestedField("address", "province", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih provinsi" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province.toLowerCase().replace(/\s+/g, "-")}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kota/Kabupaten *</Label>
                    <Select
                      value={formState.address.city}
                      onValueChange={(value) => updateNestedField("address", "city", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kota" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city.toLowerCase()}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Kecamatan *</Label>
                    <Select
                      value={formState.address.district}
                      onValueChange={(value) => updateNestedField("address", "district", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kecamatan" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district.toLowerCase()}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal-code">Kode Pos</Label>
                    <Input
                      id="postal-code"
                      value={formState.address.postalCode}
                      onChange={(event) => updateNestedField("address", "postalCode", event.target.value)}
                      placeholder="65141"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coordinates">Koordinat (opsional)</Label>
                    <Input
                      id="coordinates"
                      value={formState.address.coordinates}
                      onChange={(event) => updateNestedField("address", "coordinates", event.target.value)}
                      placeholder="-7.2575, 112.7521"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon *</Label>
                    <Input
                      id="phone"
                      value={formState.address.phone}
                      onChange={(event) => updateNestedField("address", "phone", event.target.value)}
                      placeholder="081234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      value={formState.address.whatsapp}
                      onChange={(event) => updateNestedField("address", "whatsapp", event.target.value)}
                      placeholder="081234567890"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Jenis Layanan</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Pilih layanan yang tersedia di outlet ini.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {serviceOptions.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={formState.servicesOffered.includes(service.id)}
                          onCheckedChange={(checked) => handleServiceToggle(service.id, Boolean(checked))}
                        />
                        <span className="font-medium">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Harga Layanan</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Cuci + Setrika (per kg)</Label>
                      <Input
                        type="number"
                        value={formState.pricing.price_regular ?? ""}
                        onChange={(event) =>
                          updateNestedField("pricing", "price_regular", event.target.value ? Number(event.target.value) : undefined)
                        }
                        placeholder="8000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dry Clean (per item)</Label>
                      <Input
                        type="number"
                        value={formState.pricing.price_dryclean ?? ""}
                        onChange={(event) =>
                          updateNestedField("pricing", "price_dryclean", event.target.value ? Number(event.target.value) : undefined)
                        }
                        placeholder="15000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Setrika Saja (per kg)</Label>
                      <Input
                        type="number"
                        value={formState.pricing.price_iron ?? ""}
                        onChange={(event) =>
                          updateNestedField("pricing", "price_iron", event.target.value ? Number(event.target.value) : undefined)
                        }
                        placeholder="5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Express (per kg)</Label>
                      <Input
                        type="number"
                        value={formState.pricing.price_express ?? ""}
                        onChange={(event) =>
                          updateNestedField("pricing", "price_express", event.target.value ? Number(event.target.value) : undefined)
                        }
                        placeholder="12000"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Jam Operasional</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Senin - Jumat</Label>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <Input
                          type="time"
                          value={formState.operatingHours.weekday_open ?? ""}
                          onChange={(event) => updateNestedField("operatingHours", "weekday_open", event.target.value)}
                        />
                        <span className="text-center text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={formState.operatingHours.weekday_close ?? ""}
                          onChange={(event) => updateNestedField("operatingHours", "weekday_close", event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Sabtu - Minggu</Label>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <Input
                          type="time"
                          value={formState.operatingHours.weekend_open ?? ""}
                          onChange={(event) => updateNestedField("operatingHours", "weekend_open", event.target.value)}
                        />
                        <span className="text-center text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={formState.operatingHours.weekend_close ?? ""}
                          onChange={(event) => updateNestedField("operatingHours", "weekend_close", event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="staff" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Outlet Manager</Label>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input
                        placeholder="Nama Manager"
                        value={formState.manager.name}
                        onChange={(event) => updateNestedField("manager", "name", event.target.value)}
                      />
                      <Input
                        placeholder="Nomor HP"
                        value={formState.manager.phone}
                        onChange={(event) => updateNestedField("manager", "phone", event.target.value)}
                      />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={formState.manager.email}
                        onChange={(event) => updateNestedField("manager", "email", event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Tim Operasional</h3>
                        <p className="text-sm text-muted-foreground">Kelola kasir, operator, kurir, dan staff lainnya.</p>
                      </div>
                      <Button type="button" variant="outline" onClick={handleAddEmployee}>
                        Tambah Karyawan
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {formState.employees.map((employee) => (
                        <div key={employee.id} className="grid gap-3 md:grid-cols-[2fr_1fr_auto] items-center rounded-lg border p-4">
                          <Input
                            placeholder="Nama Karyawan"
                            value={employee.name}
                            onChange={(event) => handleEmployeeChange(employee.id, "name", event.target.value)}
                          />
                          <Select
                            value={employee.role}
                            onValueChange={(value) => handleEmployeeChange(employee.id, "role", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jabatan" />
                            </SelectTrigger>
                            <SelectContent>
                              {employeeRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEmployee(employee.id)}
                            disabled={formState.employees.length === 1}
                          >
                            Hapus
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="machines" className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Mesin Laundry</h3>
                      <p className="text-sm text-muted-foreground">Catat mesin yang tersedia di outlet beserta serial number.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={handleAddMachine}>
                      Tambah Mesin
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formState.machines.map((machine) => (
                      <div key={machine.id} className="space-y-3 rounded-lg border p-4">
                        <div className="grid gap-3 md:grid-cols-3">
                          <Select
                            value={machine.type}
                            onValueChange={(value) => handleMachineChange(machine.id, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tipe Mesin" />
                            </SelectTrigger>
                            <SelectContent>
                              {machineTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Serial Number"
                            value={machine.serialNumber}
                            onChange={(event) => handleMachineChange(machine.id, "serialNumber", event.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Kapasitas (kg)"
                            value={machine.capacity ?? ""}
                            onChange={(event) =>
                              handleMachineChange(
                                machine.id,
                                "capacity",
                                event.target.value ? Number(event.target.value) : undefined,
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={machine.iotEnabled}
                              onCheckedChange={(checked) => handleMachineChange(machine.id, "iotEnabled", Boolean(checked))}
                            />
                            <span>IoT Enabled</span>
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMachine(machine.id)}
                            disabled={formState.machines.length === 1}
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pengaturan IoT</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(formState.iotSettings).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3 rounded-lg border p-3">
                        <Checkbox checked={value} onCheckedChange={(checked) => handleIoTSettingToggle(key as keyof OutletIoTSettings, Boolean(checked))} />
                        <span className="capitalize">
                          {key.replace("_", " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex flex-col gap-3 md:flex-row md:justify-end">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Batal
              </Button>
              <Button type="button" variant="outline" onClick={handleSaveDraftClick} disabled={isSavingDraft}>
                {isSavingDraft ? "Menyimpan..." : "Simpan Draft"}
              </Button>
              <Button type="submit">Tambah Outlet</Button>
            </div>
          </form>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">Outlet Terdaftar</h3>
          <p className="text-muted-foreground">
            Pantau outlet yang sudah onboarding ke washflow.os untuk memastikan kesiapan operasional.
          </p>
        </div>
        {outlets.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            Belum ada outlet yang tersimpan. Gunakan formulir di atas untuk menambahkan outlet baru.
          </div>
        ) : (
          <div className="grid gap-4">
            {outlets.map((outlet) => {
              const staffCount = outlet.employees.length;
              const machineCount = outlet.machines.length;
              const statusLabel =
                outlet.status === "active" ? "Aktif" : outlet.status === "inactive" ? "Nonaktif" : "Maintenance";
              return (
                <div
                  key={outlet.id}
                  className="rounded-lg border p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold">{outlet.name}</h4>
                      <Badge variant="outline">{outlet.code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{outlet.address.fullAddress}</p>
                    <div className="text-sm text-muted-foreground mt-1">
                      Owner: {getOwnerName(outlet.ownerId)} • Aktivasi:{" "}
                      {format(new Date(outlet.activationDate), "dd MMM yyyy")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Kontak: {outlet.address.phone} • WhatsApp: {outlet.address.whatsapp}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {outlet.type.replace("-", " ")}
                    </Badge>
                    <Badge
                      variant={outlet.status === "active" ? "default" : "outline"}
                      className={
                        outlet.status === "maintenance"
                          ? "border-yellow-500 text-yellow-700"
                          : outlet.status === "inactive"
                          ? "border-muted-foreground text-muted-foreground"
                          : undefined
                      }
                    >
                      {statusLabel}
                    </Badge>
                    <Badge variant="outline">{staffCount} Staff</Badge>
                    <Badge variant="outline">{machineCount} Mesin</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

