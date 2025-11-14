import { ShoppingCart, Tag, Settings, CheckCircle, CreditCard, Truck, BarChart3, ArrowRight } from "lucide-react";
import { WashflowLogo } from "@/components/WashflowLogo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: ShoppingCart,
      title: "Terima Order",
      description: "Kasir memasukkan nama pelanggan, nomor telepon, layanan, berat/qty, dan metode pembayaran. Sistem otomatis menghitung harga, diskon, surcharge, dan total.",
      outputs: ["Order ID", "Subtotal dan rincian layanan", "QR code / tag cucian (opsional)"]
    },
    {
      number: 2,
      icon: Tag,
      title: "Tag & Identifikasi Cucian",
      description: "Setiap cucian diberi tag kertas, QR code, dan label pelayanan (regular, express, setrika saja). Tujuannya menghindari cucian tertukar.",
      outputs: []
    },
    {
      number: 3,
      icon: Settings,
      title: "Proses di Mesin",
      description: "Operator melihat dashboard mesin (kosong, sedang digunakan, selesai). Operator menekan 'Start Machine' atau 'Complete Cycle'. Sistem mencatat order yang diproses dan memberi timer otomatis.",
      outputs: []
    },
    {
      number: 4,
      icon: CheckCircle,
      title: "Quality Check (QC)",
      description: "Setelah proses selesai, operator mengecek setiap item, menandai 'QC OK', dan mencatat catatan tambahan bila perlu. Status berubah menjadi Ready for Pickup.",
      outputs: []
    },
    {
      number: 5,
      icon: CreditCard,
      title: "Pembayaran & Notifikasi",
      description: "Jika pelanggan belum membayar, sistem menampilkan QRIS / transfer / cash. Sistem bisa mengirim notifikasi WhatsApp otomatis: order masuk, cucian selesai, pengantaran sedang menuju.",
      outputs: []
    },
    {
      number: 6,
      icon: Truck,
      title: "Pengambilan atau Pengantaran",
      description: "Kasir atau kurir menyelesaikan transaksi. Untuk Pickup: kurir klik 'OTW' dan 'Selesai Pickup'. Untuk Delivery: alamat pelanggan tersimpan, status diperbarui real-time, pelanggan mendapat notifikasi.",
      outputs: []
    },
    {
      number: 7,
      icon: BarChart3,
      title: "Dashboard Owner & Laporan Otomatis",
      description: "Owner mendapat laporan: pendapatan harian, order per jam, layanan terlaris, performa kurir, revenue per outlet, margin & biaya operasional, perbandingan outlet. Semua bisa diakses dari HP.",
      outputs: []
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

      {/* Steps Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-12">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative">
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-8 top-20 w-0.5 h-12 bg-primary/20" />
                    )}
                    
                    <Card className="p-6 md:p-8 hover:shadow-lg transition-shadow">
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
                          <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            {step.description}
                          </p>
                          
                          {step.outputs.length > 0 && (
                            <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                              <p className="font-semibold mb-2 text-sm">Output:</p>
                              <ul className="space-y-1">
                                {step.outputs.map((output, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                    <ArrowRight className="h-4 w-4 text-primary" />
                                    {output}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
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

      {/* Visual Flow Diagram */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Alur Kerja Ringkas</h2>
            <div className="flex flex-wrap justify-center gap-4 items-center">
              {steps.slice(0, 6).map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="flex items-center gap-4">
                    <Card className="p-4 w-32 text-center">
                      <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-xs font-semibold">{step.title}</p>
                    </Card>
                    {index < 5 && (
                      <ArrowRight className="h-6 w-6 text-primary/50" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <Card className="p-4 inline-block">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">Dashboard & Laporan</p>
              </Card>
            </div>
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

