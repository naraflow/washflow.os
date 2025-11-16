/**
 * Supervisor Outlet - Outlet Sorting View
 * Separates express vs regular, groups by service type, creates bags for central dispatch
 * Enhanced with RFID scanning, validation, and improved workflow
 */
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { Order, SortingBag } from "../../types";
import { format } from "date-fns";
import { toast } from "sonner";
import { Package, Plus, Printer, QrCode, AlertCircle, Filter, ArrowRight, Tag, Radio, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Helper to get total weight from an order
const getTotalOrderWeight = (order: Order) => {
  return order.services?.reduce((sum, s) => sum + (s.weight || s.quantity || 0), 0) || order.weight || 0;
};

export const OutletSortingView = () => {
  const orders = useDashboardStore((state) => state.orders);
  const sortingBags = useDashboardStore((state) => state.sortingBags);
  const outlets = useDashboardStore((state) => state.outlets);
  const updateOrder = useDashboardStore((state) => state.updateOrder);
  const addSortingBag = useDashboardStore((state) => state.addSortingBag);
  const updateSortingBag = useDashboardStore((state) => state.updateSortingBag);
  const deleteSortingBag = useDashboardStore((state) => state.deleteSortingBag);
  const currentRole = useDashboardStore((state) => state.currentRole);

  const [filters, setFilters] = useState({
    serviceType: 'all',
    express: 'all',
    outletId: 'all',
  });

  const [rfidScanDialog, setRfidScanDialog] = useState(false);
  const [scannedRfid, setScannedRfid] = useState('');
  const [selectedBagForRfid, setSelectedBagForRfid] = useState<string | null>(null);
  const [bagCreateDialog, setBagCreateDialog] = useState(false);
  const [newBagPriority, setNewBagPriority] = useState<'express' | 'regular' | 'mixed'>('mixed');

  // Get orders in outlet sorting stage (after tagging, before sending to central)
  const outletSortingOrders = useMemo(() => {
    return orders.filter((order) => {
      // Orders that are tagged and ready for outlet sorting
      // Exclude orders that are already in finalized bags
      const isTagged = order.taggingStatus === 'tagged';
      const isInSorting = order.currentStage === 'sorting' || order.currentStage === 'reception';
      const isNotInFinalizedBag = !order.sortingMetadata?.bagId || 
        !sortingBags.find(b => b.id === order.sortingMetadata?.bagId && b.status === 'ready');
      
      return isTagged && isInSorting && isNotInFinalizedBag;
    });
  }, [orders, sortingBags]);

  // Generate next bag number and name
  const getNextBagNumber = () => {
    const outletBags = sortingBags.filter(b => b.destination === 'central_main');
    const lastBag = outletBags.sort((a, b) =>
      parseInt(b.bagNumber.replace('#', '')) - parseInt(a.bagNumber.replace('#', ''))
    )[0];
    const nextNum = lastBag
      ? parseInt(lastBag.bagNumber.replace('#', '')) + 1
      : 1;
    return `#${String(nextNum).padStart(3, '0')}`;
  };

  const generateBagName = (bagNumber: string, outletId?: string) => {
    const outletCode = outletId ? outlets.find(o => o.id === outletId)?.code || 'A' : 'A';
    return `BAG-OUTLET-${outletCode}-${bagNumber.replace('#', '')}`;
  };

  const handleCreateBag = () => {
    setBagCreateDialog(true);
  };

  const handleConfirmCreateBag = () => {
    const bagNumber = getNextBagNumber();
    const currentOutletId = filters.outletId !== 'all' ? filters.outletId : undefined;
    const bagName = generateBagName(bagNumber, currentOutletId);
    
    const newBag: SortingBag = {
      id: `bag-outlet-${Date.now()}`,
      bagNumber,
      bagName,
      status: 'filling',
      priority: newBagPriority,
      items: [],
      totalWeight: 0,
      expressCount: 0,
      regularCount: 0,
      maxCapacity: 7, // 7kg per bag as per specification
      destination: 'central_main',
      outletId: currentOutletId,
      createdAt: new Date().toISOString(),
    };
    addSortingBag(newBag);
    toast.success(`Bag ${bagName} created`);
    setBagCreateDialog(false);
    setNewBagPriority('mixed');
  };

  const handleAddToBag = (orderId: string, bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    const order = outletSortingOrders.find(o => o.id === orderId);
    
    if (!bag || !order) return;
    
    if (bag.items.includes(orderId)) {
      toast.error("Order already in this bag");
      return;
    }
    
    // Validation: Express/Regular mix warning
    if (bag.priority === 'express' && !order.express) {
      toast.warning(
        "⚠️ Peringatan: Bag ini untuk Express, tetapi Anda menambahkan item Regular. " +
        "Bag akan diubah menjadi Mixed priority.",
        { duration: 5000 }
      );
      // Update bag priority to mixed
      updateSortingBag(bag.id, { priority: 'mixed' });
    } else if (bag.priority === 'regular' && order.express) {
      toast.warning(
        "⚠️ Peringatan: Bag ini untuk Regular, tetapi Anda menambahkan item Express. " +
        "Bag akan diubah menjadi Mixed priority.",
        { duration: 5000 }
      );
      // Update bag priority to mixed
      updateSortingBag(bag.id, { priority: 'mixed' });
    }
    
    const totalWeight = getTotalOrderWeight(order);
    const maxCapacity = bag.maxCapacity || 7;
    
    // Check bag capacity (max 7kg per bag as per specification)
    if ((bag.totalWeight || 0) + totalWeight > maxCapacity) {
      toast.error(`Bag sudah penuh (max ${maxCapacity}kg). Buat bag baru atau pilih bag lain.`);
      return;
    }
    
    // Validation: RFID must be tagged
    if (!order.rfidTagId || order.taggingStatus !== 'tagged') {
      toast.error("RFID belum terdaftar. Tidak bisa menambah ke bag.");
      return;
    }
    
    // Check for duplicate RFID in bag
    const bagOrders = orders.filter(o => bag.items.includes(o.id));
    const duplicateRfid = bagOrders.find(o => o.rfidTagId === order.rfidTagId);
    if (duplicateRfid) {
      toast.error("RFID duplication detected. Item sudah ada di bag ini.");
      return;
    }
    
    updateSortingBag(bag.id, {
      items: [...bag.items, orderId],
      totalWeight: (bag.totalWeight || 0) + totalWeight,
      expressCount: order.express ? bag.expressCount + 1 : bag.expressCount,
      regularCount: order.express ? bag.regularCount : bag.regularCount + 1,
      priority: bag.priority === 'mixed' ? 'mixed' : (order.express ? 'express' : 'regular'),
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

  const handleScanRFID = () => {
    if (!scannedRfid.trim()) {
      toast.error("Masukkan RFID UID");
      return;
    }

    if (!selectedBagForRfid) {
      toast.error("Pilih bag terlebih dahulu");
      return;
    }

    // Normalize RFID format (remove spaces, convert to uppercase, handle dashes)
    const normalizedScannedRfid = scannedRfid.trim().toUpperCase().replace(/\s+/g, '');
    
    // Find order by RFID - try exact match first, then normalized match
    let order = outletSortingOrders.find(o => {
      if (!o.rfidTagId) return false;
      const normalizedOrderRfid = o.rfidTagId.toUpperCase().replace(/\s+/g, '');
      return normalizedOrderRfid === normalizedScannedRfid || 
             o.rfidTagId.trim().toUpperCase() === normalizedScannedRfid;
    });
    
    // If not found in outlet sorting orders, check all orders (for debugging)
    if (!order) {
      const allOrders = orders.filter(o => {
        if (!o.rfidTagId) return false;
        const normalizedOrderRfid = o.rfidTagId.toUpperCase().replace(/\s+/g, '');
        return normalizedOrderRfid === normalizedScannedRfid || 
               o.rfidTagId.trim().toUpperCase() === normalizedScannedRfid;
      });
      
      if (allOrders.length > 0) {
        const foundOrder = allOrders[0];
        // Check if order is tagged but not in sorting stage
        if (foundOrder.taggingStatus === 'tagged' && foundOrder.currentStage !== 'sorting') {
          toast.error("Order sudah di-tag tapi belum masuk ke tahap sorting. Pastikan order sudah siap untuk sorting.");
          return;
        } else if (foundOrder.taggingStatus !== 'tagged') {
          toast.error("Order belum di-tag RFID. Tag order terlebih dahulu.");
          return;
        } else {
          toast.error("Order tidak ditemukan di daftar sorting. Pastikan order sudah siap untuk sorting.");
          return;
        }
      }
      
      toast.error(`RFID "${scannedRfid.trim()}" tidak ditemukan atau order belum siap untuk sorting`);
      return;
    }

    // Add to bag using same validation logic
    handleAddToBag(order.id, selectedBagForRfid);
    
    // Reset scan dialog
    setScannedRfid('');
    setRfidScanDialog(false);
    setSelectedBagForRfid(null);
  };

  // Remove item from bag
  const handleRemoveFromBag = (orderId: string, bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    const order = orders.find(o => o.id === orderId);
    
    if (!bag || !order) return;

    // Business rule: Cannot remove items from ready or in_transit bags
    if (bag.status === 'ready' || bag.status === 'in_transit') {
      toast.error(`Tidak dapat menghapus item dari bag yang sudah ${bag.status === 'ready' ? 'ready' : 'in transit'}.`);
      return;
    }

    const confirmed = window.confirm(
      `Hapus order ${order.customerName} dari bag ${bag.bagNumber}?`
    );
    if (!confirmed) return;

    const totalWeight = getTotalOrderWeight(order);
    const newItems = bag.items.filter(id => id !== orderId);
    
    // Update bag - remove item and recalculate weight/counts
    updateSortingBag(bag.id, {
      items: newItems,
      totalWeight: Math.max(0, (bag.totalWeight || 0) - totalWeight),
      expressCount: order.express ? Math.max(0, bag.expressCount - 1) : bag.expressCount,
      regularCount: order.express ? bag.regularCount : Math.max(0, bag.regularCount - 1),
      // Update priority if bag becomes empty or single type
      priority: newItems.length === 0 ? 'mixed' : 
                (bag.expressCount === 1 && order.express) ? 'regular' :
                (bag.regularCount === 1 && !order.express) ? 'express' :
                bag.priority,
    });

    // Update order - remove from bag
    updateOrder(orderId, {
      sortingMetadata: {
        status: 'pending_sorting',
        bagId: undefined,
        sortedAt: undefined,
      },
    });

    toast.success(`Order dihapus dari ${bag.bagNumber}. Kapasitas bag: ${((bag.totalWeight || 0) - totalWeight).toFixed(1)}kg`);
  };

  // Delete bag with business rule checks
  const handleDeleteBag = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag) return;

    // Business rule: Cannot delete ready or in_transit bags
    if (bag.status === 'ready' || bag.status === 'in_transit') {
      toast.error(
        `Tidak dapat menghapus bag yang sudah ${bag.status === 'ready' ? 'ready untuk pickup' : 'in transit'}. ` +
        `Bag harus dikembalikan ke status 'filling' terlebih dahulu.`
      );
      return;
    }

    // Business rule: Cannot delete bags with items (must remove items first)
    if (bag.items.length > 0) {
      const confirmed = window.confirm(
        `Bag ${bag.bagNumber} masih berisi ${bag.items.length} item. ` +
        `Hapus bag akan mengembalikan semua item ke sorting queue. Lanjutkan?`
      );
      if (!confirmed) return;

      // Return all items to sorting queue
      bag.items.forEach(orderId => {
        updateOrder(orderId, {
          sortingMetadata: {
            status: 'pending_sorting',
            bagId: undefined,
            sortedAt: undefined,
          },
        });
      });
    }

    deleteSortingBag(bagId);
    toast.success(`Bag ${bag.bagNumber} berhasil dihapus`);
  };

  // Cancel order with admin approval
  const handleCancelOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Business rule: Cannot cancel orders that are in production or completed
    if (order.currentStage && ['washing', 'drying', 'ironing', 'packing', 'ready', 'completed'].includes(order.currentStage)) {
      toast.error(
        `Tidak dapat membatalkan order yang sudah dalam tahap produksi. ` +
        `Order saat ini di tahap: ${order.currentStage}`
      );
      return;
    }

    // Business rule: Cannot cancel orders that are in transit
    if (order.currentStage === 'in-transit-to-central' || order.sortingMetadata?.status === 'in_transit_central') {
      toast.error("Tidak dapat membatalkan order yang sedang dalam perjalanan ke central.");
      return;
    }

    // Check if admin approval is required (for orders with items in bags or ready status)
    const requiresAdminApproval = order.sortingMetadata?.status === 'ready_for_central_pickup' || 
                                  order.sortingMetadata?.bagId !== undefined;

    if (requiresAdminApproval) {
      const adminPassword = window.prompt(
        `Order ini memerlukan persetujuan admin untuk dibatalkan.\n\n` +
        `Order: ${order.customerName} - ${order.id}\n` +
        `Status: ${order.sortingMetadata?.status || order.status}\n\n` +
        `Masukkan password admin untuk melanjutkan:`
      );

      // Simple admin password check (in production, this should be proper authentication)
      if (adminPassword !== 'admin123') {
        toast.error("Password admin salah. Pembatalan order dibatalkan.");
        return;
      }
    }

    const confirmed = window.confirm(
      `Batalkan order ${order.id} untuk ${order.customerName}?\n\n` +
      `Status saat ini: ${order.status}\n` +
      `Tahap: ${order.currentStage || 'reception'}\n\n` +
      `Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    // Update order status to cancelled
    updateOrder(orderId, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
      // Remove from bag if in bag
      sortingMetadata: order.sortingMetadata?.bagId ? {
        ...order.sortingMetadata,
        status: 'cancelled',
      } : order.sortingMetadata,
      // Add workflow log
      workflowLogs: [
        ...(order.workflowLogs || []),
        {
          id: `log-${Date.now()}`,
          orderId: orderId,
          oldStep: order.currentStage || 'reception',
          newStep: 'cancelled',
          changedAt: new Date().toISOString(),
          changedBy: currentRole === 'supervisor-outlet' ? 'Supervisor Outlet' : 
                     currentRole === 'kasir' ? 'Kasir' : 'System',
          notes: `Order dibatalkan${requiresAdminApproval ? ' (dengan persetujuan admin)' : ''}`,
        },
      ],
    });

    // If order was in a bag, remove it and update bag
    if (order.sortingMetadata?.bagId) {
      const bag = sortingBags.find(b => b.id === order.sortingMetadata?.bagId);
      if (bag) {
        const totalWeight = getTotalOrderWeight(order);
        updateSortingBag(bag.id, {
          items: bag.items.filter(id => id !== orderId),
          totalWeight: Math.max(0, (bag.totalWeight || 0) - totalWeight),
          expressCount: order.express ? Math.max(0, bag.expressCount - 1) : bag.expressCount,
          regularCount: order.express ? bag.regularCount : Math.max(0, bag.regularCount - 1),
        });
      }
    }

    toast.success(`Order ${order.id} berhasil dibatalkan${requiresAdminApproval ? ' (dengan persetujuan admin)' : ''}`);
  };

  const handleFinalizeBag = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag || bag.items.length === 0) {
      toast.error("Bag kosong, tidak bisa di-finalize");
      return;
    }

    const maxCapacity = bag.maxCapacity || 7;
    const isOverweight = (bag.totalWeight || 0) > maxCapacity;
    
    // Warn if overweight but allow finalizing with confirmation
    if (isOverweight) {
      const confirmed = window.confirm(
        `⚠️ PERINGATAN: Bag ${bag.bagNumber} melebihi kapasitas maksimal!\n\n` +
        `Berat saat ini: ${bag.totalWeight?.toFixed(1)}kg\n` +
        `Kapasitas maksimal: ${maxCapacity}kg\n\n` +
        `Apakah Anda yakin ingin melanjutkan finalisasi?`
      );
      if (!confirmed) {
        return;
      }
    }

    updateSortingBag(bagId, {
      status: 'ready',
      readyAt: new Date().toISOString(),
      qrCode: `QR-${bag.bagName || bag.bagNumber}-${Date.now()}`,
    });
    
    // Update all orders in bag
    bag.items.forEach(orderId => {
      updateOrder(orderId, {
        sortingMetadata: {
          status: 'ready_for_central_pickup',
          bagId: bagId,
        },
        currentStage: 'outlet-sorting-complete',
      });
    });
    
    const message = isOverweight 
      ? `Bag ${bag.bagNumber} marked as ready (OVERWEIGHT: ${bag.totalWeight?.toFixed(1)}kg / ${maxCapacity}kg)`
      : `Bag ${bag.bagNumber} marked as ready for pickup to central`;
    toast.success(message);
  };

  const handlePrintManifest = (bagId: string) => {
    const bag = sortingBags.find(b => b.id === bagId);
    if (!bag) return;
    
    const bagOrders = orders.filter(o => bag.items.includes(o.id));
    const outlet = bag.outletId ? outlets.find(o => o.id === bag.outletId) : null;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const itemsHtml = bagOrders.map((order, index) => {
        const totalWeight = getTotalOrderWeight(order);
        const serviceNames = order.services?.map(s => s.serviceName).join(", ") || order.serviceName || "Layanan";
        return `
          <tr>
            <td style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">${index + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.customerName}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.customerPhone}</td>
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
              <h2>BAG MANIFEST</h2>
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

  const filteredOrders = useMemo(() => {
    return outletSortingOrders.filter(order => {
      if (filters.serviceType !== 'all' && !order.services?.some(s => s.serviceType === filters.serviceType)) {
        return false;
      }
      if (filters.express === 'express' && !order.express) return false;
      if (filters.express === 'regular' && order.express) return false;
      if (filters.outletId !== 'all' && order.outletId !== filters.outletId) return false;
      return true;
    });
  }, [outletSortingOrders, filters]);

  const activeBags = sortingBags.filter(b => 
    b.destination === 'central_main' && b.status !== 'sent' && b.status !== 'in_transit'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Outlet Sorting</h2>
          <p className="text-muted-foreground">
            Pisahkan express/regular, grouping ke bag untuk dikirim ke central
          </p>
        </div>
        <Button onClick={handleCreateBag} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create New Bag
        </Button>
      </div>

      {/* Stats Header */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <Label className="text-xs text-muted-foreground mb-1">Total Items</Label>
            <p className="text-2xl font-bold">{filteredOrders.length}</p>
          </div>
          <div className="flex flex-col">
            <Label className="text-xs text-muted-foreground mb-1">Express</Label>
            <p className="text-2xl font-bold text-orange-700">{filteredOrders.filter(o => o.express).length}</p>
          </div>
          <div className="flex flex-col">
            <Label className="text-xs text-muted-foreground mb-1">Regular</Label>
            <p className="text-2xl font-bold text-blue-700">{filteredOrders.filter(o => !o.express).length}</p>
          </div>
          <div className="flex flex-col">
            <Label className="text-xs text-muted-foreground mb-1">Active Bags</Label>
            <p className="text-2xl font-bold">{activeBags.length}</p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Service Type</Label>
            <Select value={filters.serviceType} onValueChange={(v) => setFilters(prev => ({ ...prev, serviceType: v }))}>
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
            <Select value={filters.express} onValueChange={(v) => setFilters(prev => ({ ...prev, express: v }))}>
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
          {outlets.length > 0 && (
            <div>
              <Label>Outlet</Label>
              <Select value={filters.outletId} onValueChange={(v) => setFilters(prev => ({ ...prev, outletId: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outlets</SelectItem>
                  {outlets.map(outlet => (
                    <SelectItem key={outlet.id} value={outlet.id}>{outlet.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Sorting Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sorting Queue ({filteredOrders.length} orders)</CardTitle>
              <Button
                size="sm"
                variant="outline"
                type="button"
                data-testid="open-rfid-scan-button"
                onClick={() => {
                  if (activeBags.length === 0) {
                    toast.error("Buat bag terlebih dahulu");
                    return;
                  }
                  // Auto-select the first active bag if not already selected
                  if (!selectedBagForRfid || !activeBags.find(b => b.id === selectedBagForRfid)) {
                    setSelectedBagForRfid(activeBags[0].id);
                  }
                  setRfidScanDialog(true);
                }}
                className="gap-2"
              >
                <Radio className="h-4 w-4" />
                Scan RFID
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No orders in sorting queue
              </p>
            ) : (
              filteredOrders.map((order) => {
                const totalWeight = getTotalOrderWeight(order);
                const serviceNames = order.services?.map(s => s.serviceName).join(", ") || order.serviceName || "Layanan";
                const hasRFID = order.rfidTagId && order.taggingStatus === 'tagged';
                
                return (
                  <Card key={order.id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                        </div>
                        {order.express && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            Express
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        <Badge variant="outline">{serviceNames}</Badge>
                        <div className="mt-1">
                          {totalWeight} kg • Rp {(order.totalAmount || 0).toLocaleString('id-ID')}
                        </div>
                      </div>
                      {hasRFID && (
                        <div className="flex items-center gap-2 text-xs">
                          <Tag className="h-3 w-3 text-green-600" />
                          <span className="font-mono">{order.rfidTagId}</span>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {activeBags.map(bag => (
                          <Button
                            key={bag.id}
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddToBag(order.id, bag.id)}
                            disabled={bag.items.includes(order.id) || bag.status === 'ready'}
                            className="text-xs"
                          >
                            Add to {bag.bagNumber}
                          </Button>
                        ))}
                        {activeBags.length === 0 && (
                          <span className="text-xs text-muted-foreground">Create a bag first</span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Bag Management */}
        <Card>
          <CardHeader>
            <CardTitle>Bag Management ({activeBags.length} bags)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
            {activeBags.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No active bags. Create a new bag to start grouping items.
              </p>
            ) : (
              activeBags.map((bag) => {
                const bagOrders = orders.filter(o => bag.items.includes(o.id));
                const isReady = bag.status === 'ready';
                const maxCapacity = bag.maxCapacity || 7;
                const isOverweight = (bag.totalWeight || 0) > maxCapacity;
                const isMixed = bag.priority === 'mixed' || (bag.expressCount > 0 && bag.regularCount > 0);
                
                return (
                  <Card key={bag.id} className={`p-4 ${isReady ? 'border-green-500 bg-green-50/50' : ''}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{bag.bagName || bag.bagNumber}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={bag.status === 'ready' ? 'default' : 'outline'}>
                              {bag.status === 'ready' ? 'Ready for Pickup' : 'Filling'}
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
                          <QrCode className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      {isOverweight && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Bag overweight ({bag.totalWeight?.toFixed(1)}kg / {maxCapacity}kg max)
                          </AlertDescription>
                        </Alert>
                      )}

                      {isMixed && bag.priority !== 'mixed' && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Bag contains both Express and Regular items
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="text-sm space-y-1">
                        <div><strong>{bag.items.length}</strong> items</div>
                        <div><strong>{(bag.totalWeight || 0).toFixed(1)}</strong> kg / {maxCapacity} kg max</div>
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
                          Destination: Central Facility
                        </div>
                      </div>

                      {bagOrders.length > 0 && (
                        <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                          <div className="font-semibold mb-1">Items:</div>
                          {bagOrders.map(order => {
                            const orderWeight = getTotalOrderWeight(order);
                            return (
                              <div key={order.id} className="flex items-center justify-between p-1 hover:bg-muted rounded group">
                                <div className="truncate flex-1">
                                  {order.customerName} - {order.services?.map(s => s.serviceName).join(", ") || order.serviceName}
                                  <span className="text-muted-foreground ml-1">({orderWeight}kg)</span>
                                </div>
                                {bag.status === 'filling' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveFromBag(order.id, bag.id)}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    type="button"
                                    data-testid={`remove-item-${order.id}-from-bag-${bag.id}`}
                                    title="Hapus item dari bag"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {bag.status === 'filling' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedBagForRfid(bag.id);
                                setRfidScanDialog(true);
                              }}
                              className="flex-1 gap-2"
                              data-testid={`scan-add-bag-${bag.id}`}
                              type="button"
                            >
                              <Radio className="h-4 w-4" />
                              Scan & Add
                            </Button>
                            <Button
                              size="sm"
                              variant={isOverweight ? "destructive" : "outline"}
                              onClick={() => handleFinalizeBag(bag.id)}
                              className="flex-1"
                              type="button"
                              title={isOverweight ? `Bag overweight: ${bag.totalWeight?.toFixed(1)}kg / ${maxCapacity}kg` : "Mark bag as ready for pickup"}
                            >
                              {isOverweight ? "⚠️ Mark Ready (Overweight)" : "Mark Ready"}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintManifest(bag.id)}
                          className="flex-1"
                          type="button"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Manifest
                        </Button>
                        {bag.status === 'filling' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteBag(bag.id)}
                            className="flex-1"
                            type="button"
                            data-testid={`delete-bag-${bag.id}`}
                            title={bag.items.length > 0 ? "Hapus bag (akan mengembalikan semua item ke sorting queue)" : "Hapus bag kosong"}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Delete Bag
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* RFID Scan Dialog */}
      <Dialog open={rfidScanDialog} onOpenChange={setRfidScanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan RFID</DialogTitle>
            <DialogDescription>
              Masukkan atau scan RFID UID untuk menambahkan item ke bag
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>RFID UID</Label>
              <Input
                value={scannedRfid}
                onChange={(e) => setScannedRfid(e.target.value)}
                onKeyDown={(e) => {
                  // Allow Enter key to trigger scan
                  if (e.key === 'Enter' && scannedRfid.trim() && selectedBagForRfid) {
                    e.preventDefault();
                    handleScanRFID();
                  }
                }}
                placeholder="E50F-C8AA-7008"
                className="font-mono"
                data-testid="rfid-uid-input"
                autoFocus
              />
            </div>
            <div>
              <Label>Pilih Bag</Label>
              <Select value={selectedBagForRfid || ''} onValueChange={setSelectedBagForRfid}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bag" />
                </SelectTrigger>
                <SelectContent>
                  {activeBags.filter(b => b.status === 'filling').map(bag => (
                    <SelectItem key={bag.id} value={bag.id}>
                      {bag.bagName || bag.bagNumber} ({bag.items.length} items)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRfidScanDialog(false);
              setScannedRfid('');
              setSelectedBagForRfid(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleScanRFID}
              type="button"
              data-testid="scan-add-button"
              disabled={!scannedRfid.trim() || !selectedBagForRfid}
            >
              <Radio className="h-4 w-4 mr-2" />
              Scan & Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Bag Dialog */}
      <Dialog open={bagCreateDialog} onOpenChange={setBagCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Bag</DialogTitle>
            <DialogDescription>
              Buat bag baru untuk mengelompokkan item sebelum dikirim ke central
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Bag Priority</Label>
              <Select value={newBagPriority} onValueChange={(v: 'express' | 'regular' | 'mixed') => setNewBagPriority(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="express">Express Only</SelectItem>
                  <SelectItem value="regular">Regular Only</SelectItem>
                  <SelectItem value="mixed">Mixed (Express + Regular)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bag akan otomatis diberi nama dan nomor. Kapasitas maksimal: 7kg per bag.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setBagCreateDialog(false);
              setNewBagPriority('mixed');
            }}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCreateBag}>
              <Plus className="h-4 w-4 mr-2" />
              Create Bag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
