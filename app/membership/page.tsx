"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useApp } from "@/lib/app-context"
import { membershipPlans, formatRupiah, membershipLabel } from "@/lib/mock-data"
import { Check, Crown, Star, Zap, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { MembershipTier } from "@/lib/types"

export default function MembershipPage() {
  const { state, dispatch } = useApp()
  const currentTier = state.currentUser.membershipTier ?? "gratis"
  const [upgrading, setUpgrading] = useState<MembershipTier | null>(null)

  function handleUpgrade(tier: MembershipTier) {
    if (tier === currentTier) return
    setUpgrading(tier)
    setTimeout(() => {
      dispatch({ type: "UPGRADE_MEMBERSHIP", userId: state.currentUser.id, tier })
      dispatch({
        type: "ADD_NOTIFICATION",
        notification: {
          id: `n-${Date.now()}`,
          userId: state.currentUser.id,
          title: "Membership Diupgrade",
          message: `Selamat! Membership Anda telah diupgrade ke ${membershipLabel(tier)}.`,
          type: "membership",
          read: false,
          createdAt: new Date().toISOString().split("T")[0],
        },
      })
      toast.success(`Berhasil upgrade ke ${membershipLabel(tier)}!`)
      setUpgrading(null)
    }, 1500)
  }

  const tierIcons: Record<MembershipTier, React.ElementType> = {
    gratis: Zap,
    perak: Star,
    emas: Crown,
  }

  const tierOrder: MembershipTier[] = ["gratis", "perak", "emas"]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/5 to-background py-16 text-center">
          <h1 className="text-4xl font-bold text-foreground text-balance">Pilih Paket Membership</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground text-pretty">
            Tingkatkan visibilitas properti Anda dan dapatkan fitur premium untuk mengelola kos dengan lebih mudah.
          </p>
          {state.currentUser.role === "pemilik" && (
            <p className="mt-4 text-sm text-muted-foreground">
              Paket saat ini:{" "}
              <span className="font-semibold text-primary">{membershipLabel(currentTier)}</span>
            </p>
          )}
        </div>

        {/* Pricing cards */}
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:grid-cols-3">
          {membershipPlans.map((plan) => {
            const Icon = tierIcons[plan.tier]
            const isCurrent = currentTier === plan.tier && state.currentUser.role === "pemilik"
            const isUpgrade = state.currentUser.role === "pemilik" && tierOrder.indexOf(plan.tier) > tierOrder.indexOf(currentTier)
            const isDowngrade = state.currentUser.role === "pemilik" && tierOrder.indexOf(plan.tier) < tierOrder.indexOf(currentTier)

            return (
              <div
                key={plan.tier}
                className={cn(
                  "relative flex flex-col rounded-2xl border-2 bg-card p-6 transition-all",
                  plan.highlighted
                    ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                    : "border-border"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    Populer
                  </div>
                )}

                <div className="mb-4 flex items-center gap-2">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    plan.tier === "emas" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      : plan.tier === "perak" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-card-foreground">{plan.name}</h2>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-card-foreground">
                    {plan.price === 0 ? "Gratis" : formatRupiah(plan.price)}
                  </span>
                  {plan.price > 0 && <span className="text-sm text-muted-foreground">/bulan</span>}
                </div>

                <ul className="mb-8 flex flex-1 flex-col gap-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-card-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {state.currentUser.role === "pemilik" ? (
                  <button
                    onClick={() => handleUpgrade(plan.tier)}
                    disabled={isCurrent || isDowngrade || upgrading === plan.tier}
                    className={cn(
                      "w-full rounded-xl py-3 text-sm font-semibold transition-colors",
                      isCurrent
                        ? "cursor-default border-2 border-primary bg-primary/10 text-primary"
                        : isDowngrade
                        ? "cursor-not-allowed border border-border bg-secondary text-muted-foreground opacity-50"
                        : plan.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border bg-card text-card-foreground hover:bg-accent"
                    )}
                  >
                    {upgrading === plan.tier ? (
                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                    ) : isCurrent ? (
                      "Paket Saat Ini"
                    ) : isUpgrade ? (
                      "Upgrade"
                    ) : (
                      "Tidak Tersedia"
                    )}
                  </button>
                ) : (
                  <div className="rounded-xl border border-border bg-secondary/50 py-3 text-center text-sm text-muted-foreground">
                    Untuk pemilik kos
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-2xl px-4 pb-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-foreground">Pertanyaan Umum</h2>
          <div className="flex flex-col gap-4">
            {[
              {
                q: "Apakah bisa downgrade membership?",
                a: "Saat ini downgrade hanya bisa dilakukan pada akhir periode berlangganan. Hubungi admin untuk bantuan.",
              },
              {
                q: "Metode pembayaran apa yang tersedia?",
                a: "Kami menerima transfer bank (BCA, Mandiri, BRI), e-wallet (GoPay, OVO, DANA), dan kartu kredit/debit.",
              },
              {
                q: "Apakah ada periode trial untuk paket Emas?",
                a: "Ya! Pemilik kos baru mendapatkan trial 14 hari gratis untuk paket Emas.",
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-card-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
