"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { useApp } from "@/lib/app-context"
import { formatRupiah, getUser, ADMIN_FEE_PERCENTAGE } from "@/lib/mock-data"
import {
  ArrowLeft, CalendarDays, CreditCard, Check, X, Loader2, AlertCircle, ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Step = "dates" | "review" | "payment" | "processing" | "success" | "failed"

const paymentMethods = [
  { id: "bca", name: "BCA Virtual Account", desc: "Transfer via ATM/Mobile Banking BCA" },
  { id: "mandiri", name: "Mandiri Virtual Account", desc: "Transfer via ATM/Mobile Banking Mandiri" },
  { id: "gopay", name: "GoPay", desc: "Bayar langsung dari dompet GoPay" },
  { id: "ovo", name: "OVO", desc: "Bayar langsung dari dompet OVO" },
]

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { state, dispatch } = useApp()
  const router = useRouter()
  const property = state.properties.find((p) => p.id === id)
  const owner = property ? getUser(property.ownerId) : undefined

  const [step, setStep] = useState<Step>("dates")
  const [duration, setDuration] = useState(6)
  const [selectedPayment, setSelectedPayment] = useState("bca")
  const [simulateFailure, setSimulateFailure] = useState(false)

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Properti tidak ditemukan.</p>
        </div>
      </div>
    )
  }

  const adminFee = Math.round(property.pricePerMonth * ADMIN_FEE_PERCENTAGE / 100)
  const monthlyTotal = property.pricePerMonth + adminFee
  const grandTotal = monthlyTotal * duration
  const today = new Date()
  const checkIn = today.toISOString().split("T")[0]
  const checkOutDate = new Date(today)
  checkOutDate.setMonth(checkOutDate.getMonth() + duration)
  const checkOut = checkOutDate.toISOString().split("T")[0]

  function processPayment() {
    setStep("processing")
    setTimeout(() => {
      if (simulateFailure) {
        setStep("failed")
        setSimulateFailure(false)
        return
      }

      const bookingId = `bk-${Date.now()}`
      const paymentId = `pay-${Date.now()}`
      const method = paymentMethods.find((m) => m.id === selectedPayment)?.name ?? "BCA Virtual Account"

      dispatch({
        type: "CREATE_BOOKING",
        booking: {
          id: bookingId,
          propertyId: property.id,
          tenantId: state.currentUser.id,
          checkIn,
          checkOut,
          status: "menunggu",
          monthlyRent: property.pricePerMonth,
          adminFee,
          totalPaid: monthlyTotal,
          createdAt: new Date().toISOString().split("T")[0],
        },
      })

      dispatch({
        type: "CREATE_PAYMENT",
        payment: {
          id: paymentId,
          bookingId,
          tenantId: state.currentUser.id,
          ownerId: property.ownerId,
          amount: monthlyTotal,
          adminFee,
          netAmount: property.pricePerMonth,
          status: "lunas",
          method,
          dueDate: checkIn,
          paidAt: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString().split("T")[0],
        },
      })

      dispatch({
        type: "ADD_NOTIFICATION",
        notification: {
          id: `n-${Date.now()}`,
          userId: property.ownerId,
          title: "Booking Baru",
          message: `${state.currentUser.name} telah memesan kamar di ${property.name}. Menunggu persetujuan Anda.`,
          type: "booking",
          read: false,
          createdAt: new Date().toISOString().split("T")[0],
        },
      })

      dispatch({
        type: "ADD_NOTIFICATION",
        notification: {
          id: `n-${Date.now() + 1}`,
          userId: state.currentUser.id,
          title: "Pembayaran Berhasil",
          message: `Pembayaran sebesar ${formatRupiah(monthlyTotal)} untuk ${property.name} telah berhasil. Menunggu konfirmasi pemilik.`,
          type: "payment",
          read: false,
          createdAt: new Date().toISOString().split("T")[0],
        },
      })

      toast.success("Pembayaran berhasil!")
      setStep("success")
    }, 2000)
  }

  const steps = [
    { key: "dates", label: "Pilih Durasi" },
    { key: "review", label: "Konfirmasi" },
    { key: "payment", label: "Pembayaran" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <button
          onClick={() => step === "dates" ? router.back() : setStep(steps[Math.max(0, currentStepIndex - 1)].key as Step)}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>

        <h1 className="mb-2 text-2xl font-bold text-foreground">Booking {property.name}</h1>

        {/* Step indicator */}
        {!["processing", "success", "failed"].includes(step) && (
          <div className="mb-8 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  i <= currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  i <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
                {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Dates / Duration */}
        {step === "dates" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Pilih Durasi Sewa</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {[1, 3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={cn(
                    "rounded-lg border p-4 text-center transition-all",
                    duration === m
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-foreground hover:border-primary/50"
                  )}
                >
                  <div className="text-2xl font-bold">{m}</div>
                  <div className="text-sm text-muted-foreground">bulan</div>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-secondary/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in</span>
                <span className="text-foreground font-medium">{checkIn}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Check-out</span>
                <span className="text-foreground font-medium">{checkOut}</span>
              </div>
            </div>

            <button
              onClick={() => setStep("review")}
              className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Lanjutkan
            </button>
          </div>
        )}

        {/* Step 2: Review */}
        {step === "review" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Ringkasan Booking</h2>

            <div className="mb-4 flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="h-16 w-16 shrink-0 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500" />
              <div>
                <h3 className="font-semibold text-card-foreground">{property.name}</h3>
                <p className="text-sm text-muted-foreground">{property.address}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durasi sewa</span>
                <span className="text-foreground">{duration} bulan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sewa per bulan</span>
                <span className="text-foreground">{formatRupiah(property.pricePerMonth)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya admin ({ADMIN_FEE_PERCENTAGE}%)</span>
                <span className="text-foreground">{formatRupiah(adminFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total per bulan</span>
                <span className="text-foreground font-medium">{formatRupiah(monthlyTotal)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span className="text-foreground">Total keseluruhan</span>
                <span className="text-primary">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              * Pembayaran bulan pertama sebesar {formatRupiah(monthlyTotal)} akan diproses sekarang. Sisa pembayaran setiap bulan berikutnya.
            </p>

            <button
              onClick={() => setStep("payment")}
              className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Pilih Pembayaran
            </button>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === "payment" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Pilih Metode Pembayaran</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Pembayaran bulan pertama: <span className="font-bold text-primary">{formatRupiah(monthlyTotal)}</span>
            </p>

            <div className="flex flex-col gap-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPayment(pm.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
                    selectedPayment === pm.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    selectedPayment === pm.id ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {selectedPayment === pm.id && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{pm.name}</p>
                    <p className="text-xs text-muted-foreground">{pm.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Simulate failure toggle for demo */}
            <label className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded border-border accent-primary"
              />
              <span className="text-muted-foreground">Simulasi pembayaran gagal (demo)</span>
            </label>

            <button
              onClick={processPayment}
              className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Bayar {formatRupiah(monthlyTotal)}
            </button>
          </div>
        )}

        {/* Processing */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-4 text-lg font-semibold text-card-foreground">Memproses Pembayaran...</h2>
            <p className="mt-1 text-sm text-muted-foreground">Mohon tunggu, jangan tutup halaman ini</p>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-card-foreground">Pembayaran Berhasil!</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
              Booking Anda untuk {property.name} sedang menunggu konfirmasi dari pemilik kos. Anda akan mendapat notifikasi segera.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/dasbor/penghuni"
                className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Lihat Dasbor
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-border px-6 py-2.5 font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Beranda
              </Link>
            </div>
          </div>
        )}

        {/* Failed */}
        {step === "failed" && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <X className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-card-foreground">Pembayaran Gagal</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
              Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau gunakan metode pembayaran lain.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep("payment")}
                className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Coba Lagi
              </button>
              <Link
                href={`/kos/${property.id}`}
                className="rounded-lg border border-border px-6 py-2.5 font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Kembali
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
