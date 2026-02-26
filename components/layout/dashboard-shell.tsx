"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/lib/app-context"
import {
  CalendarDays, CreditCard, Wrench, Bell, Home, Building2, Users, BarChart3, CheckCircle,
  Briefcase, DollarSign, Settings, ClipboardList,
} from "lucide-react"
import type { ReactNode } from "react"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const tenantNav: NavItem[] = [
  { href: "/dasbor/penghuni", label: "Ringkasan", icon: Home },
  { href: "/dasbor/penghuni?tab=booking", label: "Booking Aktif", icon: CalendarDays },
  { href: "/dasbor/penghuni?tab=pembayaran", label: "Pembayaran", icon: CreditCard },
  { href: "/dasbor/penghuni?tab=layanan", label: "Layanan", icon: Wrench },
  { href: "/dasbor/penghuni?tab=notifikasi", label: "Notifikasi", icon: Bell },
]

const ownerNav: NavItem[] = [
  { href: "/dasbor/pemilik", label: "Ringkasan", icon: Home },
  { href: "/dasbor/pemilik?tab=properti", label: "Properti Saya", icon: Building2 },
  { href: "/dasbor/pemilik?tab=penghuni", label: "Daftar Penghuni", icon: Users },
  { href: "/dasbor/pemilik?tab=keuangan", label: "Arus Kas", icon: BarChart3 },
  { href: "/dasbor/pemilik?tab=persetujuan", label: "Persetujuan", icon: CheckCircle },
]

const providerNav: NavItem[] = [
  { href: "/dasbor/penyedia", label: "Ringkasan", icon: Home },
  { href: "/dasbor/penyedia?tab=pekerjaan", label: "Pekerjaan", icon: Briefcase },
  { href: "/dasbor/penyedia?tab=layanan", label: "Layanan Saya", icon: ClipboardList },
  { href: "/dasbor/penyedia?tab=pendapatan", label: "Pendapatan", icon: DollarSign },
]

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const currentUser = useCurrentUser()

  let navItems: NavItem[] = tenantNav
  let title = "Dasbor Penghuni"

  if (currentUser.role === "pemilik") {
    navItems = ownerNav
    title = "Dasbor Pemilik"
  } else if (currentUser.role === "penyedia") {
    navItems = providerNav
    title = "Dasbor Penyedia"
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-4 font-semibold text-card-foreground">{title}</h2>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname + (typeof window !== "undefined" ? window.location.search : "") === item.href ||
                (item.href.includes("?") === false && pathname === item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
            <div className="my-2 border-t border-border" />
            <Link
              href="/pengaturan"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
              Pengaturan
            </Link>
          </nav>
        </div>
      </aside>

      {/* Mobile nav tabs */}
      <div className="overflow-x-auto lg:hidden">
        <nav className="flex gap-1 pb-2">
          {navItems.map((item) => {
            const isActive = pathname + (typeof window !== "undefined" ? window.location.search : "") === item.href ||
              (item.href.includes("?") === false && pathname === item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
