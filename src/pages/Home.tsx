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
import heroImage from "@/assets/hero-home.webp";

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  
  const [trialForm, setTrialForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: ""
  });

  const handleTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Terima kasih! Kami akan menghubungi Anda segera untuk memulai trial gratis 30 hari.");
    setTrialModalOpen(false);
    setTrialForm({ name: "", email: "", phone: "", businessName: "" });
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
              <Button 
                size="sm" 
                variant="outline"
                className="border-gray-300"
              >
                Demo
              </Button>
            </Link>
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
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-gray-300"
                  >
                    Demo
                  </Button>
                </Link>
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
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Image - Modern Laundromat with Employee using Tablet */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
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
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl drop-shadow-lg">
              Solution for Modern Laundry
            </h1>
            <p className="mb-8 text-lg text-white/95 md:text-xl drop-shadow-md">
              Easy for Staff. Powerful for Owners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/95 font-semibold shadow-xl border-2 border-white"
                onClick={() => setTrialModalOpen(true)}
              >
                Coba Gratis
              </Button>
              <Link to="/about">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/30 hover:text-white font-semibold bg-white/20 backdrop-blur-md shadow-lg drop-shadow-lg"
                >
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

    </div>
  );
};

export default Home;
