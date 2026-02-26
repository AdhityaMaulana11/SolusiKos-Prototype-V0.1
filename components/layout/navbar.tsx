"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useState, useRef, useEffect } from "react"
import { useApp, useUnreadCount, getRolePath } from "@/lib/app-context"
import { users } from "@/lib/mock-data"
import {
  Home, Search, User, Bell, Sun, Moon, Menu, X, ChevronDown, LogOut, Settings, LayoutDashboard,
  MessageCircle, Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function Navbar() {
  const { state, dispatch } = useApp()
  const { currentUser } = state
  const unreadCount = useUnreadCount()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

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

  const roleColors: Record<string, string> = {
    penghuni: "bg-emerald-500",
    pemilik: "bg-amber-500",
    penyedia: "bg-sky-500",
    admin: "bg-red-500",
  }

  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatOpen, state.chatMessages])

  function handleSendChat() {
    if (!chatMsg.trim()) return
    dispatch({
      type: "ADD_CHAT_MESSAGE",
      message: {
        id: `cm-${Date.now()}`,
        senderId: currentUser.id,
        message: chatMsg,
        timestamp: new Date().toLocaleString("id-ID"),
        isAdmin: false,
      },
    })
    setChatMsg("")

    setTimeout(() => {
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        message: {
          id: `cm-${Date.now() + 1}`,
          senderId: "a1",
          message: "Terima kasih atas pertanyaan Anda. Tim kami akan segera merespons. Mohon tunggu sebentar.",
          timestamp: new Date().toLocaleString("id-ID"),
          isAdmin: true,
        },
      })
    }, 1500)
  }

  function closeAll() {
    setNotifOpen(false)
    setUserMenuOpen(false)
  }

  return (
    <>
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
          <div className="flex items-center gap-1.5">
            {/* Role badge */}
            <div className={cn(
              "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white sm:flex transition-all",
              roleColors[currentUser.role]
            )}>
              <div className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" />
              {roleLabels[currentUser.role]}
            </div>

            {/* Chat with admin */}
            <button
              onClick={() => { setChatOpen(!chatOpen); closeAll() }}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Chat Admin"
            >
              <MessageCircle className="h-5 w-5" />
            </button>

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
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-bounce">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
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
                          <div className="flex items-center gap-2">
                            {!n.read && <div className="h-2 w-2 shrink-0 rounded-full bg-primary animate-pulse" />}
                            <span className="text-sm font-medium text-card-foreground">{n.title}</span>
                          </div>
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
                <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="border-b border-border p-3">
                    <p className="text-sm font-semibold text-card-foreground">{currentUser.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("inline-flex h-2 w-2 rounded-full", roleColors[currentUser.role])} />
                      <p className="text-xs text-muted-foreground">{roleLabels[currentUser.role]}</p>
                    </div>
                  </div>
                  <div className="border-b border-border p-2">
                    <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ganti Peran (Demo)</p>
                    <div className="max-h-48 overflow-y-auto">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            dispatch({ type: "SWITCH_USER", userId: u.id })
                            setUserMenuOpen(false)
                            toast.success(`Beralih ke ${u.name}`)
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
          <div className="border-t border-border bg-card md:hidden animate-in slide-in-from-top-2 duration-200">
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

      {/* Chat modal */}
      {chatOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-bold text-primary-foreground">
                AD
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Admin SolusiKos</p>
                <p className="text-[10px] text-primary-foreground/70">Online</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="h-72 overflow-y-auto p-3 flex flex-col gap-2">
            {state.chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                  msg.isAdmin
                    ? "self-start bg-secondary text-secondary-foreground"
                    : "self-end bg-primary text-primary-foreground"
                )}
              >
                <p>{msg.message}</p>
                <p className={cn("mt-0.5 text-[10px]", msg.isAdmin ? "text-muted-foreground" : "text-primary-foreground/60")}>
                  {msg.timestamp}
                </p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendChat() }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
