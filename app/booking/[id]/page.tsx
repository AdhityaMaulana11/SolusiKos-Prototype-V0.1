"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { useApp } from "@/lib/app-context"
import { formatRupiah, getUser, rentalPeriodLabel, ADMIN_FEE_PERCENTAGE } from "@/lib/mock-data"
import type { RentalPeriod } from "@/lib/types"
import {
  ArrowLeft, CalendarDays, CreditCard, Check, X, Loader2, AlertCircle, ChevronRight, Clock,
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
  const [rentalType, setRentalType] = useState<RentalPeriod>(property?.rentalPeriods[0] ?? "bulanan")
  const [duration, setDuration] = useState(1)
  const [moveInDate, setMoveInDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split("T")[0]
  })
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

  const durationOptions: Record<RentalPeriod, number[]> = {
    mingguan: [1, 2, 3, 4],
    bulanan: [1, 3, 6, 12],
    tahunan: [1, 2, 3],
  }

  const durationLabels: Record<RentalPeriod, string> = {
    mingguan: "minggu",
    bulanan: "bulan",
    tahunan: "tahun",
  }

  function getBasePrice(): number {
    switch (rentalType) {
      case "mingguan": return property!.pricePerWeek ?? Math.round(property!.pricePerMonth / 4)
      case "tahunan": return property!.pricePerYear ?? property!.pricePerMonth * 10
      default: return property!.pricePerMonth
    }
  }

  const basePrice = getBasePrice()
  const subtotal = basePrice * duration
  const adminFee = Math.round(subtotal * ADMIN_FEE_PERCENTAGE / 100)
  const grandTotal = subtotal + adminFee

  const checkOutDate = (() => {
    const d = new Date(moveInDate)
    switch (rentalType) {
      case "mingguan": d.setDate(d.getDate() + duration * 7); break
      case "bulanan": d.setMonth(d.getMonth() + duration); break
      case "tahunan": d.setFullYear(d.getFullYear() + duration); break
    }
    return d.toISOString().split("T")[0]
  })()

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
          checkIn: moveInDate,
          checkOut: checkOutDate,
          status: "menunggu",
          monthlyRent: property.pricePerMonth,
          adminFee,
          totalPaid: grandTotal,
          rentalPeriod: rentalType,
          duration,
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
          amount: grandTotal,
          adminFee,
          netAmount: subtotal,
          status: "lunas",
          method,
          dueDate: moveInDate,
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
          message: `${state.currentUser.name} telah memesan kamar di ${property.name} (${rentalPeriodLabel(rentalType)} - ${duration} ${durationLabels[rentalType]}).`,
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
          message: `Pembayaran sebesar ${formatRupiah(grandTotal)} untuk ${property.name} telah berhasil. Menunggu konfirmasi pemilik.`,
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
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
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
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all",
                  i <= currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  i <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
                {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Dates + Rental Type */}
        {step === "dates" && (
          <div className="rounded-xl border border-border bg-card p-6">
            {/* Move-in date */}
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-card-foreground">Tanggal Masuk</h2>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Rental Type */}
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-card-foreground">Tipe Sewa</h2>
              <div className="grid grid-cols-3 gap-3">
                {property.rentalPeriods.map((rp) => (
                  <button
                    key={rp}
                    onClick={() => { setRentalType(rp); setDuration(durationOptions[rp][0]) }}
                    className={cn(
                      "rounded-lg border p-4 text-center transition-all",
                      rentalType === rp
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                        : "border-border text-foreground hover:border-primary/50"
                    )}
                  >
                    <Clock className="mx-auto mb-1 h-5 w-5" />
                    <div className="text-sm font-semibold">{rentalPeriodLabel(rp)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatRupiah(rp === "mingguan" ? (property.pricePerWeek ?? Math.round(property.pricePerMonth / 4)) : rp === "tahunan" ? (property.pricePerYear ?? property.pricePerMonth * 10) : property.pricePerMonth)}
                      /{rp === "mingguan" ? "minggu" : rp === "tahunan" ? "tahun" : "bulan"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-card-foreground">Durasi Sewa</h2>
              <div className="grid grid-cols-4 gap-3">
                {durationOptions[rentalType].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      "rounded-lg border p-4 text-center transition-all",
                      duration === d
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                        : "border-border text-foreground hover:border-primary/50"
                    )}
                  >
                    <div className="text-2xl font-bold">{d}</div>
                    <div className="text-xs text-muted-foreground">{durationLabels[rentalType]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing summary */}
            <div className="rounded-lg bg-secondary/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal masuk</span>
                <span className="text-foreground font-medium">{moveInDate}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Tanggal keluar</span>
                <span className="text-foreground font-medium">{checkOutDate}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Harga dasar ({rentalPeriodLabel(rentalType).toLowerCase()})</span>
                <span className="text-foreground">{formatRupiah(basePrice)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Durasi</span>
                <span className="text-foreground">{duration} {durationLabels[rentalType]}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatRupiah(subtotal)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Biaya admin ({ADMIN_FEE_PERCENTAGE}%)</span>
                <span className="text-foreground">{formatRupiah(adminFee)}</span>
              </div>
              <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
                <span className="text-foreground">Total Pembayaran</span>
                <span className="text-primary text-lg">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => setStep("review")}
              className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
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
                <span className="text-muted-foreground">Tipe sewa</span>
                <span className="text-foreground font-medium">{rentalPeriodLabel(rentalType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durasi</span>
                <span className="text-foreground">{duration} {durationLabels[rentalType]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal masuk</span>
                <span className="text-foreground">{moveInDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal keluar</span>
                <span className="text-foreground">{checkOutDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Harga dasar x {duration}</span>
                <span className="text-foreground">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya admin ({ADMIN_FEE_PERCENTAGE}%)</span>
                <span className="text-foreground">{formatRupiah(adminFee)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => setStep("payment")}
              className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
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
              Total pembayaran: <span className="font-bold text-primary">{formatRupiah(grandTotal)}</span>
            </p>

            <div className="flex flex-col gap-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPayment(pm.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
                    selectedPayment === pm.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
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
              className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              Bayar {formatRupiah(grandTotal)}
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
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 animate-in fade-in duration-500">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-card-foreground">Pembayaran Berhasil!</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
              Booking Anda untuk {property.name} ({rentalPeriodLabel(rentalType)} - {duration} {durationLabels[rentalType]}) sedang menunggu konfirmasi dari pemilik kos.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/dasbor/penghuni"
                className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
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
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 animate-in fade-in duration-500">
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
                className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
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
