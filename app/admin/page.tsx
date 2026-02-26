"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { StatusBadge } from "@/components/shared/status-badge"
import { useApp, ADMIN_FEE_PERCENTAGE } from "@/lib/app-context"
import { formatRupiah, getUser, getProperty, membershipLabel, regions } from "@/lib/mock-data"
import {
  DollarSign, Users, Building2, BarChart3, Shield, TrendingUp, CreditCard, ArrowDownRight,
  ArrowUpRight, Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts"

type AdminTab = "ringkasan" | "transaksi" | "pengguna" | "properti"

export default function AdminPanel() {
  const { state } = useApp()
  const [tab, setTab] = useState<AdminTab>("ringkasan")

  const totalUsers = state.users.filter((u) => u.role !== "admin").length
  const totalProperties = state.properties.length
  const totalBookings = state.bookings.length

  const allPayments = state.payments
  const paidPayments = allPayments.filter((p) => p.status === "lunas")
  const totalTransactionVolume = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalAdminFees = paidPayments.reduce((sum, p) => sum + p.adminFee, 0)
  const pendingPayments = allPayments.filter((p) => p.status === "belum_bayar" || p.status === "menunggu")

  const usersByRole = [
    { name: "Penghuni", value: state.users.filter((u) => u.role === "penghuni").length },
    { name: "Pemilik", value: state.users.filter((u) => u.role === "pemilik").length },
    { name: "Penyedia", value: state.users.filter((u) => u.role === "penyedia").length },
  ]

  const propertiesByRegion = regions.map((r) => ({
    name: r.name,
    jumlah: state.properties.filter((p) => p.region === r.id).length,
  }))

  const monthlyVolume = [
    { bulan: "Jan", volume: 0, fee: 0 },
    { bulan: "Feb", volume: 1575000, fee: 75000 },
    { bulan: "Mar", volume: 2940000, fee: 140000 },
    { bulan: "Apr", volume: 0, fee: 0 },
  ]

  const COLORS = ["oklch(0.7 0.16 55)", "oklch(0.6 0.1 160)", "oklch(0.65 0.12 75)"]

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "ringkasan", label: "Ringkasan", icon: BarChart3 },
    { id: "transaksi", label: "Transaksi", icon: CreditCard },
    { id: "pengguna", label: "Pengguna", icon: Users },
    { id: "properti", label: "Properti", icon: Building2 },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-card-foreground">Admin Panel</h2>
            </div>
            <nav className="flex flex-col gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left",
                    tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile tab nav */}
        <div className="overflow-x-auto lg:hidden">
          <nav className="flex gap-1 pb-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Ringkasan */}
          {tab === "ringkasan" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Total Pengguna", value: totalUsers, icon: Users, color: "text-primary" },
                  { label: "Total Properti", value: totalProperties, icon: Building2, color: "text-sky-500" },
                  { label: "Volume Transaksi", value: formatRupiah(totalTransactionVolume), icon: TrendingUp, color: "text-emerald-500", small: true },
                  { label: "Pendapatan Fee", value: formatRupiah(totalAdminFees), icon: DollarSign, color: "text-amber-500", small: true },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                    <p className={cn("mt-2 font-bold text-card-foreground", stat.small ? "text-xl" : "text-3xl")}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Volume chart */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 font-semibold text-card-foreground">Volume Transaksi & Fee Bulanan</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyVolume}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="bulan" tick={{ fill: "oklch(0.5 0.02 55)" }} />
                      <YAxis tick={{ fill: "oklch(0.5 0.02 55)" }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
                      <Tooltip
                        formatter={(value: number, name: string) => [formatRupiah(value), name === "volume" ? "Volume" : "Fee Admin"]}
                        contentStyle={{ backgroundColor: "oklch(0.995 0.001 75)", border: "1px solid oklch(0.9 0.02 75)", borderRadius: "8px" }}
                      />
                      <Legend formatter={(v) => v === "volume" ? "Volume Transaksi" : `Fee Admin (${ADMIN_FEE_PERCENTAGE}%)`} />
                      <Bar dataKey="volume" fill="oklch(0.7 0.16 55)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="fee" fill="oklch(0.88 0.06 75)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Users by role pie */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 font-semibold text-card-foreground">Pengguna per Peran</h2>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={usersByRole} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                          {usersByRole.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Properties by region */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 font-semibold text-card-foreground">Properti per Wilayah</h2>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={propertiesByRegion}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" tick={{ fill: "oklch(0.5 0.02 55)" }} />
                        <YAxis tick={{ fill: "oklch(0.5 0.02 55)" }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="jumlah" fill="oklch(0.7 0.16 55)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaksi */}
          {tab === "transaksi" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold text-foreground">Semua Transaksi</h1>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="mt-1 text-2xl font-bold text-card-foreground">{formatRupiah(totalTransactionVolume)}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Total Fee ({ADMIN_FEE_PERCENTAGE}%)</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{formatRupiah(totalAdminFees)}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Transaksi Tertunda</p>
                  <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingPayments.length}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Penghuni</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pemilik</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Jumlah</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fee</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bersih</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Metode</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPayments.map((p) => {
                      const tenant = getUser(p.tenantId)
                      const owner = getUser(p.ownerId)
                      return (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                          <td className="px-4 py-3 text-card-foreground">{tenant?.name}</td>
                          <td className="px-4 py-3 text-card-foreground">{owner?.name}</td>
                          <td className="px-4 py-3 text-card-foreground">{formatRupiah(p.amount)}</td>
                          <td className="px-4 py-3 text-primary font-medium">{formatRupiah(p.adminFee)}</td>
                          <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">{formatRupiah(p.netAmount)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{p.method || "-"}</td>
                          <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pengguna */}
          {tab === "pengguna" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold text-foreground">Manajemen Pengguna</h1>
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Peran</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Membership</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bergabung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.users.filter((u) => u.role !== "admin").map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{u.avatar}</div>
                            <span className="font-medium text-card-foreground">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize text-secondary-foreground">{u.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          {u.membershipTier ? (
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-semibold",
                              u.membershipTier === "emas" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : u.membershipTier === "perak" ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                : "bg-secondary text-secondary-foreground"
                            )}>
                              {membershipLabel(u.membershipTier)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Properti */}
          {tab === "properti" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold text-foreground">Semua Properti</h1>
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Wilayah</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pemilik</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Harga</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kamar</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rating</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.properties.map((p) => {
                      const owner = getUser(p.ownerId)
                      const region = regions.find((r) => r.id === p.region)
                      return (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                          <td className="px-4 py-3 font-medium text-card-foreground">{p.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{region?.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{owner?.name}</td>
                          <td className="px-4 py-3 font-medium text-primary">{formatRupiah(p.pricePerMonth)}</td>
                          <td className="px-4 py-3 text-card-foreground">
                            {p.totalRooms - p.availableRooms}/{p.totalRooms}
                          </td>
                          <td className="px-4 py-3 text-card-foreground">{p.rating}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-semibold",
                              p.membershipTier === "emas" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : p.membershipTier === "perak" ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                : "bg-secondary text-secondary-foreground"
                            )}>
                              {membershipLabel(p.membershipTier)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
