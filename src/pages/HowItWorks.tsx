import { ShoppingCart, Tag, Settings, CheckCircle2, CreditCard, Truck, BarChart3, ArrowRight, ClipboardList } from "lucide-react";
import { WashflowLogo } from "@/components/WashflowLogo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: ClipboardList,
      title: "Terima Order",
      subtitle: "Catat data pelanggan dan layanan dengan cepat menggunakan form sederhana.",
      description: "Pelanggan datang atau pickup dijadwalkan. Data pelanggan dan layanan dicatat."
    },
    {
      number: 2,
      icon: Tag,
      title: "Tag dan Identifikasi Cucian",
      subtitle: "Gunakan QR atau tag fisik untuk memastikan cucian tidak tertukar.",
      description: "Setiap cucian diberi label atau QR agar tidak tertukar."
    },
    {
      number: 3,
      icon: Settings,
      title: "Proses di Mesin",
      subtitle: "Pantau status mesin. Otomatisasi alur cuci, kering, dan setrika.",
      description: "Cucian diproses dalam tahap washing, drying, dan ironing."
    },
    {
      number: 4,
      icon: CheckCircle2,
      title: "Quality Check (QC)",
      subtitle: "Pastikan hasil akhir bersih, rapi, dan sesuai standar laundry.",
      description: "Operator memastikan hasil bersih, rapi, dan sesuai standar."
    },
    {
      number: 5,
      icon: CreditCard,
      title: "Pembayaran dan Konfirmasi",
      subtitle: "Bayar melalui QRIS, transfer, atau tunai. Sistem mengirim notifikasi otomatis.",
      description: "Pembayaran melalui QRIS, tunai, atau transfer dengan notifikasi otomatis."
    },
    {
      number: 6,
      icon: Truck,
      title: "Pengambilan atau Pengantaran",
      subtitle: "Kurir update status real time. Pelanggan mendapat info barang sampai.",
      description: "Pelanggan mengambil pesanan atau kurir mengantarkan ke alamat."
    },
    {
      number: 7,
      icon: BarChart3,
      title: "Dashboard dan Laporan Real Time",
      subtitle: "Lihat kinerja outlet, pendapatan, aktivitas staff, dan laporan otomatis.",
      description: "Owner memantau performa outlet, staff, dan pendapatan harian."
    }
  ];

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

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary-hover">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Cara Kerja washflow.os Core
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Menyederhanakan alur laundry dari pelanggan datang hingga cucian selesai, dengan sistem yang terintegrasi dari order sampai laporan keuangan.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Steps Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-12">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative">
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-8 top-20 w-0.5 h-12 bg-primary/20 hidden md:block" />
                    )}
                    
                    <Card className="p-6 md:p-8 hover:shadow-lg transition-shadow shadow-sm">
                      <div className="flex gap-6">
                        {/* Step Number & Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center relative">
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                              {step.number}
                            </div>
                            <Icon className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                          <p className="text-muted-foreground mb-3 leading-relaxed font-medium">
                            {step.subtitle}
                          </p>
                          <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA After Diagram */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                size="lg"
                className="text-primary border-primary hover:bg-primary hover:text-white"
              >
                Lihat demo cara kerja WashFlow OS
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-hover">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Siap Mencoba washflow.os Core?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Lihat bagaimana sistem ini bekerja untuk bisnis laundry Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                  Coba Demo
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
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
                Easy for Staff. Powerful for Owners.
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
                <li><Link to="/about" className="hover:text-primary">Tentang Kami</Link></li>
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

export default HowItWorks;
