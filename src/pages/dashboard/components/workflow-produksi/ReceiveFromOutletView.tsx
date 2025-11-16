/**
 * Supervisor Produksi - Receive from Outlet View
 * Receives bags from outlets, validates manifest, moves to central sorting
 */
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Order, SortingBag } from "../../types";
import { format } from "date-fns";
import { toast } from "sonner";
import { Package, QrCode, Radio, CheckCircle2, AlertCircle, Truck } from "lucide-react";

export const ReceiveFromOutletView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const sortingBags = useDashboardStore((state) => state.sortingBags);
  const updateOrder = useDashboardStore((state) => state.updateOrder);
  const updateSortingBag = useDashboardStore((state) => state.updateSortingBag);

  // Get bags in transit from outlets
  const incomingBags = useMemo(() => {
    return sortingBags.filter(bag => 
      bag.destination === 'central_main' && 
      bag.status === 'sent'
    );
  }, [sortingBags]);

  const handleScanManifest = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag) return;
    
    const bagOrders = orders.filter(o => bag.items.includes(o.id));
    toast.success(`Manifest validated: ${bagOrders.length} items`);
  };

  const handleScanRFID = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    toast.success(`RFID scanned: ${order.rfidTagId || 'N/A'}`);
  };

  const handleReceiveBag = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag) return;
    
    // Validate all items
    const bagOrders = orders.filter(o => bag.items.includes(o.id));
    const missingItems = bagOrders.filter(o => !o.rfidTagId);
    
    if (missingItems.length > 0) {
      toast.error(`${missingItems.length} items missing RFID tags!`);
      return;
    }
    
    // Update bag status
    updateSortingBag(bagId, {
      status: 'received',
    });
    
    // Update all orders - move to central sorting
    bag.items.forEach(orderId => {
      updateOrder(orderId, {
        currentStage: 'central-sorting',
        sortingMetadata: {
          status: 'received_at_central',
        },
      });
    });
    
    toast.success(`Bag ${bag.bagNumber} received and moved to Central Sorting`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Receive from Outlet</h2>
          <p className="text-muted-foreground">
            Validate manifest, scan RFID, move to central sorting
          </p>
        </div>
      </div>

      {incomingBags.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            Tidak ada bag yang sedang dalam perjalanan
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Bag akan muncul di sini setelah dikirim dari outlet
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {incomingBags.map((bag) => {
            const bagOrders = orders.filter(o => bag.items.includes(o.id));
            const totalWeight = bag.totalWeight || 0;
            const allTagged = bagOrders.every(o => o.rfidTagId);
            
            return (
              <Card key={bag.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{bag.bagNumber}</h3>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        In Transit
                      </Badge>
                    </div>
                    {bag.qrCode && (
                      <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-mono">{bag.qrCode}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Items:</span>
                      <p className="font-semibold">{bag.items.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <p className="font-semibold">{totalWeight.toFixed(1)} kg</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Express:</span>
                      <p className="font-semibold">{bag.expressCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">RFID Status:</span>
                      {allTagged ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          All Tagged
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          Missing Tags
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Items in Bag:</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {bagOrders.map((order) => (
                        <Card key={order.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-xs text-muted-foreground">
                                {order.services?.map(s => s.serviceName).join(", ") || order.serviceName}
                              </div>
                              {order.rfidTagId ? (
                                <div className="flex items-center gap-1 mt-1 text-xs">
                                  <Radio className="h-3 w-3 text-green-600" />
                                  <span className="font-mono">{order.rfidTagId}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>No RFID Tag</span>
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleScanRFID(order.id)}
                            >
                              <Radio className="h-4 w-4 mr-1" />
                              Scan
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleScanManifest(bag.id)}
                      className="flex-1"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Validate Manifest
                    </Button>
                    <Button
                      onClick={() => handleReceiveBag(bag.id)}
                      disabled={!allTagged}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Receive & Move to Sorting
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

