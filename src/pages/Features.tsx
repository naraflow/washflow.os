import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Shield, Zap, Clock } from "lucide-react";
import { WashflowLogo } from "@/components/WashflowLogo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <WashflowLogo size={28} />
            <span className="text-xl font-bold text-primary">washflow.os</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                Kembali ke Beranda
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Seluruh Manajemen Terintegrasi</h1>
            <p className="text-muted-foreground text-lg">
              Kelola seluruh aspek bisnis laundry Anda dalam satu platform yang powerful
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Manajemen Staff</h3>
              <p className="text-muted-foreground">
                Kelola karyawan, absensi, dan performa tim dengan mudah dalam satu dashboard
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <TrendingUp className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Laporan Real-time</h3>
              <p className="text-muted-foreground">
                Pantau transaksi, pendapatan, dan performa bisnis secara real-time
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Keamanan Data</h3>
              <p className="text-muted-foreground">
                Data bisnis Anda aman dengan enkripsi tingkat enterprise
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Zap className="h-12 w-12 text-warning mb-4" />
              <h3 className="text-xl font-semibold mb-2">Otomasi Proses</h3>
              <p className="text-muted-foreground">
                Otomatiskan tugas berulang dan fokus pada pertumbuhan bisnis
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Clock className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tracking Order</h3>
              <p className="text-muted-foreground">
                Lacak setiap pesanan dari penjemputan hingga pengiriman
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <WashflowLogo size={48} className="mb-4" />
              <h3 className="text-xl font-semibold mb-2">Notifikasi Otomatis</h3>
              <p className="text-muted-foreground">
                Informasi otomatis kepada pelanggan via WhatsApp dan SMS
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <WashflowLogo size={20} />
                <span className="font-bold text-primary">washflow.os</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Revolusi bisnis laundry melalui ekosistem digital
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-primary">Fitur</Link></li>
                <li><a href="#" className="hover:text-primary">Biaya</a></li>
                <li><a href="#" className="hover:text-primary">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-primary">Kontak</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Privasi</a></li>
                <li><a href="#" className="hover:text-primary">Syarat</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 washflow.os. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;

