import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, TrendingUp, Shield, Zap, Clock, Menu, X } from "lucide-react";
import { WashflowLogo } from "@/components/WashflowLogo";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  
  const [trialForm, setTrialForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: ""
  });

  const [demoForm, setDemoForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    date: "",
    time: ""
  });

  const handleTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Terima kasih! Kami akan menghubungi Anda segera untuk memulai trial gratis 30 hari.");
    setTrialModalOpen(false);
    setTrialForm({ name: "", email: "", phone: "", businessName: "" });
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Demo berhasil dijadwalkan! Kami akan menghubungi Anda sesuai waktu yang dipilih.");
    setDemoModalOpen(false);
    setDemoForm({ name: "", email: "", phone: "", businessName: "", date: "", time: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <WashflowLogo size={28} />
            <span className="text-xl font-bold text-primary">washflow.os</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Fitur
            </Link>
            <Link to="/benefits" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Keuntungan
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Tentang
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Cara Kerja
            </Link>
            <a href="#pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Biaya
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setDemoModalOpen(true)}
            >
              Demo
            </Button>
            <Button 
              size="sm" 
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
              onClick={() => setTrialModalOpen(true)}
            >
              Coba Gratis
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container py-4 space-y-4">
              <Link 
                to="/features" 
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fitur
              </Link>
              <Link 
                to="/benefits" 
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Keuntungan
              </Link>
              <Link 
                to="/about" 
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tentang
              </Link>
              <Link 
                to="/how-it-works" 
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cara Kerja
              </Link>
              <a 
                href="#pricing" 
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Biaya
              </a>
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setDemoModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Demo
                </Button>
                <Button 
                  size="sm" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
                  onClick={() => {
                    setTrialModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Coba Gratis
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-hover py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl md:text-6xl">
              Revolusi Bisnis Laundry <br />
              <span className="text-white/90">Melalui Ekosistem Digital</span>
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/90 md:text-xl">
              Cara cerdas mengelola usaha laundry dengan model bisnis baru masa depan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                onClick={() => setTrialModalOpen(true)}
              >
                Coba Gratis 30 Hari
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10 hover:text-white font-semibold bg-transparent"
                onClick={() => setDemoModalOpen(true)}
              >
                Ajukan Demo
              </Button>
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

      {/* Trial Modal */}
      <Dialog open={trialModalOpen} onOpenChange={setTrialModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Coba Gratis 30 Hari</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah ini untuk memulai trial gratis 30 hari tanpa perlu kartu kredit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTrialSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trial-name">Nama Lengkap *</Label>
              <Input
                id="trial-name"
                required
                value={trialForm.name}
                onChange={(e) => setTrialForm({ ...trialForm, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trial-email">Email *</Label>
              <Input
                id="trial-email"
                type="email"
                required
                value={trialForm.email}
                onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trial-phone">Nomor Telepon *</Label>
              <Input
                id="trial-phone"
                type="tel"
                required
                value={trialForm.phone}
                onChange={(e) => setTrialForm({ ...trialForm, phone: e.target.value })}
                placeholder="081234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trial-business">Nama Usaha *</Label>
              <Input
                id="trial-business"
                required
                value={trialForm.businessName}
                onChange={(e) => setTrialForm({ ...trialForm, businessName: e.target.value })}
                placeholder="Laundry ABC"
              />
            </div>
            <Button type="submit" className="w-full">
              Mulai Trial Gratis
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Demo Modal */}
      <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Demo</DialogTitle>
            <DialogDescription>
              Jadwalkan demo dengan tim kami untuk melihat bagaimana washflow.os dapat membantu bisnis Anda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDemoSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="demo-name">Nama Lengkap *</Label>
              <Input
                id="demo-name"
                required
                value={demoForm.name}
                onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-email">Email *</Label>
              <Input
                id="demo-email"
                type="email"
                required
                value={demoForm.email}
                onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-phone">Nomor Telepon *</Label>
              <Input
                id="demo-phone"
                type="tel"
                required
                value={demoForm.phone}
                onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                placeholder="081234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-business">Nama Usaha *</Label>
              <Input
                id="demo-business"
                required
                value={demoForm.businessName}
                onChange={(e) => setDemoForm({ ...demoForm, businessName: e.target.value })}
                placeholder="Laundry ABC"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demo-date">Tanggal *</Label>
                <Input
                  id="demo-date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={demoForm.date}
                  onChange={(e) => setDemoForm({ ...demoForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-time">Waktu *</Label>
                <Input
                  id="demo-time"
                  type="time"
                  required
                  value={demoForm.time}
                  onChange={(e) => setDemoForm({ ...demoForm, time: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Jadwalkan Demo
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
