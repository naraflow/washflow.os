import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Receipt, 
  LogOut,
  Plus,
  Trash2,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: "Active" | "Inactive";
}

interface AttendanceRecord {
  id: string;
  staffName: string;
  date: string;
  status: "Present" | "Absent" | "Late";
}

interface Transaction {
  id: string;
  customer: string;
  service: string;
  amount: number;
  status: "Pending" | "Completed" | "Processing";
  date: string;
}

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: "1", name: "Ahmad Ridwan", role: "Kasir", status: "Active" },
    { id: "2", name: "Siti Nurhaliza", role: "Operator", status: "Active" },
    { id: "3", name: "Budi Santoso", role: "Kurir", status: "Active" },
  ]);

  const [attendance] = useState<AttendanceRecord[]>([
    { id: "1", staffName: "Ahmad Ridwan", date: "2024-01-15", status: "Present" },
    { id: "2", staffName: "Siti Nurhaliza", date: "2024-01-15", status: "Present" },
    { id: "3", staffName: "Budi Santoso", date: "2024-01-15", status: "Late" },
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: "1", customer: "John Doe", service: "Cuci Kering", amount: 50000, status: "Completed", date: "2024-01-15" },
    { id: "2", customer: "Jane Smith", service: "Cuci Setrika", amount: 75000, status: "Processing", date: "2024-01-15" },
    { id: "3", customer: "Bob Johnson", service: "Dry Clean", amount: 100000, status: "Pending", date: "2024-01-15" },
  ]);

  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
      toast.success("Login berhasil! Selamat datang di SmartLink Dashboard");
    } else {
      toast.error("Silakan masukkan email dan password yang valid");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    toast.info("Anda telah keluar dari dashboard");
  };

  const handleAddStaff = () => {
    if (newStaffName && newStaffRole) {
      const newStaff: StaffMember = {
        id: Date.now().toString(),
        name: newStaffName,
        role: newStaffRole,
        status: "Active"
      };
      setStaff([...staff, newStaff]);
      setNewStaffName("");
      setNewStaffRole("");
      toast.success(`${newStaffName} berhasil ditambahkan sebagai ${newStaffRole}`);
    }
  };

  const handleDeleteStaff = (id: string) => {
    const staffMember = staff.find(s => s.id === id);
    setStaff(staff.filter(s => s.id !== id));
    toast.success(`${staffMember?.name} telah dihapus dari daftar staff`);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-hover flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">SmartLink Admin</h1>
            <p className="text-muted-foreground">Silakan masuk untuk mengakses dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@smartlink.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">SmartLink Dashboard</h1>
            <p className="text-sm text-muted-foreground">Dashboard / Outlet Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <ClipboardList className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hadir Hari Ini</p>
                <p className="text-2xl font-bold">{attendance.filter(a => a.status === "Present").length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Receipt className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transaksi Hari Ini</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendapatan</p>
                <p className="text-2xl font-bold">Rp {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="attendance">Absensi</TabsTrigger>
            <TabsTrigger value="transactions">Transaksi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ringkasan Bisnis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Status Operasional</span>
                  <span className="text-success font-semibold">● Aktif</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Staff Aktif</span>
                  <span className="font-semibold">{staff.filter(s => s.status === "Active").length} orang</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Transaksi Selesai</span>
                  <span className="font-semibold">{transactions.filter(t => t.status === "Completed").length} pesanan</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Pendapatan Hari Ini</span>
                  <span className="font-semibold text-success">Rp {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Manajemen Staff</h3>
              </div>
              
              {/* Add Staff Form */}
              <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Tambah Staff Baru
                </h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    placeholder="Nama Staff"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                  />
                  <Input
                    placeholder="Posisi (Kasir/Operator/Kurir)"
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                  />
                  <Button onClick={handleAddStaff} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Staff
                  </Button>
                </div>
              </div>

              {/* Staff List */}
              <div className="space-y-2">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${member.status === "Active" ? "text-success" : "text-muted-foreground"}`}>
                        {member.status}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteStaff(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Rekap Absensi</h3>
              <div className="space-y-2">
                {attendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.staffName}</p>
                      <p className="text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString('id-ID')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      record.status === "Present" ? "bg-success/10 text-success" :
                      record.status === "Late" ? "bg-warning/10 text-warning" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Daftar Transaksi</h3>
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.customer}</p>
                      <p className="text-sm text-muted-foreground">{transaction.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Rp {transaction.amount.toLocaleString()}</p>
                      <span className={`text-sm ${
                        transaction.status === "Completed" ? "text-success" :
                        transaction.status === "Processing" ? "text-warning" :
                        "text-muted-foreground"
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
