import { CheckCircle2, Zap, BarChart3, Package, Smartphone, Eye, TrendingUp } from "lucide-react";
import { WashflowLogo } from "@/components/WashflowLogo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const About = () => {
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

      {/* Hero Statement */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary-hover">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              washflow.os Core
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Membantu pemilik laundry mengelola operasional harian dengan lebih cepat, akurat, dan otomatis tanpa membutuhkan perangkat mahal atau pelatihan rumit.
            </p>
          </div>
        </div>
      </section>

      {/* Masalah Utama */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">Masalah Utama di Industri Laundry</h2>
            <p className="text-lg text-muted-foreground mb-8 text-center">
              Sebagian besar laundry masih berjalan secara manual, menggunakan WhatsApp, buku catatan, dan komunikasi yang tidak terstruktur. Akibatnya:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="text-destructive font-bold">✗</span>
                <p className="text-foreground">Order sering hilang atau tertukar</p>
              </div>
              <div className="flex gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="text-destructive font-bold">✗</span>
                <p className="text-foreground">Kesalahan input harga dan berat cucian</p>
              </div>
              <div className="flex gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="text-destructive font-bold">✗</span>
                <p className="text-foreground">Pelanggan tidak mendapatkan update yang jelas</p>
              </div>
              <div className="flex gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="text-destructive font-bold">✗</span>
                <p className="text-foreground">Pemilik sulit memantau outlet dan karyawan</p>
              </div>
              <div className="flex gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="text-destructive font-bold">✗</span>
                <p className="text-foreground">Tidak ada data untuk mengukur performa bisnis</p>
              </div>
              <div className="flex gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="text-destructive font-bold">✗</span>
                <p className="text-foreground">Sistem POS retail umum tidak cocok untuk alur laundry</p>
              </div>
            </div>
            <p className="text-center mt-8 text-lg font-semibold text-primary">
              Laundry butuh sistem yang sederhana, pintar, dan sesuai cara kerja laundry, bukan sekadar aplikasi kasir.
            </p>
          </div>
        </div>
      </section>

      {/* Solusi washflow.os */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">Solusi yang Diberikan washflow.os</h2>
            <p className="text-lg text-muted-foreground mb-8 text-center">
              washflow.os Core dibangun khusus untuk laundry, bukan diturunkan dari POS retail. Sistem ini membantu Anda mengelola:
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                "Order per kg / per item",
                "Tag cucian & QR code",
                "Proses cuci → kering → setrika → QC",
                "Pickup & delivery",
                "Pengingat pelanggan otomatis",
                "Pembayaran (cash, transfer, QRIS)",
                "Mesin laundry (status, kapasitas, timer)",
                "Multi-outlet & multi-user"
              ].map((feature, index) => (
                <Card key={index} className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="text-foreground">{feature}</p>
                </Card>
              ))}
            </div>
            <p className="text-center mt-8 text-lg text-muted-foreground">
              Semua dirancang agar bisa dipakai dari HP, tablet, atau laptop.<br />
              <span className="font-semibold text-primary">Tanpa hardware khusus. Tanpa biaya rumit.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Kenapa Berbeda */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Kenapa Berbeda dari Aplikasi Laundry Lain</h2>
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Native Laundry Workflow</h3>
                    <p className="text-muted-foreground">Dibangun mengikuti alur kerja laundry sungguhan.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Dashboard Pemilik Multi-Outlet</h3>
                    <p className="text-muted-foreground">Pemantauan revenue, order, kurir, jam tersibuk, mesin, dan layanan terlaris.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Pickup–Delivery yang Terstruktur</h3>
                    <p className="text-muted-foreground">Kurir dapat mencatat pickup, catatan pelanggan, dan status real-time.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <WashflowLogo size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Modular & Bisa Dipakai Seketika</h3>
                    <p className="text-muted-foreground">Semua fitur bisa dipilih sesuai kebutuhan (tanpa kompleksitas ERP).</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Smartphone className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Tidak Bergantung Perangkat Mahal</h3>
                    <p className="text-muted-foreground">Bisa dipakai hanya dengan smartphone.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Eye className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Punya Mode Operasional + Mode Owner</h3>
                    <p className="text-muted-foreground">Kasir fokus di order. Owner fokus di data.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Filosofi & Nilai Produk */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Filosofi & Nilai Produk</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  Simplicity First
                </h3>
                <p className="text-muted-foreground">Sistem harus mudah dipakai karyawan baru tanpa training panjang.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  Transparency & Accountability
                </h3>
                <p className="text-muted-foreground">Setiap order, transaksi, dan aktivitas tercatat jelas dan mudah dilacak.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Real-Time Awareness
                </h3>
                <p className="text-muted-foreground">Pemilik harus bisa mengetahui kondisi outlet kapan pun dan dari mana pun.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Data-Driven Laundry Operation
                </h3>
                <p className="text-muted-foreground">Laundry kecil sekalipun berhak memiliki dashboard setara bisnis modern.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Misi Jangka Panjang */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">Misi Jangka Panjang</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Membantu 10.000+ laundry di Indonesia bertransformasi dari bisnis manual menjadi bisnis modern yang efisien, terukur, dan siap berkembang menjadi franchise atau multi-outlet.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Hasil yang Terbukti</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">1-2 Jam</div>
                <p className="text-muted-foreground">Menghemat waktu kerja kasir per hari</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">80%</div>
                <p className="text-muted-foreground">Mengurangi kesalahan order</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">✓</div>
                <p className="text-muted-foreground">Meningkatkan repeat customer melalui pengingat otomatis</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">10 Menit</div>
                <p className="text-muted-foreground">Mulai gunakan tanpa instalasi</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-hover">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Mulai gunakan washflow.os Core dalam 10 menit
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Tanpa instalasi, tanpa ribet.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                Coba Sekarang
              </Button>
            </Link>
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

export default About;

