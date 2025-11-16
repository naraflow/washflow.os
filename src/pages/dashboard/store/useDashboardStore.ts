import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, Customer, Service, PickupDelivery, Machine, User, Staff, Attendance, LaundryItem, QualityControl, Outlet, SortingBag } from '../types';

interface DashboardStore {
  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  getOrder: (id: string) => Order | undefined;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;
  updateCustomerStats: (customerId: string, orderValue: number) => void;
  
  // Services
  services: Service[];
  addService: (service: Service) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  getService: (id: string) => Service | undefined;
  
  // Outlets
  outlets: Outlet[];
  addOutlet: (outlet: Outlet) => void;
  updateOutlet: (id: string, outlet: Partial<Outlet>) => void;
  deleteOutlet: (id: string) => void;
  
  // Pickup & Delivery
  pickupsDeliveries: PickupDelivery[];
  addPickupDelivery: (pd: PickupDelivery) => void;
  updatePickupDelivery: (id: string, pd: Partial<PickupDelivery>) => void;
  deletePickupDelivery: (id: string) => void;
  
  // Machines
  machines: Machine[];
  addMachine: (machine: Machine) => void;
  updateMachine: (id: string, machine: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;
  
  // Users
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Staff
  staff: Staff[];
  addStaff: (staff: Staff) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  
  // Attendance
  attendance: Attendance[];
  addAttendance: (attendance: Attendance) => void;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => void;
  
  // Laundry Items
  laundryItems: LaundryItem[];
  addLaundryItem: (item: LaundryItem) => void;
  updateLaundryItem: (id: string, item: Partial<LaundryItem>) => void;
  
  // Quality Control
  qualityControls: QualityControl[];
  addQualityControl: (qc: QualityControl) => void;
  updateQualityControl: (id: string, qc: Partial<QualityControl>) => void;
  
  // Sorting Bags
  sortingBags: SortingBag[];
  addSortingBag: (bag: SortingBag) => void;
  updateSortingBag: (id: string, bag: Partial<SortingBag>) => void;
  deleteSortingBag: (id: string) => void;
  getSortingBag: (id: string) => SortingBag | undefined;
  
  // UI State
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  selectedOutlet?: string;
  setSelectedOutlet: (outletId?: string) => void;
  currentRole: 'kasir' | 'supervisor' | 'supervisor-outlet' | 'supervisor-produksi' | 'owner';
  setCurrentRole: (role: 'kasir' | 'supervisor' | 'supervisor-outlet' | 'supervisor-produksi' | 'owner') => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

// Default services
const defaultServices: Service[] = [
  {
    id: 'svc-1',
    name: 'Laundry Regular',
    description: 'Cuci biasa',
    type: 'regular',
    unitPrice: 8000,
    unit: 'kg',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'svc-2',
    name: 'Cuci + Setrika',
    description: 'Cuci dan setrika',
    type: 'wash_iron',
    unitPrice: 10000,
    unit: 'kg',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'svc-3',
    name: 'Setrika Saja',
    description: 'Setrika tanpa cuci',
    type: 'iron_only',
    unitPrice: 5000,
    unit: 'kg',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'svc-4',
    name: 'Express',
    description: 'Layanan cepat',
    type: 'express',
    unitPrice: 12000,
    unit: 'kg',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
];

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      // Initial state
      orders: [],
      customers: [],
      services: defaultServices,
      outlets: [],
      pickupsDeliveries: [],
      machines: [],
      users: [],
      staff: [],
      attendance: [],
      laundryItems: [],
      qualityControls: [],
      sortingBags: [],
      selectedTab: 'orders',
      selectedOutlet: undefined,
      currentRole: 'supervisor-outlet', // Default role
      isLoggedIn: false,
      
      // Orders
      addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
      updateOrder: (id, updates) =>
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id === id) {
              const updated = { ...o, ...updates };
              // Auto-merge workflow logs if provided
              if (updates.workflowLogs) {
                updated.workflowLogs = [
                  ...(o.workflowLogs || []),
                  ...updates.workflowLogs,
                ];
              }
              return updated;
            }
            return o;
          }),
        })),
      deleteOrder: (id) =>
        set((state) => ({ orders: state.orders.filter((o) => o.id !== id) })),
      getOrder: (id) => get().orders.find((o) => o.id === id),
      
      // Customers
      addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
      updateCustomer: (id, updates) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteCustomer: (id) =>
        set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),
      getCustomer: (id) => get().customers.find((c) => c.id === id),
      updateCustomerStats: (customerId, orderValue) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId
              ? {
                  ...c,
                  totalOrders: c.totalOrders + 1,
                  totalSpent: c.totalSpent + orderValue,
                  lastOrderDate: new Date().toISOString(),
                }
              : c
          ),
        })),
      
      // Services
      addService: (service) => set((state) => ({ services: [...state.services, service] })),
      updateService: (id, updates) =>
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),
      deleteService: (id) =>
        set((state) => ({ 
          services: state.services.filter((s) => {
            // Don't delete if it's the service being deleted AND it's default
            if (s.id === id && s.isDefault) return true;
            // Keep all other services
            return s.id !== id;
          })
        })),
      getService: (id) => get().services.find((s) => s.id === id),
      
      // Outlets
      addOutlet: (outlet) =>
        set((state) => ({
          outlets: [...state.outlets, outlet],
        })),
      updateOutlet: (id, updates) =>
        set((state) => ({
          outlets: state.outlets.map((outlet) =>
            outlet.id === id ? { ...outlet, ...updates, lastUpdated: new Date().toISOString() } : outlet
          ),
        })),
      deleteOutlet: (id) =>
        set((state) => ({
          outlets: state.outlets.filter((outlet) => outlet.id !== id),
        })),
      
      // Pickup & Delivery
      addPickupDelivery: (pd) => set((state) => ({ pickupsDeliveries: [...state.pickupsDeliveries, pd] })),
      updatePickupDelivery: (id, updates) =>
        set((state) => ({
          pickupsDeliveries: state.pickupsDeliveries.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deletePickupDelivery: (id) =>
        set((state) => ({ pickupsDeliveries: state.pickupsDeliveries.filter((p) => p.id !== id) })),
      
      // Machines
      addMachine: (machine) => set((state) => ({ machines: [...state.machines, machine] })),
      updateMachine: (id, updates) =>
        set((state) => ({
          machines: state.machines.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
      deleteMachine: (id) =>
        set((state) => ({ machines: state.machines.filter((m) => m.id !== id) })),
      
      // Users
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        })),
      deleteUser: (id) =>
        set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
      
      // Staff
      addStaff: (staff) => set((state) => ({ staff: [...state.staff, staff] })),
      updateStaff: (id, updates) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),
      deleteStaff: (id) =>
        set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),
      
      // Attendance
      addAttendance: (attendance) => set((state) => ({ attendance: [...state.attendance, attendance] })),
      updateAttendance: (id, updates) =>
        set((state) => ({
          attendance: state.attendance.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),
      
      // Laundry Items
      addLaundryItem: (item) => set((state) => ({ laundryItems: [...state.laundryItems, item] })),
      updateLaundryItem: (id, updates) =>
        set((state) => ({
          laundryItems: state.laundryItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      
      // Quality Control
      addQualityControl: (qc) => set((state) => ({ qualityControls: [...state.qualityControls, qc] })),
      updateQualityControl: (id, updates) =>
        set((state) => ({
          qualityControls: state.qualityControls.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        })),
      
      // Sorting Bags
      addSortingBag: (bag) => set((state) => ({ sortingBags: [...state.sortingBags, bag] })),
      updateSortingBag: (id, updates) =>
        set((state) => ({
          sortingBags: state.sortingBags.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      deleteSortingBag: (id) =>
        set((state) => ({ sortingBags: state.sortingBags.filter((b) => b.id !== id) })),
      getSortingBag: (id) => {
        const state = get();
        return state.sortingBags.find((b) => b.id === id);
      },
      
      // UI State
      setSelectedTab: (tab) => set({ selectedTab: tab }),
      setSelectedOutlet: (outletId) => set({ selectedOutlet: outletId }),
      setCurrentRole: (role) => set({ currentRole: role }),
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
    }),
    {
      name: 'washflow-dashboard-storage',
    }
  )
);

