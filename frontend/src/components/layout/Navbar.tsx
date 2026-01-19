// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Componente Navbar
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Activity, 
  Database, 
  Map,
  Menu,
  X,
  Target,
  Cpu,
  Radio
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/nido", label: "Nido Sísmico", icon: Target },
  { href: "/simulador", label: "Simulador", icon: Cpu },
  { href: "/datos", label: "Datos", icon: Database },
  { href: "/arcgis", label: "ArcGIS", icon: Map },
  { href: "/tiempo-real", label: "Tiempo Real", icon: Radio }, 
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-siasic-bg-secondary border-b border-siasic-bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-siasic-accent-cyan rounded-lg flex items-center justify-center">
              <Activity className="text-siasic-bg-primary" size={24} />
            </div>
            <div>
              <span className="text-xl font-bold text-siasic-text-primary">SIASIC</span>
              <span className="text-siasic-accent-cyan font-bold">-Santander</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${isActive 
                      ? "bg-siasic-accent-cyan/10 text-siasic-accent-cyan border border-siasic-accent-cyan/30" 
                      : "text-siasic-text-secondary hover:text-siasic-text-primary hover:bg-siasic-bg-card"
                    }
                  `}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-siasic-text-secondary hover:bg-siasic-bg-card"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-siasic-bg-secondary border-t border-siasic-bg-card">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                    ${isActive 
                      ? "bg-siasic-accent-cyan/10 text-siasic-accent-cyan" 
                      : "text-siasic-text-secondary hover:bg-siasic-bg-card"
                    }
                  `}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}