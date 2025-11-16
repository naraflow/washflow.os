import { useEffect, useState, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Order, Customer, OrderServiceItem, Machine } from "../../types";
import { toast } from "sonner";
import { Search, User, History, Info, Camera, Plus, X, Clock, Trash2 } from "lucide-react";

interface OrderModalProps {
  order?: Order | null;
  onClose: () => void;
}

type FormStep = 1 | 2;

export const OrderModal = ({ order, onClose }: OrderModalProps) => {
  const services = useDashboardStore((state) => state.services);
  const customers = useDashboardStore((state) => state.customers);
  const orders = useDashboardStore((state) => state.orders);
  const machines = useDashboardStore((state) => state.machines);
  const outlets = useDashboardStore((state) => state.outlets);
  const addOrder = useDashboardStore((state) => state.addOrder);
  const updateOrder = useDashboardStore((state) => state.updateOrder);
  const updateCustomerStats = useDashboardStore((state) => state.updateCustomerStats);
  const addCustomer = useDashboardStore((state) => state.addCustomer);
  const updateCustomer = useDashboardStore((state) => state.updateCustomer);

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    services: [] as Array<{
      serviceId: string;
      weight?: number;
      quantity?: number;
      express: boolean;
    }>,
    discount: 0,
    surcharge: 0,
    paymentMethod: "cash" as Order["paymentMethod"],
    notes: "",
  });

  const [initialPhotos, setInitialPhotos] = useState<string[]>([]);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Find customer by phone number
  const foundCustomer = useMemo(() => {
    if (!formData.customerPhone || formData.customerPhone.length < 3) return null;
    return customers.find((c) => c.phone === formData.customerPhone);
  }, [formData.customerPhone, customers]);

  // Get customer order history
  const customerOrderHistory = useMemo(() => {
    if (!foundCustomer) return [];
    return orders
      .filter((o) => o.customerPhone === foundCustomer.phone)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [foundCustomer, orders]);

  // Calculate membership discount
  const membershipDiscount = useMemo(() => {
    if (!foundCustomer?.preferences?.membershipTier) return 0;
    
    const tier = foundCustomer.preferences.membershipTier;
    const discountPercentages = {
      regular: 0,
      bronze: 5,
      silver: 10,
      gold: 15,
      platinum: 20,
    };
    
    return discountPercentages[tier] || 0;
  }, [foundCustomer]);

  // Calculate total from all services
  const calculatedTotal = useMemo(() => {
    let subtotal = 0;
    
    formData.services.forEach((serviceItem) => {
      const service = services.find((s) => s.id === serviceItem.serviceId);
      if (service) {
        let itemSubtotal = service.unitPrice * (serviceItem.weight || serviceItem.quantity || 1);
        if (serviceItem.express) {
          itemSubtotal = itemSubtotal * 1.5;
        }
        subtotal += itemSubtotal;
      }
    });

    // Apply membership discount
    const membershipDiscountAmount = (subtotal * membershipDiscount) / 100;
    const finalDiscount = (formData.discount || 0) + membershipDiscountAmount;
    
    const total = subtotal - finalDiscount + (formData.surcharge || 0);
    return Math.max(0, total);
  }, [formData, services, membershipDiscount]);

  // Calculate estimated completion time
  const estimatedCompletion = useMemo(() => {
    if (formData.services.length === 0) return null;

    // Get current outlet operating hours (default if not set)
    const currentOutlet = outlets[0];
    const operatingHours = currentOutlet?.operatingHours || {
      weekday_open: "08:00",
      weekday_close: "20:00",
    };

    // Base processing times (in minutes)
    const baseTimes: Record<string, number> = {
      regular: 120, // 2 hours
      wash_iron: 180, // 3 hours
      iron_only: 60, // 1 hour
      express: 60, // 1 hour (express)
      dry_clean: 240, // 4 hours
      custom: 120,
    };

    // Calculate total weight/quantity
    let totalWeight = 0;
    let hasExpress = false;
    let maxServiceTime = 0;

    formData.services.forEach((serviceItem) => {
      const service = services.find((s) => s.id === serviceItem.serviceId);
      if (service) {
        const weight = serviceItem.weight || serviceItem.quantity || 1;
        totalWeight += weight;
        if (serviceItem.express) hasExpress = true;
        
        const serviceTime = baseTimes[service.type] || 120;
        maxServiceTime = Math.max(maxServiceTime, serviceTime);
      }
    });

    // Adjust time based on weight and machine capacity
    const availableMachines = machines.filter(
      (m) => m.status === "empty" && m.type === "washer"
    );
    const totalCapacity = availableMachines.reduce((sum, m) => sum + m.capacity, 0);
    
    // If weight exceeds capacity, add extra time
    let processingTime = maxServiceTime;
    if (totalWeight > totalCapacity && totalCapacity > 0) {
      const batches = Math.ceil(totalWeight / totalCapacity);
      processingTime = maxServiceTime * batches;
    }

    // Express reduces time by 50%
    if (hasExpress) {
      processingTime = processingTime * 0.5;
    }

    // Add buffer time
    processingTime += 30; // 30 minutes buffer

    // Calculate completion time
    const now = new Date();
    const completionTime = new Date(now.getTime() + processingTime * 60000);

    // Check if completion time is within operating hours
    const completionHour = completionTime.getHours();
    const closeHour = parseInt(operatingHours.weekday_close?.split(":")[0] || "20");
    
    // If completion is after closing, move to next day opening
    if (completionHour >= closeHour) {
      const nextDay = new Date(completionTime);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(parseInt(operatingHours.weekday_open?.split(":")[0] || "8"), 0, 0, 0);
      return nextDay.toISOString();
    }

    return completionTime.toISOString();
  }, [formData.services, services, machines, outlets]);

  // Auto-fill customer data when phone number is entered
  useEffect(() => {
    if (foundCustomer && !order) {
      setIsSearchingCustomer(true);
      
      if (!formData.customerName || formData.customerName === "") {
        setFormData((prev) => ({
          ...prev,
          customerName: foundCustomer.name,
        }));
      }

      // Auto-fill preferred service if available
      if (foundCustomer.preferences?.preferredService && formData.services.length === 0) {
        const preferredService = services.find(
          (s) => s.id === foundCustomer.preferences?.preferredService
        );
        if (preferredService && preferredService.isActive) {
          setFormData((prev) => ({
            ...prev,
            services: [{
              serviceId: preferredService.id,
              weight: 1,
              express: false,
            }],
          }));
        }
      }

      // Auto-fill preferred payment method
      if (foundCustomer.preferences?.preferredPaymentMethod && !order) {
        setFormData((prev) => ({
          ...prev,
          paymentMethod: foundCustomer.preferences?.preferredPaymentMethod || "cash",
        }));
      }

      // Auto-fill customer notes if available
      if (foundCustomer.notes && !formData.notes) {
        setFormData((prev) => ({
          ...prev,
          notes: foundCustomer.notes || "",
        }));
      }

      setTimeout(() => setIsSearchingCustomer(false), 500);
    }
  }, [foundCustomer, order, services]);

  useEffect(() => {
    if (order) {
      // Convert old format to new format
      if (order.services && order.services.length > 0) {
        setFormData({
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          services: order.services.map((s) => ({
            serviceId: s.serviceId,
            weight: s.weight,
            quantity: s.quantity,
            express: order.express || false,
          })),
          discount: order.discount || 0,
          surcharge: order.surcharge || 0,
          paymentMethod: order.paymentMethod,
          notes: order.notes || "",
        });
        setInitialPhotos(order.initialConditionPhotos || []);
      } else {
        // Legacy format
        setFormData({
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          services: order.serviceId ? [{
            serviceId: order.serviceId,
            weight: order.weight || 1,
            express: order.express || false,
          }] : [],
          discount: order.discount || 0,
          surcharge: order.surcharge || 0,
          paymentMethod: order.paymentMethod,
          notes: order.notes || "",
        });
        setInitialPhotos(order.initialConditionPhotos || []);
      }
    }
  }, [order]);

  const handlePhoneChange = (phone: string) => {
    setFormData({ ...formData, customerPhone: phone });
  };

  const handleAddService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          serviceId: "",
          weight: 1,
          express: false,
        },
      ],
    }));
  };

  const handleRemoveService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setInitialPhotos((prev) => [...prev, base64String]);
        toast.success("Foto berhasil ditambahkan");
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setInitialPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.customerName || !formData.customerPhone || formData.services.length === 0) {
        toast.error("Mohon lengkapi semua field yang diperlukan");
        return;
      }
      
      // Validate all services
      for (const service of formData.services) {
        if (!service.serviceId) {
          toast.error("Mohon pilih layanan untuk semua item");
          return;
        }
        const svc = services.find((s) => s.id === service.serviceId);
        if (svc) {
          if (svc.unit === "kg" && !service.weight) {
            toast.error("Mohon isi berat untuk layanan yang menggunakan kg");
            return;
          }
          if (svc.unit !== "kg" && !service.quantity) {
            toast.error("Mohon isi jumlah untuk layanan yang menggunakan piece/item");
            return;
          }
        }
      }
      
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || formData.services.length === 0) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    // Build services array
    const orderServices: OrderServiceItem[] = formData.services.map((serviceItem) => {
      const service = services.find((s) => s.id === serviceItem.serviceId);
      if (!service) {
        throw new Error(`Service ${serviceItem.serviceId} not found`);
      }
      
      const weight = serviceItem.weight || serviceItem.quantity || 1;
      let subtotal = service.unitPrice * weight;
      if (serviceItem.express) {
        subtotal = subtotal * 1.5;
      }

      return {
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.type,
        weight: service.unit === "kg" ? weight : undefined,
        quantity: service.unit !== "kg" ? weight : undefined,
        unitPrice: service.unitPrice,
        subtotal,
      };
    });

    const totalSubtotal = orderServices.reduce((sum, s) => sum + s.subtotal, 0);
    const membershipDiscountAmount = (totalSubtotal * membershipDiscount) / 100;
    const finalDiscount = (formData.discount || 0) + membershipDiscountAmount;

    // Check if customer exists, if not create one
    let customer = customers.find((c) => c.phone === formData.customerPhone);
    if (!customer) {
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: formData.customerName,
        phone: formData.customerPhone,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        preferences: {
          preferredPaymentMethod: formData.paymentMethod,
        },
      };
      addCustomer(newCustomer);
      customer = newCustomer;
    } else {
      // Update customer preferences
      if (customer.preferences) {
        customer.preferences.preferredPaymentMethod = formData.paymentMethod;
        if (formData.services.length > 0) {
          customer.preferences.preferredService = formData.services[0].serviceId;
        }
      } else {
        customer.preferences = {
          preferredPaymentMethod: formData.paymentMethod,
          preferredService: formData.services[0]?.serviceId,
        };
      }
      updateCustomer(customer.id, customer);
    }

    // Generate unique order ID
    const generateOrderId = () => {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${hours}${minutes}${seconds}`;
      const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
      return `ORD-${dateStr}-${timeStr}-${randomStr}`;
    };

    const currentRole = useDashboardStore.getState().currentRole;
    const isNewOrder = !order;
    const orderId = order?.id || generateOrderId();
    
    // Get first service for backward compatibility (deprecated fields)
    const firstService = orderServices[0];
    const totalWeight = orderServices.reduce((sum, s) => sum + (s.weight || s.quantity || 0), 0);
    
    const orderData: Order = {
      id: orderId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      // Multi-service support (new)
      services: orderServices,
      // Backward compatibility fields (deprecated but needed for display)
      serviceId: firstService?.serviceId,
      serviceName: firstService?.serviceName || orderServices.map(s => s.serviceName).join(", "),
      serviceType: firstService?.serviceType,
      weight: totalWeight,
      unitPrice: firstService?.unitPrice || 0,
      quantity: orderServices.reduce((sum, s) => sum + (s.quantity || 0), 0),
      // Pricing
      subtotal: totalSubtotal,
      discount: formData.discount || 0,
      surcharge: formData.surcharge || 0,
      totalAmount: calculatedTotal,
      paymentMethod: formData.paymentMethod,
      status: order?.status || "pending",
      notes: formData.notes,
      express: formData.services.some((s) => s.express),
      createdAt: order?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStage: order?.currentStage || 'reception',
      completedStages: order?.completedStages || [],
      initialConditionPhotos: initialPhotos,
      membershipDiscount: membershipDiscountAmount,
      estimatedCompletionTime: estimatedCompletion || undefined,
      // Tagging workflow - Set when admin creates new order
      taggingRequired: isNewOrder ? true : order?.taggingRequired,
      taggingStatus: isNewOrder ? 'pending' : order?.taggingStatus,
      // Workflow log for new order
      workflowLogs: isNewOrder ? [{
        id: `log-${Date.now()}`,
        orderId: orderId,
        newStep: 'reception',
        changedAt: new Date().toISOString(),
        changedBy: currentRole === 'kasir' ? 'Admin' : 'System',
        notes: 'Order created',
      }] : order?.workflowLogs || [],
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

  const getMembershipBadge = (customer: Customer) => {
    const tier = customer.preferences?.membershipTier || 'regular';
    const colors = {
      regular: 'bg-gray-500',
      bronze: 'bg-amber-600',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-purple-500',
    };
    return (
      <Badge className={colors[tier] || colors.regular}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? "Edit Order" : "Order Baru"}</DialogTitle>
          <DialogDescription>
            {order ? "Perbarui informasi order" : "Buat order baru untuk pelanggan"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <span className="text-sm font-medium">Informasi Dasar</span>
          </div>
          <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <span className="text-sm font-medium">Opsi Lanjutan</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Nomor Telepon *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="pl-9"
                      required
                      autoFocus
                    />
                  </div>
                  {isSearchingCustomer && (
                    <p className="text-xs text-muted-foreground">Mencari data pelanggan...</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nama Pelanggan *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Customer Info Card */}
              {foundCustomer && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">Pelanggan Terdaftar</CardTitle>
                      </div>
                      {getMembershipBadge(foundCustomer)}
                      {membershipDiscount > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Diskon {membershipDiscount}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Order:</span>
                        <span className="ml-2 font-semibold">{foundCustomer.totalOrders}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Belanja:</span>
                        <span className="ml-2 font-semibold">
                          Rp {foundCustomer.totalSpent.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                    {foundCustomer.notes && (
                      <div className="flex items-start gap-2 text-sm">
                        <Info className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <span className="text-muted-foreground">Catatan:</span>
                          <p className="mt-1">{foundCustomer.notes}</p>
                        </div>
                      </div>
                    )}
                    {customerOrderHistory.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Riwayat Order</span>
                        </div>
                        <div className="space-y-1">
                          {customerOrderHistory.map((ord) => (
                            <div key={ord.id} className="text-xs flex justify-between">
                              <span>{ord.serviceName || (ord.services && ord.services.map(s => s.serviceName).join(", "))}</span>
                              <span className="text-muted-foreground">
                                {new Date(ord.createdAt).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Multi-Service Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Layanan *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddService}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Layanan
                  </Button>
                </div>

                {formData.services.map((serviceItem, index) => {
                  const service = services.find((s) => s.id === serviceItem.serviceId);
                  return (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Layanan {index + 1} *</Label>
                              <Select
                                value={serviceItem.serviceId}
                                onValueChange={(value) => handleServiceChange(index, "serviceId", value)}
                                required
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih Layanan" />
                                </SelectTrigger>
                                <SelectContent>
                                  {services
                                    .filter((s) => s.isActive)
                                    .map((svc) => (
                                      <SelectItem key={svc.id} value={svc.id}>
                                        {svc.name} - Rp {svc.unitPrice.toLocaleString("id-ID")}/{svc.unit}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>
                                {service?.unit === "kg" ? "Berat (kg) *" : "Jumlah *"}
                              </Label>
                              <Input
                                type="number"
                                step={service?.unit === "kg" ? "0.1" : "1"}
                                min="0.1"
                                value={service?.unit === "kg" ? serviceItem.weight || "" : serviceItem.quantity || ""}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  if (service?.unit === "kg") {
                                    handleServiceChange(index, "weight", value);
                                  } else {
                                    handleServiceChange(index, "quantity", value);
                                  }
                                }}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`express-${index}`}
                              checked={serviceItem.express}
                              onCheckedChange={(checked) => handleServiceChange(index, "express", checked)}
                            />
                            <Label htmlFor={`express-${index}`} className="cursor-pointer text-sm">
                              Express (50% lebih cepat, +50% harga)
                            </Label>
                          </div>
                        </div>
                        {formData.services.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveService(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}

                {formData.services.length === 0 && (
                  <Card className="p-8 border-dashed text-center">
                    <p className="text-muted-foreground">Belum ada layanan ditambahkan</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddService}
                      className="mt-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Layanan Pertama
                    </Button>
                  </Card>
                )}
              </div>

              {/* Foto Kondisi Awal */}
              <div className="space-y-2">
                <Label>Foto Kondisi Awal</Label>
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
                    size="sm"
                    onClick={() => cameraInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Ambil Foto
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Upload Foto
                  </Button>
                </div>
                {initialPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {initialPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Foto kondisi awal ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={handleNext}>
                  Lanjutkan ke Opsi Lanjutan →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Advanced Options */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Diskon Manual (Rp)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  />
                  {membershipDiscount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Diskon Membership: {membershipDiscount}% (otomatis)
                    </p>
                  )}
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

              {/* Estimasi Selesai */}
              {estimatedCompletion && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <Label className="text-blue-900 font-semibold">Estimasi Selesai:</Label>
                        <p className="text-blue-700">
                          {new Date(estimatedCompletion).toLocaleString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan..."
                  rows={3}
                />
              </div>

              <div className="p-4 bg-secondary rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="text-lg">
                    Rp {formData.services.reduce((sum, s) => {
                      const service = services.find((svc) => svc.id === s.serviceId);
                      if (service) {
                        const weight = s.weight || s.quantity || 1;
                        let subtotal = service.unitPrice * weight;
                        if (s.express) subtotal *= 1.5;
                        return sum + subtotal;
                      }
                      return sum;
                    }, 0).toLocaleString("id-ID")}
                  </span>
                </div>
                {membershipDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span>Diskon Membership ({membershipDiscount}%):</span>
                    <span>
                      -Rp {((formData.services.reduce((sum, s) => {
                        const service = services.find((svc) => svc.id === s.serviceId);
                        if (service) {
                          const weight = s.weight || s.quantity || 1;
                          let subtotal = service.unitPrice * weight;
                          if (s.express) subtotal *= 1.5;
                          return sum + subtotal;
                        }
                        return sum;
                      }, 0) * membershipDiscount) / 100).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                {formData.discount > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span>Diskon Manual:</span>
                    <span>-Rp {formData.discount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                {formData.surcharge > 0 && (
                  <div className="flex justify-between items-center text-sm text-red-600">
                    <span>Tambahan:</span>
                    <span>+Rp {formData.surcharge.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold text-lg">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    Rp {calculatedTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                  ← Kembali
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                  </Button>
                  <Button type="submit">
                    {order ? "Perbarui" : "Simpan"} Order
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
