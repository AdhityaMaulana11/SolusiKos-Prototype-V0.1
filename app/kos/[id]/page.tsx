"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ListingCard } from "@/components/shared/listing-card"
import { useApp } from "@/lib/app-context"
import { formatRupiah, getUser, roomTypeLabel, membershipLabel, ADMIN_FEE_PERCENTAGE } from "@/lib/mock-data"
import {
  MapPin, Star, Users, ArrowLeft, Check, Wifi, Wind, Bath,
  Car, Tv, UtensilsCrossed, Shield, Shirt, Phone, Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"

const amenityIconMap: Record<string, React.ElementType> = {
  WiFi: Wifi, AC: Wind, "Kamar Mandi Dalam": Bath, "Kamar Mandi Luar": Bath,
  "Parkir Motor": Car, "Parkir Mobil": Car, "TV Kabel": Tv, TV: Tv,
  Dapur: UtensilsCrossed, "Dapur Bersama": UtensilsCrossed, "Dapur Lengkap": UtensilsCrossed,
  CCTV: Shield, "Penjaga 24 Jam": Shield, Laundry: Shirt,
  "Kipas Angin": Wind, Taman: MapPin, "Ruang Tamu": Users,
  Rooftop: MapPin, "Kolam Renang": Users, Gym: Users,
  "Antar-Jemput Bandara": Car,
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { state } = useApp()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const property = state.properties.find((p) => p.id === id)
  const owner = property ? getUser(property.ownerId) : undefined
  const similarListings = state.properties
    .filter((p) => p.id !== id && p.region === property?.region)
    .slice(0, 3)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center py-20">
          <h2 className="text-xl font-bold text-foreground">Kos tidak ditemukan</h2>
          <p className="mt-2 text-muted-foreground">Properti yang Anda cari tidak tersedia.</p>
          <Link href="/cari" className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Kembali ke Pencarian
          </Link>
        </div>
      </div>
    )
  }

  const adminFee = Math.round(property.pricePerMonth * ADMIN_FEE_PERCENTAGE / 100)
  const totalFirst = property.pricePerMonth + adminFee

  const gradients: Record<string, string> = {
    "prop-1": "from-amber-400 to-orange-500",
    "prop-2": "from-pink-400 to-rose-500",
    "prop-3": "from-emerald-400 to-teal-500",
    "prop-4": "from-violet-400 to-purple-500",
    "prop-5": "from-sky-400 to-blue-500",
    "prop-6": "from-rose-400 to-pink-500",
    "prop-7": "from-orange-400 to-red-500",
    "prop-8": "from-teal-400 to-cyan-500",
    "prop-9": "from-indigo-400 to-blue-500",
    "prop-10": "from-yellow-400 to-amber-500",
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Image gallery */}
            {loading ? (
              <div className="h-72 animate-pulse rounded-xl bg-muted sm:h-96" />
            ) : (
              <div className="grid gap-2 sm:grid-cols-3">
                <div
                  className={cn(
                    "h-72 rounded-xl bg-gradient-to-br sm:col-span-2 sm:h-80",
                    gradients[property.id] ?? "from-amber-400 to-orange-500"
                  )}
                >
                  <div className="flex h-full items-center justify-center">
                    <div className="grid grid-cols-4 gap-3 p-12 opacity-20">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="h-6 w-6 rounded bg-white/40" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden flex-col gap-2 sm:flex">
                  <div className={cn(
                    "flex-1 rounded-xl bg-gradient-to-br opacity-80",
                    gradients[property.id] ?? "from-amber-400 to-orange-500"
                  )} />
                  <div className={cn(
                    "flex-1 rounded-xl bg-gradient-to-br opacity-60",
                    gradients[property.id] ?? "from-amber-400 to-orange-500"
                  )} />
                </div>
              </div>
            )}

            {/* Title + badges */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                {property.membershipTier !== "gratis" && (
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold text-white",
                    property.membershipTier === "emas" ? "bg-amber-500" : "bg-slate-400"
                  )}>
                    {membershipLabel(property.membershipTier)}
                  </span>
                )}
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {roomTypeLabel(property.roomType)}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{property.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {property.address}
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="text-muted-foreground">({property.reviewCount} ulasan)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="font-semibold text-foreground text-lg">Deskripsi</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="mt-6">
              <h2 className="font-semibold text-foreground text-lg">Fasilitas</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.amenities.map((a) => {
                  const Icon = amenityIconMap[a] ?? Check
                  return (
                    <div key={a} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm text-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      {a}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Room info */}
            <div className="mt-6">
              <h2 className="font-semibold text-foreground text-lg">Informasi Kamar</h2>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{property.totalRooms}</p>
                  <p className="text-sm text-muted-foreground">Total Kamar</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{property.availableRooms}</p>
                  <p className="text-sm text-muted-foreground">Kamar Tersedia</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{roomTypeLabel(property.roomType)}</p>
                  <p className="text-sm text-muted-foreground">Tipe</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4">
              {/* Price card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">{formatRupiah(property.pricePerMonth)}</span>
                  <span className="text-muted-foreground">/bulan</span>
                </div>
                <div className="mb-4 flex flex-col gap-2 rounded-lg bg-secondary/50 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sewa bulanan</span>
                    <span className="text-foreground">{formatRupiah(property.pricePerMonth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biaya admin ({ADMIN_FEE_PERCENTAGE}%)</span>
                    <span className="text-foreground">{formatRupiah(adminFee)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span className="text-foreground">Total pembayaran pertama</span>
                    <span className="text-primary">{formatRupiah(totalFirst)}</span>
                  </div>
                </div>
                {property.availableRooms > 0 ? (
                  <Link
                    href={`/booking/${property.id}`}
                    className="block w-full rounded-lg bg-primary py-3 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Pesan Sekarang
                  </Link>
                ) : (
                  <button disabled className="block w-full rounded-lg bg-muted py-3 text-center font-semibold text-muted-foreground cursor-not-allowed">
                    Kamar Penuh
                  </button>
                )}
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {property.availableRooms} kamar tersedia dari {property.totalRooms}
                </p>
              </div>

              {/* Owner card */}
              {owner && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-3 font-semibold text-card-foreground">Pemilik Kos</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {owner.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{owner.name}</p>
                      {owner.membershipTier && owner.membershipTier !== "gratis" && (
                        <span className={cn(
                          "text-xs font-semibold",
                          owner.membershipTier === "emas" ? "text-amber-500" : "text-slate-500"
                        )}>
                          Member {membershipLabel(owner.membershipTier)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" /> {owner.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" /> {owner.email}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar listings */}
        {similarListings.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-foreground">Kos Serupa di Wilayah Ini</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similarListings.map((p) => (
                <ListingCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Footer />
      </div>
    </div>
  )
}
