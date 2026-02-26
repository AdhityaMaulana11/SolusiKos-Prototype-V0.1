"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useApp } from "@/lib/app-context"
import { membershipLabel } from "@/lib/mock-data"
import {
  User, Bell, Shield, Mail, Phone, Save, Loader2, X, Eye,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type SettingsTab = "profil" | "notifikasi" | "keamanan"

export default function SettingsPage() {
  const { state } = useApp()
  const { currentUser } = state
  const [tab, setTab] = useState<SettingsTab>("profil")
  const [saving, setSaving] = useState(false)
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false)

  // Notification preferences (local demo state)
  const [notifPrefs, setNotifPrefs] = useState({
    email_payment: true,
    email_booking: true,
    email_service: false,
    push_payment: true,
    push_booking: true,
    push_service: true,
    whatsapp: false,
  })

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      toast.success("Pengaturan berhasil disimpan!")
      setSaving(false)
    }, 1000)
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "profil", label: "Profil", icon: User },
    { id: "notifikasi", label: "Notifikasi", icon: Bell },
    { id: "keamanan", label: "Keamanan", icon: Shield },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil dan preferensi akun Anda</p>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Profil */}
        {tab === "profil" && (
          <div className="mt-6 flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {currentUser.avatar}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">{currentUser.name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{currentUser.role}</p>
                  {currentUser.membershipTier && (
                    <span className={cn(
                      "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                      currentUser.membershipTier === "emas" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : currentUser.membershipTier === "perak" ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        : "bg-secondary text-secondary-foreground"
                    )}>
                      {membershipLabel(currentUser.membershipTier)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold text-card-foreground">Informasi Pribadi</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Nama Lengkap</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      defaultValue={currentUser.email}
                      className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Nomor Telepon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      defaultValue={currentUser.phone}
                      className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Bergabung Sejak</label>
                  <input
                    type="text"
                    defaultValue={currentUser.createdAt}
                    disabled
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-muted-foreground"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Perubahan
              </button>
            </div>
          </div>
        )}

        {/* Notifikasi */}
        {tab === "notifikasi" && (
          <div className="mt-6 flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold text-card-foreground">Preferensi Notifikasi</h3>

              <div className="flex flex-col gap-6">
                {/* Email notifications */}
                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Notifikasi Email</h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { key: "email_payment" as const, label: "Pembayaran", desc: "Tagihan baru, konfirmasi pembayaran, pengingat jatuh tempo" },
                      { key: "email_booking" as const, label: "Booking", desc: "Booking baru, persetujuan, pembatalan" },
                      { key: "email_service" as const, label: "Layanan", desc: "Permintaan layanan, status layanan" },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div>
                          <p className="font-medium text-card-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            notifPrefs[item.key] ? "bg-primary" : "bg-muted"
                          )}
                          role="switch"
                          aria-checked={notifPrefs[item.key]}
                        >
                          <span className={cn(
                            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
                            notifPrefs[item.key] && "translate-x-5"
                          )} />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Push notifications */}
                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Notifikasi Push</h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { key: "push_payment" as const, label: "Pembayaran" },
                      { key: "push_booking" as const, label: "Booking" },
                      { key: "push_service" as const, label: "Layanan" },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <span className="font-medium text-card-foreground">{item.label}</span>
                        <button
                          onClick={() => setNotifPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            notifPrefs[item.key] ? "bg-primary" : "bg-muted"
                          )}
                          role="switch"
                          aria-checked={notifPrefs[item.key]}
                        >
                          <span className={cn(
                            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
                            notifPrefs[item.key] && "translate-x-5"
                          )} />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>

                {/* WhatsApp */}
                <label className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-card-foreground">Notifikasi WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Terima notifikasi penting via WhatsApp</p>
                  </div>
                  <button
                    onClick={() => setNotifPrefs((prev) => ({ ...prev, whatsapp: !prev.whatsapp }))}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      notifPrefs.whatsapp ? "bg-primary" : "bg-muted"
                    )}
                    role="switch"
                    aria-checked={notifPrefs.whatsapp}
                  >
                    <span className={cn(
                      "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
                      notifPrefs.whatsapp && "translate-x-5"
                    )} />
                  </button>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Simpan
                </button>
                <button
                  onClick={() => setEmailPreviewOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <Eye className="h-4 w-4" />
                  Preview Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keamanan */}
        {tab === "keamanan" && (
          <div className="mt-6 flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold text-card-foreground">Ubah Password</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Password Saat Ini</label>
                  <input
                    type="password"
                    placeholder="Masukkan password saat ini"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Password Baru</label>
                  <input
                    type="password"
                    placeholder="Masukkan password baru"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    placeholder="Masukkan ulang password baru"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex w-fit items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Ubah Password
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold text-card-foreground">Sesi Aktif</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-card-foreground">Browser ini</p>
                    <p className="text-sm text-muted-foreground">Chrome - Windows 10 - Saat ini aktif</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Aktif</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-card-foreground">Perangkat mobile</p>
                    <p className="text-sm text-muted-foreground">Safari - iPhone 15 - Terakhir aktif 2 jam lalu</p>
                  </div>
                  <button className="text-sm text-destructive hover:underline">Keluarkan</button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
              <h3 className="mb-2 font-semibold text-red-800 dark:text-red-300">Zona Bahaya</h3>
              <p className="text-sm text-red-700 dark:text-red-400">Menghapus akun akan menghapus semua data Anda secara permanen.</p>
              <button className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30">
                Hapus Akun
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Email Preview Modal */}
      {emailPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-semibold text-card-foreground">Preview Email Notifikasi</h3>
              <button onClick={() => setEmailPreviewOpen(false)} className="rounded-md p-1 text-muted-foreground hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="rounded-lg border border-border bg-background p-6">
                <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">SK</div>
                  <span className="font-bold text-foreground">SolusiKos</span>
                </div>
                <h4 className="text-lg font-semibold text-foreground">Tagihan Baru - Sewa Bulanan</h4>
                <p className="mt-2 text-sm text-muted-foreground">Halo {currentUser.name},</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tagihan sewa bulan April 2026 sebesar <strong className="text-foreground">Rp 1.575.000</strong> telah dibuat.
                  Jatuh tempo pembayaran adalah <strong className="text-foreground">15 April 2026</strong>.
                </p>
                <div className="mt-4 rounded-lg bg-primary/5 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sewa bulanan</span>
                    <span className="font-medium text-foreground">Rp 1.500.000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biaya admin (5%)</span>
                    <span className="font-medium text-foreground">Rp 75.000</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-primary">Rp 1.575.000</span>
                  </div>
                </div>
                <button className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
                  Bayar Sekarang
                </button>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Email ini dikirim otomatis oleh SolusiKos. Jangan balas email ini.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
