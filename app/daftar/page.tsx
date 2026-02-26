"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { useApp, getRolePath } from "@/lib/app-context"
import { users } from "@/lib/mock-data"
import type { UserRole, ProviderType } from "@/lib/types"
import { Mail, Lock, User, Phone, Eye, EyeOff, Building2, Wrench, Home } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const roles: { role: UserRole; label: string; desc: string; icon: React.ElementType }[] = [
  { role: "penghuni", label: "Penghuni", desc: "Saya mencari kos untuk ditinggali", icon: Home },
  { role: "pemilik", label: "Pemilik Kos", desc: "Saya ingin mengelola properti kos", icon: Building2 },
  { role: "penyedia", label: "Penyedia Layanan", desc: "Saya menawarkan jasa (laundry, kebersihan, dll)", icon: Wrench },
]

const providerTypes: { type: ProviderType; label: string }[] = [
  { type: "laundry", label: "Laundry" },
  { type: "kebersihan", label: "Kebersihan" },
  { type: "tukang", label: "Tukang / Handyman" },
]

export default function RegisterPage() {
  const { dispatch } = useApp()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("penghuni")
  const [providerType, setProviderType] = useState<ProviderType>("laundry")
  const [loading, setLoading] = useState(false)

  function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      const mockUser = selectedRole === "penyedia"
        ? users.find((u) => u.role === "penyedia" && u.providerType === providerType)
        : users.find((u) => u.role === selectedRole)

      if (mockUser) {
        dispatch({ type: "SWITCH_USER", userId: mockUser.id })
        toast.success(`Akun berhasil dibuat! Selamat datang, ${mockUser.name}`)
        router.push(getRolePath(mockUser.role))
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-card-foreground">Daftar di SolusiKos</h1>
              <p className="mt-1 text-sm text-muted-foreground">Buat akun baru dan mulai gunakan SolusiKos</p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              {/* Role selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Daftar sebagai</label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelectedRole(r.role)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all",
                        selectedRole === r.role
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <r.icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider type */}
              {selectedRole === "penyedia" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Jenis Layanan</label>
                  <div className="flex gap-2">
                    {providerTypes.map((pt) => (
                      <button
                        key={pt.type}
                        type="button"
                        onClick={() => setProviderType(pt.type)}
                        className={cn(
                          "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                          providerType === pt.type
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Nama Lengkap</label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    className="w-full bg-transparent py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-transparent py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">No. Telepon</label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full bg-transparent py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full bg-transparent py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Membuat akun..." : "Daftar"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/masuk" className="font-medium text-primary hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
