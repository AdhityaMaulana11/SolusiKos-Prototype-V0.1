"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { useApp, getRolePath } from "@/lib/app-context"
import { users } from "@/lib/mock-data"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const { dispatch } = useApp()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      const user = users.find((u) => u.email === email) ?? users[0]
      dispatch({ type: "SWITCH_USER", userId: user.id })
      toast.success(`Selamat datang, ${user.name}!`)
      router.push(getRolePath(user.role))
      setLoading(false)
    }, 800)
  }

  function quickLogin(userId: string) {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    dispatch({ type: "SWITCH_USER", userId })
    toast.success(`Masuk sebagai ${user.name}`)
    router.push(getRolePath(user.role))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-card-foreground">Masuk ke SolusiKos</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Masukkan email dan password Anda
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
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
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">atau masuk cepat (demo)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "t1", label: "Penghuni", sub: "Rina" },
                { id: "o1", label: "Pemilik", sub: "H. Ahmad" },
                { id: "p1", label: "Penyedia", sub: "Laundry BJ" },
                { id: "a1", label: "Admin", sub: "Admin" },
              ].map((q) => (
                <button
                  key={q.id}
                  onClick={() => quickLogin(q.id)}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <div className="font-medium">{q.label}</div>
                  <div className="text-xs text-muted-foreground">{q.sub}</div>
                </button>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/daftar" className="font-medium text-primary hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
