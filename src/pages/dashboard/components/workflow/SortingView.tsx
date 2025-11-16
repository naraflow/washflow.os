import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowRight, 
  Tag, 
  AlertCircle, 
  Package, 
  Filter, 
  Plus, 
  Printer, 
  QrCode,
  Clock,
  CheckCircle2,
  X,
  Radio
} from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { format, addHours } from "date-fns";
import { toast } from "sonner";
import type { Order, SortingBag, SortingStatus } from "../../types";

// Calculate next pickup times (every 2 hours: 10:30, 12:30, 14:30, etc.)
const getNextPickupTimes = () => {
  const now = new Date();
  const times: Date[] = [];
  const startHour = 10;
  const startMinute = 30;
  
  for (let i = 0; i < 5; i++) {
    const time = new Date();
    time.setHours(startHour + i * 2, startMinute, 0, 0);
    if (time > now) {
      times.push(time);
    }
  }
  
  return times.slice(0, 3); // Return next 3 pickup times
};

// Sorting Header Component
const SortingHeader = ({ orders }: { orders: Order[] }) => {
  const stats = useMemo(() => {
    const totalItems = orders.length;
    const expressCount = orders.filter(o => o.express).length;
    const regularCount = totalItems - expressCount;
    const rfidMissing = orders.filter(o => !o.rfidTagId || o.taggingStatus !== 'tagged').length;
    
    return { totalItems, expressCount, regularCount, rfidMissing };
  }, [orders]);
  
  const nextPickups = getNextPickupTimes();
  
  return (
    <Card className="p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Total Items</Label>
          <p className="text-2xl font-bold">{stats.totalItems}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Express</Label>
          <p className="text-2xl font-bold text-orange-600">{stats.expressCount}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Regular</Label>
          <p className="text-2xl font-bold text-blue-600">{stats.regularCount}</p>
        </div>
        {stats.rfidMissing > 0 && (
          <div className="col-span-2 md:col-span-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-500" />
              RFID Missing
            </Label>
            <p className="text-2xl font-bold text-red-600">{stats.rfidMissing}</p>
          </div>
        )}
        <div className="col-span-2 md:col-span-1">
          <Label className="text-xs text-muted-foreground">Next Pickup</Label>
          <div className="space-y-1">
            {nextPickups.map((time, idx) => (
              <p key={idx} className="text-sm font-semibold">
                {format(time, "HH:mm")}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Sorting Queue Component
const SortingQueue = ({ 
  orders, 
  onAddToBag, 
  onScanRFID,
  filters 
}: { 
  orders: Order[];
  onAddToBag: (orderId: string) => void;
  onScanRFID: (orderId: string) => void;
  filters: {
    serviceType?: string;
    express?: string;
    timeRange?: string;
    weightRange?: string;
  };
}) => {
  const services = useDashboardStore((state) => state.services);
  
  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (filters.serviceType && filters.serviceType !== 'all') {
      filtered = filtered.filter(o => {
        const service = services.find(s => s.id === o.serviceId);
        return service?.type === filters.serviceType;
      });
    }
    
    if (filters.express && filters.express !== 'all') {
      filtered = filtered.filter(o => 
        filters.express === 'express' ? o.express : !o.express
      );
    }
    
    return filtered;
  }, [orders, filters, services]);
  
  return (
    <div className="space-y-4">
      {filteredOrders.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            No orders in sorting queue. Orders will appear here after RFID assignment.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => {
            const totalWeight = order.services?.reduce((sum, s) => sum + (s.weight || s.quantity || 0), 0) || order.weight || 0;
            const serviceNames = order.services?.map(s => s.serviceName).join(", ") || order.serviceName || "Layanan";
            const hasRFID = order.rfidTagId && order.taggingStatus === 'tagged';
            
            return (
              <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold">{order.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customerPhone}
                    </div>
                  </div>

                  <div>
                    <Badge variant="outline">{serviceNames}</Badge>
                    <div className="text-sm mt-1">
                      {totalWeight} kg • Rp {(order.totalAmount || 0).toLocaleString('id-ID')}
                    </div>
                  </div>

                  {order.express && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Express
                    </Badge>
                  )}

                  {hasRFID ? (
                    <div className="flex items-center gap-2 text-xs">
                      <Tag className="h-3 w-3 text-green-600" />
                      <span className="text-muted-foreground">RFID:</span>
                      <Badge variant="outline" className="font-mono text-xs bg-green-50">
                        {order.rfidTagId}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>RFID not paired</span>
                    </div>
                  )}

                  {order.initialConditionPhotos && order.initialConditionPhotos.length > 0 && (
                    <div className="flex gap-2">
                      {order.initialConditionPhotos.slice(0, 2).map((photo, idx) => (
                        <img 
                          key={idx}
                          src={photo} 
                          alt={`Condition ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <div>Order ID: <span className="font-mono">{order.id}</span></div>
                    <div>Created: {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</div>
                  </div>

                  <div className="flex gap-2">
                    {!hasRFID && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onScanRFID(order.id)}
                        className="flex-1"
                      >
                        <Radio className="h-4 w-4 mr-2" />
                        Scan RFID
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => onAddToBag(order.id)}
                      disabled={!hasRFID}
                      className="flex-1"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Add to Bag
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Bag Management Component
const BagManagement = ({ 
  bags, 
  orders,
  onCreateBag,
  onAddItemToBag,
  onFinalizeBag,
  onPrintManifest
}: { 
  bags: SortingBag[];
  orders: Order[];
  onCreateBag: () => void;
  onAddItemToBag: (bagId: string, orderId: string) => void;
  onFinalizeBag: (bagId: string) => void;
  onPrintManifest: (bagId: string) => void;
}) => {
  const activeBags = bags.filter(b => b.status !== 'sent');
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bag Management</h3>
        <Button onClick={onCreateBag} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create New Bag
        </Button>
      </div>

      {activeBags.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            No active bags. Create a new bag to start grouping items.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeBags.map((bag) => {
            const bagOrders = orders.filter(o => bag.items.includes(o.id));
            const isReady = bag.status === 'ready';
            
            return (
              <Card key={bag.id} className={`p-4 ${isReady ? 'border-green-500 bg-green-50/50' : ''}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{bag.bagNumber}</h4>
                      <Badge variant={bag.status === 'ready' ? 'default' : 'outline'}>
                        {bag.status === 'ready' ? 'Ready' : 'Filling'}
                      </Badge>
                    </div>
                    {bag.qrCode && (
                      <QrCode className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="text-sm space-y-1">
                    <div><strong>{bag.items.length}</strong> items</div>
                    <div><strong>{(bag.totalWeight || 0).toFixed(1)}</strong> kg</div>
                    <div className="flex gap-2">
                      {bag.expressCount > 0 && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {bag.expressCount} Express
                        </Badge>
                      )}
                      {bag.regularCount > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {bag.regularCount} Regular
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      Destination: {bag.destination === 'central_main' ? 'Central Main' : 'Sub Facility'}
                    </div>
                  </div>

                  {bagOrders.length > 0 && (
                    <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto">
                      <div className="font-semibold mb-1">Items:</div>
                      {bagOrders.map(order => (
                        <div key={order.id} className="truncate">
                          {order.customerName} - {order.services?.map(s => s.serviceName).join(", ") || order.serviceName}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {bag.status === 'filling' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onFinalizeBag(bag.id)}
                        className="flex-1"
                      >
                        Mark Ready
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrintManifest(bag.id)}
                      className="flex-1"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Filters Component
const SortingFilters = ({ 
  filters, 
  onFilterChange 
}: { 
  filters: {
    serviceType?: string;
    express?: string;
    timeRange?: string;
    weightRange?: string;
  };
  onFilterChange: (key: string, value: string) => void;
}) => {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>Service Type</Label>
          <Select value={filters.serviceType || 'all'} onValueChange={(v) => onFilterChange('serviceType', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="wash_iron">Cuci + Setrika</SelectItem>
              <SelectItem value="iron_only">Setrika Saja</SelectItem>
              <SelectItem value="express">Express</SelectItem>
              <SelectItem value="dry_clean">Dry Clean</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Priority</Label>
          <Select value={filters.express || 'all'} onValueChange={(v) => onFilterChange('express', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="express">Express Only</SelectItem>
              <SelectItem value="regular">Regular Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Time Range</Label>
          <Select value={filters.timeRange || 'all'} onValueChange={(v) => onFilterChange('timeRange', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="1h">Last 1 Hour</SelectItem>
              <SelectItem value="2h">Last 2 Hours</SelectItem>
              <SelectItem value="today">Today</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Weight Range</Label>
          <Select value={filters.weightRange || 'all'} onValueChange={(v) => onFilterChange('weightRange', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weights</SelectItem>
              <SelectItem value="0-2">0-2 kg</SelectItem>
              <SelectItem value="2-5">2-5 kg</SelectItem>
              <SelectItem value="5+">5+ kg</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

// Main SortingView Component
export const SortingView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const sortingBags = useDashboardStore((state) => state.sortingBags);
  const updateOrder = useDashboardStore((state) => state.updateOrder);
  const addSortingBag = useDashboardStore((state) => state.addSortingBag);
  const updateSortingBag = useDashboardStore((state) => state.updateSortingBag);
  const currentRole = useDashboardStore((state) => state.currentRole);

  const [filters, setFilters] = useState({
    serviceType: 'all',
    express: 'all',
    timeRange: 'all',
    weightRange: 'all',
  });

  // Get orders in sorting stage
  const sortingOrders = useMemo(() => {
    return orders.filter((order) => {
      const currentStage = order.currentStage || 'reception';
      return currentStage === 'sorting';
    });
  }, [orders]);

  // Generate next bag number
  const getNextBagNumber = () => {
    const lastBag = sortingBags.sort((a, b) => 
      parseInt(b.bagNumber.replace('#', '')) - parseInt(a.bagNumber.replace('#', ''))
    )[0];
    const nextNum = lastBag 
      ? parseInt(lastBag.bagNumber.replace('#', '')) + 1 
      : 1;
    return `#${String(nextNum).padStart(3, '0')}`;
  };

  const handleCreateBag = () => {
    const bagNumber = getNextBagNumber();
    const newBag: SortingBag = {
      id: `bag-${Date.now()}`,
      bagNumber,
      status: 'filling',
      items: [],
      totalWeight: 0,
      expressCount: 0,
      regularCount: 0,
      destination: 'central_main',
      createdAt: new Date().toISOString(),
    };
    addSortingBag(newBag);
    toast.success(`Bag ${bagNumber} created`);
  };

  const handleAddToBag = (orderId: string) => {
    // Find first available bag or create new one
    let bag = sortingBags.find(b => b.status === 'filling');
    if (!bag) {
      handleCreateBag();
      bag = sortingBags.find(b => b.status === 'filling');
    }
    
    if (!bag) return;
    
    const order = sortingOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // Check if order already in a bag
    if (bag.items.includes(orderId)) {
      toast.error("Order already in a bag");
      return;
    }
    
    const totalWeight = order.services?.reduce((sum, s) => sum + (s.weight || s.quantity || 0), 0) || order.weight || 0;
    
    updateSortingBag(bag.id, {
      items: [...bag.items, orderId],
      totalWeight: bag.totalWeight + totalWeight,
      expressCount: order.express ? bag.expressCount + 1 : bag.expressCount,
      regularCount: order.express ? bag.regularCount : bag.regularCount + 1,
    });
    
    // Update order sorting metadata
    updateOrder(orderId, {
      sortingMetadata: {
        status: 'in_bag',
        bagId: bag.id,
        sortedAt: new Date().toISOString(),
      },
    });
    
    toast.success(`Order added to ${bag.bagNumber}`);
  };

  const handleFinalizeBag = (bagId: string) => {
    updateSortingBag(bagId, {
      status: 'ready',
      readyAt: new Date().toISOString(),
      qrCode: `QR-${bagId}-${Date.now()}`,
    });
    
    // Update all orders in bag
    const bag = sortingBags.find(b => b.id === bagId);
    if (bag) {
      bag.items.forEach(orderId => {
        updateOrder(orderId, {
          sortingMetadata: {
            status: 'ready_for_pickup',
            bagId: bagId,
          },
        });
      });
    }
    
    toast.success("Bag marked as ready for pickup");
  };

  const handlePrintManifest = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag) return;
    
    // In real implementation, this would open print dialog
    toast.success(`Printing manifest for ${bag.bagNumber}`);
    console.log("Print manifest:", bag);
  };

  const handleScanRFID = (orderId: string) => {
    // Open RFID scanning modal (simulated)
    toast.info("RFID scanning feature - to be implemented with hardware");
  };

  return (
    <div className="space-y-4">
      <SortingHeader orders={sortingOrders} />
      
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Sorting Queue</TabsTrigger>
          <TabsTrigger value="bags">Bag Management</TabsTrigger>
          <TabsTrigger value="filters">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <SortingQueue
            orders={sortingOrders}
            onAddToBag={handleAddToBag}
            onScanRFID={handleScanRFID}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="bags" className="space-y-4">
          <BagManagement
            bags={sortingBags}
            orders={sortingOrders}
            onCreateBag={handleCreateBag}
            onAddItemToBag={handleAddToBag}
            onFinalizeBag={handleFinalizeBag}
            onPrintManifest={handlePrintManifest}
          />
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <SortingFilters
            filters={filters}
            onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
