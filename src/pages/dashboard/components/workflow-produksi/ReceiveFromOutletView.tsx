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
  // Bag dengan status 'in_transit' adalah bag yang sudah di-handover dari outlet
  const incomingBags = useMemo(() => {
    return sortingBags.filter(bag => 
      bag.destination === 'central_main' && 
      bag.status === 'in_transit'
    );
  }, [sortingBags]);

  const handleScanManifest = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag) return;
    
    // Validate manifest QR code
    if (!bag.qrCode) {
      toast.error("Bag tidak memiliki QR manifest");
      return;
    }
    
    const bagOrders = orders.filter(o => bag.items.includes(o.id));
    
    // Validate that all items in manifest have RFID tags
    const missingRFID = bagOrders.filter(o => !o.rfidTagId || o.taggingStatus !== 'tagged');
    if (missingRFID.length > 0) {
      toast.error(`${missingRFID.length} items missing RFID tags in manifest`);
      return;
    }
    
    // Validate item count matches
    if (bagOrders.length !== bag.items.length) {
      toast.error(`Item count mismatch: manifest shows ${bag.items.length} but found ${bagOrders.length}`);
      return;
    }
    
    // Mark manifest as validated
    updateSortingBag(bagId, {
      manifestValidated: true,
    });
    
    toast.success(`Manifest validated: ${bagOrders.length} items, ${(bag.totalWeight || 0).toFixed(1)}kg`);
  };

  const handleScanRFID = (orderId: string, bagId: string) => {
    const order = orders.find(o => o.id === orderId);
    const bag = sortingBags.find(b => b.id === bagId);
    
    if (!order || !bag) return;
    
    // Validate RFID exists
    if (!order.rfidTagId || order.taggingStatus !== 'tagged') {
      toast.error("Order tidak memiliki RFID tag yang valid");
      return;
    }
    
    // Validate RFID is in this bag
    if (!bag.items.includes(orderId)) {
      toast.error("RFID tidak sesuai dengan manifest bag ini");
      return;
    }
    
    toast.success(`RFID scanned: ${order.rfidTagId}`);
  };

  const handleReceiveBag = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag) return;
    
    // Validate all items
    const bagOrders = orders.filter(o => bag.items.includes(o.id));
    const missingItems = bagOrders.filter(o => !o.rfidTagId || o.taggingStatus !== 'tagged');
    
    if (missingItems.length > 0) {
      toast.error(`${missingItems.length} items missing RFID tags!`);
      return;
    }
    
    // Validate that orders are in correct stage
    const invalidOrders = bagOrders.filter(o => 
      o.currentStage !== 'in-transit-to-central' && 
      o.sortingMetadata?.status !== 'in_transit_central'
    );
    
    if (invalidOrders.length > 0) {
      toast.warning(`Some orders are not in transit status. Please verify.`);
    }
    
    // Update bag status to received
    updateSortingBag(bagId, {
      status: 'received',
      receivedAt: new Date().toISOString(),
    });
    
    // Update all orders - move to central sorting (received at central)
    // Orders akan muncul di Central Sorting setelah received
    bag.items.forEach(orderId => {
      updateOrder(orderId, {
        currentStage: 'sorting', // Move to sorting stage for central facility
        sortingMetadata: {
          status: 'received_central',
          bagId: bagId,
          sortedAt: new Date().toISOString(),
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
                      <h3 className="text-lg font-semibold">{bag.bagName || bag.bagNumber}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          In Transit to Central
                        </Badge>
                        {bag.priority && (
                          <Badge variant="outline" className={
                            bag.priority === 'express' ? 'bg-orange-50 text-orange-700' :
                            bag.priority === 'regular' ? 'bg-blue-50 text-blue-700' :
                            'bg-gray-50 text-gray-700'
                          }>
                            {bag.priority === 'express' ? 'EXPRESS' : bag.priority === 'regular' ? 'REGULAR' : 'MIXED'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {bag.qrCode && (
                      <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-mono">{bag.qrCode}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Courier Information */}
                  {bag.handoverChecklist && (
                    <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                      <div><strong>Courier:</strong> {bag.handoverChecklist.courierName || 'N/A'}</div>
                      {bag.handoverChecklist.handoverTime && (
                        <div><strong>Handover:</strong> {format(new Date(bag.handoverChecklist.handoverTime), 'dd MMM yyyy, HH:mm')}</div>
                      )}
                      {bag.inTransitAt && (
                        <div><strong>In Transit:</strong> {format(new Date(bag.inTransitAt), 'dd MMM yyyy, HH:mm')}</div>
                      )}
                    </div>
                  )}

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
                              onClick={() => handleScanRFID(order.id, bag.id)}
                            >
                              <Radio className="h-4 w-4 mr-1" />
                              Scan RFID
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
                      disabled={bag.manifestValidated}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      {bag.manifestValidated ? 'Manifest Validated' : 'Validate Manifest'}
                    </Button>
                    <Button
                      onClick={() => handleReceiveBag(bag.id)}
                      disabled={!allTagged || !bag.manifestValidated}
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

