"use client"

import Link from "next/link"
import { MapPin, Star, Users, Wifi, Wind, Bath, Calendar } from "lucide-react"
import type { Property } from "@/lib/types"
import { formatRupiah, roomTypeLabel, regionLabel, rentalPeriodLabel, getUser } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function ListingCard({ property }: { property: Property }) {
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
    "prop-11": "from-cyan-400 to-blue-500",
  }

  return (
    <Link
      href={`/kos/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
    >
      {/* Image placeholder */}
      <div className={cn(
        "relative h-48 bg-gradient-to-br transition-transform",
        gradients[property.id] ?? "from-amber-400 to-orange-500"
      )}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="grid grid-cols-3 gap-2 p-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-6 w-6 rounded bg-white/30" />
            ))}
          </div>
        </div>
        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {property.membershipTier !== "gratis" && (
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold text-white",
              property.membershipTier === "emas" ? "bg-amber-500" : "bg-slate-400"
            )}>
              {property.membershipTier === "emas" ? "Emas" : "Perak"}
            </span>
          )}
          {property.featured && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
              Unggulan
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white">
            {roomTypeLabel(property.roomType)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
          {property.name}
        </h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{property.address}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="font-medium">{property.rating}</span>
          </div>
          <span className="text-muted-foreground">({property.reviewCount} ulasan)</span>
        </div>

        {/* Amenities preview */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {property.amenities.slice(0, 3).map((a) => (
            <span key={a} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {a}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              +{property.amenities.length - 3}
            </span>
          )}
        </div>

        {/* Rental periods */}
        <div className="flex items-center gap-1.5 mt-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <div className="flex gap-1">
            {property.rentalPeriods.map((rp) => (
              <span key={rp} className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                {rentalPeriodLabel(rp)}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between pt-3 border-t border-border">
          <div>
            <span className="text-lg font-bold text-primary">{formatRupiah(property.pricePerMonth)}</span>
            <span className="text-sm text-muted-foreground">/bulan</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{property.availableRooms} tersedia</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="flex gap-1.5">
          <div className="h-5 w-12 rounded bg-muted" />
          <div className="h-5 w-12 rounded bg-muted" />
          <div className="h-5 w-12 rounded bg-muted" />
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-3">
          <div className="h-6 w-28 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
