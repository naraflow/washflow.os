/**
 * Supervisor Outlet - Send to Central View
 * Handles courier pickup, RFID scanning, manifest validation, handover checklist
 */
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Order, SortingBag } from "../../types";
import { format } from "date-fns";
import { toast } from "sonner";
import { Truck, QrCode, Radio, CheckCircle2, Clock, AlertCircle, Printer, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

export const SendToCentralView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const sortingBags = useDashboardStore((state) => state.sortingBags);
  const updateOrder = useDashboardStore((state) => state.updateOrder);
  const updateSortingBag = useDashboardStore((state) => state.updateSortingBag);

  const [handoverDialog, setHandoverDialog] = useState<string | null>(null);
  const [courierName, setCourierName] = useState('');
  const [itemsScanned, setItemsScanned] = useState(false);
  const [scannedItems, setScannedItems] = useState<Set<string>>(new Set());

  // Get bags ready for pickup
  const readyBags = useMemo(() => {
    return sortingBags.filter(bag => 
      bag.destination === 'central_main' && 
      (bag.status === 'ready' || bag.status === 'in_transit')
    );
  }, [sortingBags]);

  const handleScanRFID = (orderId: string, bagId: string) => {
    const order = orders.find(o => o.id === orderId);
    const bag = sortingBags.find(b => b.id === bagId);
    
    if (!order || !bag) return;
    
    // Check if RFID matches
    if (!order.rfidTagId) {
      toast.error("Order tidak memiliki RFID tag");
      return;
    }

    // Add to scanned items
    const newScannedItems = new Set(scannedItems);
    newScannedItems.add(orderId);
    setScannedItems(newScannedItems);

    // Check if all items in bag are scanned
    const bagOrders = orders.filter(o => bag.items.includes(o.id));
    if (newScannedItems.size === bagOrders.length) {
      setItemsScanned(true);
      toast.success("Semua item dalam bag telah di-scan");
    } else {
      toast.success(`RFID scanned: ${order.rfidTagId}`);
    }
  };


  const handleOpenHandover = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag) return;

    // Reset state
    setCourierName('');
    setItemsScanned(false);
    setScannedItems(new Set());
    
    // Check if items are already scanned
    const bagOrders = orders.filter(o => bag.items.includes(o.id));
    const allScanned = bagOrders.every(o => scannedItems.has(o.id));
    setItemsScanned(allScanned);
    
    setHandoverDialog(bagId);
  };

  const handleHandover = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag) return;

    // Validation
    if (!courierName.trim()) {
      toast.error("Masukkan nama kurir");
      return;
    }

    if (!itemsScanned) {
      toast.error("Scan semua item RFID terlebih dahulu");
      return;
    }

    // Update bag status to in transit
    updateSortingBag(bagId, {
      status: 'in_transit',
      inTransitAt: new Date().toISOString(),
      handoverChecklist: {
        itemsScanned: true,
        manifestScanned: false, // No longer required
        courierName: courierName.trim(),
        handoverTime: new Date().toISOString(),
      },
    });
    
    // Update all orders in bag
    bag.items.forEach(orderId => {
      updateOrder(orderId, {
        currentStage: 'in-transit-to-central',
        sortingMetadata: {
          status: 'in_transit_central',
        },
      });
    });
    
    toast.success(`Bag ${bag.bagNumber} handed over to courier: ${courierName}`);
    
    // Reset and close dialog
    setHandoverDialog(null);
    setCourierName('');
    setItemsScanned(false);
    setScannedItems(new Set());
  };

  const handlePrintBagLabel = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag) return;
    
    toast.success(`Printing bag label for ${bag.bagNumber}`);
    console.log("Print bag label:", bag);
    // TODO: Implement actual label printing
  };

  const handlePrintManifest = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag) return;
    
    const bagOrders = orders.filter(o => bag.items.includes(o.id));
    const outlets = useDashboardStore.getState().outlets;
    const outlet = bag.outletId ? outlets.find(o => o.id === bag.outletId) : null;
    
    const getTotalOrderWeight = (order: Order) => {
      return order.services?.reduce((sum, s) => sum + (s.weight || s.quantity || 0), 0) || order.weight || 0;
    };
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const itemsHtml = bagOrders.map((order, index) => {
        const totalWeight = getTotalOrderWeight(order);
        const serviceNames = order.services?.map(s => s.serviceName).join(", ") || order.serviceName || "Layanan";
        return `
          <tr>
            <td style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">${index + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.customerName}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.customerPhone || 'N/A'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${serviceNames}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace; font-size: 11px;">${order.rfidTagId || 'N/A'}</td>
            <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">${totalWeight.toFixed(1)} kg</td>
            <td style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">
              ${order.express ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px;">EXPRESS</span>' : '<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 10px;">REGULAR</span>'}
            </td>
          </tr>
        `;
      }).join('');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Manifest - ${bag.bagName || bag.bagNumber}</title>
            <style>
              @media print {
                @page { margin: 10mm; size: A4; }
                body { margin: 0; }
              }
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                font-size: 12px;
                color: #000;
              }
              .header { 
                text-align: center; 
                margin-bottom: 20px; 
                border-bottom: 2px solid #000;
                padding-bottom: 15px;
              }
              .header h1 { margin: 0; font-size: 24px; }
              .header h2 { margin: 5px 0; font-size: 18px; color: #666; }
              .info { 
                margin-bottom: 15px; 
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
              }
              .info-item { margin-bottom: 8px; }
              .info-label { font-weight: bold; color: #555; }
              .info-value { margin-top: 2px; }
              .line { border-top: 1px dashed #000; margin: 15px 0; }
              table { 
                width: 100%; 
                margin: 15px 0; 
                border-collapse: collapse;
                font-size: 11px;
              }
              th { 
                background-color: #f3f4f6; 
                padding: 10px 8px; 
                text-align: left; 
                border-bottom: 2px solid #000;
                font-weight: bold;
              }
              td { padding: 8px; }
              .summary { 
                margin-top: 20px; 
                padding: 15px;
                background-color: #f9fafb;
                border: 1px solid #ddd;
              }
              .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
              }
              .summary-label { font-weight: bold; }
              .qr-code {
                text-align: center;
                margin: 20px 0;
                padding: 15px;
                border: 2px dashed #000;
              }
              .qr-code-label {
                font-weight: bold;
                margin-bottom: 5px;
              }
              .handover-info {
                margin-top: 15px;
                padding: 10px;
                background-color: #eff6ff;
                border-left: 4px solid #3b82f6;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 10px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>WASHFLOW OS</h1>
              <h2>BAG MANIFEST - SEND TO CENTRAL</h2>
            </div>
            
            <div class="info">
              <div>
                <div class="info-item">
                  <div class="info-label">Bag Number:</div>
                  <div class="info-value">${bag.bagName || bag.bagNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Destination:</div>
                  <div class="info-value">Central Facility</div>
                </div>
                ${outlet ? `
                <div class="info-item">
                  <div class="info-label">Outlet:</div>
                  <div class="info-value">${outlet.name}</div>
                </div>
                ` : ''}
                <div class="info-item">
                  <div class="info-label">Priority:</div>
                  <div class="info-value">
                    ${bag.priority === 'express' ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px;">EXPRESS</span>' : 
                      bag.priority === 'regular' ? '<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px;">REGULAR</span>' : 
                      '<span style="background: #e5e7eb; color: #374151; padding: 2px 6px; border-radius: 4px;">MIXED</span>'}
                  </div>
                </div>
              </div>
              <div>
                <div class="info-item">
                  <div class="info-label">Created At:</div>
                  <div class="info-value">${format(new Date(bag.createdAt), "dd/MM/yyyy HH:mm")}</div>
                </div>
                ${bag.readyAt ? `
                <div class="info-item">
                  <div class="info-label">Ready At:</div>
                  <div class="info-value">${format(new Date(bag.readyAt), "dd/MM/yyyy HH:mm")}</div>
                </div>
                ` : ''}
                ${bag.inTransitAt ? `
                <div class="info-item">
                  <div class="info-label">In Transit At:</div>
                  <div class="info-value">${format(new Date(bag.inTransitAt), "dd/MM/yyyy HH:mm")}</div>
                </div>
                ` : ''}
                <div class="info-item">
                  <div class="info-label">Status:</div>
                  <div class="info-value">
                    ${bag.status === 'ready' ? '<span style="background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px;">Ready for Pickup</span>' : 
                      bag.status === 'in_transit' ? '<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px;">In Transit</span>' : 
                      '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px;">Filling</span>'}
                  </div>
                </div>
              </div>
            </div>
            
            ${bag.handoverChecklist ? `
            <div class="handover-info">
              <strong>Handover Information:</strong><br>
              Courier: ${bag.handoverChecklist.courierName || 'N/A'}<br>
              Handover Time: ${bag.handoverChecklist.handoverTime ? format(new Date(bag.handoverChecklist.handoverTime), "dd/MM/yyyy HH:mm") : 'N/A'}
            </div>
            ` : ''}
            
            ${bag.qrCode ? `
            <div class="qr-code">
              <div class="qr-code-label">QR Manifest Code:</div>
              <div style="font-family: monospace; font-size: 14px; font-weight: bold; margin-top: 5px;">${bag.qrCode}</div>
            </div>
            ` : ''}
            
            <div class="line"></div>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 40px;">No</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Service</th>
                  <th>RFID Tag</th>
                  <th style="width: 80px; text-align: right;">Weight</th>
                  <th style="width: 80px; text-align: center;">Priority</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="summary">
              <div class="summary-row">
                <span class="summary-label">Total Items:</span>
                <span>${bag.items.length} items</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total Weight:</span>
                <span>${(bag.totalWeight || 0).toFixed(1)} kg / ${bag.maxCapacity || 7} kg max</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Express Items:</span>
                <span>${bag.expressCount} items</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Regular Items:</span>
                <span>${bag.regularCount} items</span>
              </div>
            </div>
            
            <div class="footer">
              <p>This manifest is generated automatically by WashFlow OS</p>
              <p>Printed on: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print();
      }, 250);
      
      toast.success(`Printing manifest for ${bag.bagNumber}`);
    } else {
      toast.error("Unable to open print window. Please check popup blocker.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Send to Central</h2>
          <p className="text-muted-foreground">
            Courier pickup, RFID validation, handover to courier
          </p>
        </div>
      </div>

      {readyBags.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            Tidak ada bag yang siap untuk dikirim
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Bag akan muncul di sini setelah di-finalize di Outlet Sorting
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {readyBags.map((bag) => {
            const bagOrders = orders.filter(o => bag.items.includes(o.id));
            const totalWeight = bag.totalWeight || 0;
            const allItemsScanned = bagOrders.every(o => scannedItems.has(o.id));
            const isInTransit = bag.status === 'in_transit';
            
            return (
              <Card key={bag.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{bag.bagName || bag.bagNumber}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={isInTransit ? "default" : "outline"} className={
                          isInTransit ? "bg-blue-600" : "bg-blue-50 text-blue-700"
                        }>
                          {isInTransit ? 'In Transit to Central' : 'Ready for Pickup'}
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
                      <span className="text-muted-foreground">Regular:</span>
                      <p className="font-semibold">{bag.regularCount}</p>
                    </div>
                  </div>

                  {bag.readyAt && (
                    <div className="text-xs text-muted-foreground">
                      Ready at: {format(new Date(bag.readyAt), 'dd MMM yyyy, HH:mm')}
                    </div>
                  )}

                  {/* Items List with RFID Scan */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Items in Bag ({bagOrders.length})</h4>
                      {allItemsScanned && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          All Scanned
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {bagOrders.map((order) => {
                        const isScanned = scannedItems.has(order.id);
                        
                        return (
                          <Card key={order.id} className={`p-3 ${isScanned ? 'bg-green-50 border-green-200' : ''}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{order.customerName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {order.services?.map(s => s.serviceName).join(", ") || order.serviceName}
                                </div>
                                {order.rfidTagId && (
                                  <div className="flex items-center gap-1 mt-1 text-xs">
                                    <Radio className={`h-3 w-3 ${isScanned ? 'text-green-600' : 'text-gray-400'}`} />
                                    <span className="font-mono">{order.rfidTagId}</span>
                                    {isScanned && (
                                      <CheckCircle2 className="h-3 w-3 text-green-600 ml-1" />
                                    )}
                                  </div>
                                )}
                              </div>
                              {!isInTransit && (
                                <Button
                                  size="sm"
                                  variant={isScanned ? "outline" : "default"}
                                  onClick={() => handleScanRFID(order.id, bag.id)}
                                  disabled={isScanned}
                                >
                                  <Radio className="h-4 w-4 mr-1" />
                                  {isScanned ? 'Scanned' : 'Scan RFID'}
                                </Button>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {!isInTransit && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handlePrintBagLabel(bag.id)}
                          className="flex-1"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Bag Label
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePrintManifest(bag.id)}
                          className="flex-1"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Print Manifest
                        </Button>
                        <Button
                          onClick={() => handleOpenHandover(bag.id)}
                          className="flex-1"
                          disabled={!allItemsScanned}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Handover to Courier
                        </Button>
                      </>
                    )}
                    {isInTransit && bag.handoverChecklist && (
                      <div className="flex-1 space-y-2">
                        <div className="text-sm">
                          <strong>Courier:</strong> {bag.handoverChecklist.courierName}
                        </div>
                        {bag.handoverChecklist.handoverTime && (
                          <div className="text-xs text-muted-foreground">
                            Handover: {format(new Date(bag.handoverChecklist.handoverTime), 'dd MMM yyyy, HH:mm')}
                          </div>
                        )}
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          In Transit to Central
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Handover Dialog */}
      <Dialog open={handoverDialog !== null} onOpenChange={(open) => !open && setHandoverDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Handover to Courier</DialogTitle>
            <DialogDescription>
              Lengkapi checklist sebelum menyerahkan bag ke kurir
            </DialogDescription>
          </DialogHeader>
          {handoverDialog && (() => {
            const bag = sortingBags.find(b => b.id === handoverDialog);
            const bagOrders = orders.filter(o => bag?.items.includes(o.id));
            const allScanned = bagOrders.every(o => scannedItems.has(o.id));
            
            return (
              <div className="space-y-4">
                <div>
                  <Label>Courier Name</Label>
                  <Input
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="Nama kurir"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="items-scanned"
                      checked={allScanned}
                      disabled
                    />
                    <Label htmlFor="items-scanned" className="flex-1 cursor-pointer">
                      All items RFID scanned ({bagOrders.filter(o => scannedItems.has(o.id)).length}/{bagOrders.length})
                    </Label>
                  </div>
                  
                </div>

                {bag && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Bag: {bag.bagName || bag.bagNumber} ({bag.items.length} items, {bag.totalWeight?.toFixed(1)}kg)
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHandoverDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => handoverDialog && handleHandover(handoverDialog)}
              disabled={!courierName.trim() || !itemsScanned}
            >
              <Truck className="h-4 w-4 mr-2" />
              Confirm Handover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
