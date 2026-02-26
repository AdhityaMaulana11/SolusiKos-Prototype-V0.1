"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useApp, useUnreadCount, getRolePath } from "@/lib/app-context"
import { users } from "@/lib/mock-data"
import {
  Home, Search, User, Bell, Sun, Moon, Menu, X, ChevronDown, LogOut, Settings, LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { state, dispatch } = useApp()
  const { currentUser } = state
  const unreadCount = useUnreadCount()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const isDashboard = pathname.startsWith("/dasbor") || pathname.startsWith("/admin")

  const userNotifs = state.notifications.filter((n) => n.userId === currentUser.id).slice(0, 5)

  const navLinks = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/cari", label: "Cari Kos", icon: Search },
    { href: "/membership", label: "Membership", icon: null },
  ]

  const roleLabels: Record<string, string> = {
    penghuni: "Penghuni",
    pemilik: "Pemilik",
    penyedia: "Penyedia",
    admin: "Admin",
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            SK
          </div>
          <span className="hidden sm:inline">SolusiKos</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === link.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={getRolePath(currentUser.role)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isDashboard ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            Dasbor
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Toggle tema"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false) }}
              className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Notifikasi"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b border-border p-3">
                  <h3 className="font-semibold text-card-foreground">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ", userId: currentUser.id })}
                      className="text-xs text-primary hover:underline"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {userNotifs.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">Tidak ada notifikasi</p>
                  ) : (
                    userNotifs.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => dispatch({ type: "MARK_NOTIFICATION_READ", notificationId: n.id })}
                        className={cn(
                          "flex w-full flex-col gap-0.5 border-b border-border p-3 text-left transition-colors hover:bg-accent/50",
                          !n.read && "bg-primary/5"
                        )}
                      >
                        <span className="text-sm font-medium text-card-foreground">{n.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">{n.message}</span>
                      </button>
                    ))
                  )}
                </div>
                <Link
                  href="/pengaturan"
                  onClick={() => setNotifOpen(false)}
                  className="block border-t border-border p-2 text-center text-xs text-primary hover:underline"
                >
                  Lihat semua
                </Link>
              </div>
            )}
          </div>

          {/* User / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false) }}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {currentUser.avatar}
              </div>
              <span className="hidden text-foreground sm:inline">{currentUser.name.split(" ")[0]}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card shadow-lg">
                <div className="border-b border-border p-3">
                  <p className="text-sm font-semibold text-card-foreground">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[currentUser.role]}</p>
                </div>
                <div className="border-b border-border p-2">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ganti Peran (Demo)</p>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        dispatch({ type: "SWITCH_USER", userId: u.id })
                        setUserMenuOpen(false)
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                        u.id === currentUser.id && "bg-accent"
                      )}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                        {u.avatar}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-card-foreground">{u.name}</span>
                        <span className="text-[10px] text-muted-foreground">{roleLabels[u.role]}{u.providerType ? ` (${u.providerType})` : ""}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-2">
                  <Link
                    href={getRolePath(currentUser.role)}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-card-foreground transition-colors hover:bg-accent"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dasbor
                  </Link>
                  <Link
                    href="/pengaturan"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-card-foreground transition-colors hover:bg-accent"
                  >
                    <Settings className="h-4 w-4" /> Pengaturan
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-muted-foreground md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card md:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={getRolePath(currentUser.role)}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
            >
              Dasbor
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
