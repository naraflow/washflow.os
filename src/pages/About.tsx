import { CheckCircle2, Zap, BarChart3, Smartphone, Eye, TrendingUp, Users, Clock, Shield, ArrowRight } from "lucide-react";
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
                Demo
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* A. Opening Statement */}
      <section className="relative overflow-hidden py-24">
        {/* Background Image - Modern Laundromat with Employee using Tablet */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070")',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
        
        {/* Dark Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/80 to-primary-hover/85" />
        
        {/* Additional Dark Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Solution for Modern Laundry
            </h1>
            <p className="text-2xl md:text-3xl text-white/95 mb-8 font-light drop-shadow-md">
              Easy for Staff. Powerful for Owners.
            </p>
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-white/95 leading-relaxed drop-shadow-md">
                WashFlow OS adalah solusi modern untuk operasional laundry masa kini. Sistem ini dibuat agar staff bekerja lebih mudah dan pemilik mendapatkan kontrol yang lebih kuat melalui proses yang jelas dan data real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* B. What We Solve */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Masalah yang Diselesaikan</h2>
            <div className="space-y-6">
              <Card className="p-8 border-l-4 border-l-primary shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Operasional Tidak Rapi</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Operasional laundry sering tidak rapi karena catatan manual dan komunikasi yang terpecah. Order bisa hilang, harga tertukar, dan status cucian tidak jelas.
                </p>
              </Card>
              <Card className="p-8 border-l-4 border-l-primary shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Staff Butuh Sistem Sederhana</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Staff bekerja dengan ritme cepat sehingga butuh sistem yang simple dan langsung dipakai. Tidak ada waktu untuk pelatihan rumit atau interface yang membingungkan.
                </p>
              </Card>
              <Card className="p-8 border-l-4 border-l-primary shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Owner Sulit Memantau Performa</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Owner sulit memantau performa karena kurangnya data dan laporan akurat. Tidak tahu order mana yang selesai, revenue harian, atau aktivitas staff.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* C. What WashFlow OS Does */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Apa yang Membuat WashFlow OS Berbeda</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                WashFlow OS menyederhanakan alur operasional laundry dari order hingga delivery. Setiap langkah terhubung dalam satu flow yang jelas dan mudah diikuti.
              </p>
              <p>
                Sistem ini memudahkan staff menjalankan pekerjaan tanpa pelatihan rumit. Interface sederhana, tombol jelas, dan langkah minimal membuat staff bisa langsung produktif.
              </p>
              <p>
                Bagi owner, WashFlow OS memberikan insight dan kontrol melalui data yang jelas. Semua proses terekam, laporan otomatis, dan aktivitas staff terlihat real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* D. Core Philosophy */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Filosofi Produk</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Simplicity</h3>
                <p className="text-sm text-muted-foreground">Sederhana dan langsung dipakai</p>
              </Card>
              <Card className="p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Clarity</h3>
                <p className="text-sm text-muted-foreground">Proses jelas dan transparan</p>
              </Card>
              <Card className="p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Efficiency</h3>
                <p className="text-sm text-muted-foreground">Menghemat waktu dan tenaga</p>
              </Card>
              <Card className="p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Human-Friendly</h3>
                <p className="text-sm text-muted-foreground">Ramah untuk semua pengguna</p>
              </Card>
              <Card className="p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Data Transparency</h3>
                <p className="text-sm text-muted-foreground">Data jelas dan akurat</p>
              </Card>
              <Card className="p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Scalable</h3>
                <p className="text-sm text-muted-foreground">Siap berkembang multi-outlet</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* E. How We Make It Easy for Staff */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Easy for Staff</h2>
              <p className="text-lg text-muted-foreground">
                Sistem yang dirancang agar staff cepat mengadopsi dan langsung produktif
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Interface Sederhana</h3>
                    <p className="text-sm text-muted-foreground">
                      Tombol besar, teks jelas, dan navigasi intuitif. Tidak perlu manual tebal.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Tombol Jelas</h3>
                    <p className="text-sm text-muted-foreground">
                      Setiap aksi punya tombol yang jelas. Tidak ada menu tersembunyi.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Langkah Minimal</h3>
                    <p className="text-sm text-muted-foreground">
                      Proses order hanya butuh beberapa tap. Tidak ada form panjang.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Akses via HP</h3>
                    <p className="text-sm text-muted-foreground">
                      Bisa dipakai dari smartphone yang sudah dimiliki. Tidak perlu perangkat khusus.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Status Langsung Terlihat</h3>
                    <p className="text-sm text-muted-foreground">
                      Setiap order menampilkan status dengan jelas. Tidak perlu bertanya-tanya.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Tanpa Pelatihan Rumit</h3>
                    <p className="text-sm text-muted-foreground">
                      Staff bisa langsung pakai dalam hitungan menit. Interface yang self-explanatory.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* F. How We Make It Powerful for Owners */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful for Owners</h2>
              <p className="text-lg text-muted-foreground">
                Kontrol penuh dan insight yang jelas untuk keputusan bisnis yang lebih baik
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Data Real Time</h3>
                    <p className="text-sm text-muted-foreground">
                      Lihat revenue, order, dan aktivitas outlet kapan pun. Semua update langsung.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Laporan Otomatis</h3>
                    <p className="text-sm text-muted-foreground">
                      Laporan harian, mingguan, dan bulanan tersedia otomatis. Tidak perlu input manual.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Kontrol Penuh atas Outlet</h3>
                    <p className="text-sm text-muted-foreground">
                      Pantau semua outlet dari satu dashboard. Multi-outlet management yang mudah.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Aktivitas Staff Terekam</h3>
                    <p className="text-sm text-muted-foreground">
                      Setiap aksi staff tercatat dengan jelas. Transparansi dan akuntabilitas terjaga.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Proses Lebih Terukur</h3>
                    <p className="text-sm text-muted-foreground">
                      Setiap proses punya metrik yang jelas. Bisa diukur dan ditingkatkan.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Insight untuk Keputusan</h3>
                    <p className="text-sm text-muted-foreground">
                      Data yang jelas membantu mengambil keputusan bisnis yang lebih tepat.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* G. Vision Statement */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">Visi Kami</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              WashFlow OS ingin menjadi fondasi digital untuk industri laundry yang lebih modern, efisien, dan siap scale menjadi multi-outlet atau franchise.
            </p>
          </div>
        </div>
      </section>

      {/* CTA - Light and Simple */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Link to="/how-it-works">
              <Button 
                variant="outline" 
                size="lg"
                className="text-primary border-primary hover:bg-primary hover:text-white"
              >
                Pelajari cara kerja WashFlow OS
                <ArrowRight className="ml-2 h-4 w-4" />
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

export default About;
