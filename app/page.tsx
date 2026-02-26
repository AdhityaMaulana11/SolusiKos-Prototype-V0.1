"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ListingCard, ListingCardSkeleton } from "@/components/shared/listing-card"
import { useApp } from "@/lib/app-context"
import { regions } from "@/lib/mock-data"
import { Search, ArrowRight, MapPin, Shield, Headphones, CalendarSearch, MessageSquare } from "lucide-react"

export default function HomePage() {
  const { state } = useApp()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const featuredListings = state.properties.filter((p) => p.featured).slice(0, 6)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/cari?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/30 to-secondary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-primary/60 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Rebana Metropolitan
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
              Cari <span className="text-primary">Kos Impianmu</span> di Rebana Metropolitan
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed text-pretty">
              Platform pencarian dan pengelolaan kos terpercaya di kawasan Rebana Metropolitan (Kota Cirebon, Kab. Cirebon, Kuningan, Majalengka, Indramayu). Temukan tempat tinggal nyaman dan terjangkau.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mt-8 flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-lg transition-shadow hover:shadow-xl">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama kos, alamat, atau fasilitas..."
                  className="w-full bg-transparent py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
              >
                Cari
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Populer:</span>
              {["WiFi", "AC", "Putri", "Murah", "Bulanan"].map((tag) => (
                <Link
                  key={tag}
                  href={`/cari?q=${tag}`}
                  className="rounded-full border border-border bg-card px-3 py-1 transition-all hover:border-primary hover:text-primary hover:shadow-sm"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Region Cards */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl text-balance">Jelajahi Rebana Metropolitan</h2>
          <p className="mt-2 text-muted-foreground">Temukan kos terbaik di lima wilayah utama kawasan Rebana Metropolitan</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {regions.map((region) => (
            <Link
              key={region.id}
              href={`/cari?region=${region.id}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
            >
              <div className={`h-32 bg-gradient-to-br ${region.gradient} transition-transform group-hover:scale-105`}>
                <div className="flex h-full items-center justify-center">
                  <MapPin className="h-10 w-10 text-white/40" />
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-card-foreground">{region.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{region.description}</p>
                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                  {region.propertyCount} properti
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Kos Unggulan</h2>
              <p className="mt-2 text-muted-foreground">Pilihan kos terbaik dengan rating tertinggi</p>
            </div>
            <Link
              href="/cari"
              className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
            >
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
              : featuredListings.map((p) => <ListingCard key={p.id} property={p} />)
            }
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/cari"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Lihat semua kos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Cara Kerja SolusiKos</h2>
          <p className="mt-2 text-muted-foreground">Lima langkah mudah untuk menemukan kos impianmu</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              icon: Search,
              title: "Cari & Filter",
              desc: "Cari kos berdasarkan wilayah Rebana Metropolitan, harga, tipe, dan fasilitas.",
            },
            {
              icon: CalendarSearch,
              title: "Survey Lokasi",
              desc: "Jadwalkan kunjungan survey langsung ke kos yang kamu minati.",
            },
            {
              icon: MessageSquare,
              title: "Tanya Pemilik",
              desc: "Tanyakan langsung ke pemilik kos melalui fitur Q&A yang tersedia.",
            },
            {
              icon: Shield,
              title: "Booking Aman",
              desc: "Pesan kos secara online dengan sistem pembayaran yang aman dan transparan.",
            },
            {
              icon: Headphones,
              title: "Layanan Lengkap",
              desc: "Nikmati layanan laundry, kebersihan, dan perbaikan dari dashboard.",
            },
          ].map((step, i) => (
            <div key={i} className="group flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="mb-1 text-xs font-bold text-primary uppercase tracking-wider">
                Langkah {i + 1}
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl text-balance">
            Punya Kos di Rebana Metropolitan? Daftarkan Sekarang!
          </h2>
          <p className="mt-3 text-primary-foreground/80 max-w-md mx-auto">
            Tingkatkan hunian kos Anda dengan bergabung di SolusiKos. Kelola properti, terima pembayaran, dan lacak penghuni dengan mudah.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/daftar"
              className="rounded-lg bg-card px-6 py-3 font-semibold text-foreground transition-all hover:bg-card/90 active:scale-95"
            >
              Daftar sebagai Pemilik
            </Link>
            <Link
              href="/membership"
              className="rounded-lg border border-primary-foreground/30 px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/10 active:scale-95"
            >
              Lihat Paket Membership
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
