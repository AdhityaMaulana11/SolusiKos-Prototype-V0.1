"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ListingCard, ListingCardSkeleton } from "@/components/shared/listing-card"
import { useApp } from "@/lib/app-context"
import { regions, formatRupiah, roomTypeLabel, rentalPeriodLabel, allFacilities } from "@/lib/mock-data"
import type { Region, RoomType, RentalPeriod } from "@/lib/types"
import { Search, SlidersHorizontal, X, MapPin, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const { state } = useApp()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const [selectedRegion, setSelectedRegion] = useState<Region | "">(
    (searchParams.get("region") as Region) ?? ""
  )
  const [selectedType, setSelectedType] = useState<RoomType | "">("")
  const [selectedPeriod, setSelectedPeriod] = useState<RentalPeriod | "">("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000000])
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "rating">("rating")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [query, selectedRegion, selectedType, selectedPeriod, priceRange, sortBy, selectedFacilities])

  const results = useMemo(() => {
    let filtered = [...state.properties]

    if (query) {
      const q = query.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.amenities.some((a) => a.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
      )
    }
    if (selectedRegion) {
      filtered = filtered.filter((p) => p.region === selectedRegion)
    }
    if (selectedType) {
      filtered = filtered.filter((p) => p.roomType === selectedType)
    }
    if (selectedPeriod) {
      filtered = filtered.filter((p) => p.rentalPeriods.includes(selectedPeriod))
    }
    filtered = filtered.filter(
      (p) => p.pricePerMonth >= priceRange[0] && p.pricePerMonth <= priceRange[1]
    )
    if (selectedFacilities.length > 0) {
      filtered = filtered.filter((p) =>
        selectedFacilities.every((f) => p.amenities.includes(f))
      )
    }

    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.pricePerMonth - b.pricePerMonth)
        break
      case "price_desc":
        filtered.sort((a, b) => b.pricePerMonth - a.pricePerMonth)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
    }

    return filtered
  }, [state.properties, query, selectedRegion, selectedType, selectedPeriod, priceRange, sortBy, selectedFacilities])

  function clearFilters() {
    setQuery("")
    setSelectedRegion("")
    setSelectedType("")
    setSelectedPeriod("")
    setPriceRange([0, 3000000])
    setSelectedFacilities([])
    setSortBy("rating")
  }

  function toggleFacility(f: string) {
    setSelectedFacilities((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    )
  }

  const hasActiveFilters = query || selectedRegion || selectedType || selectedPeriod || priceRange[0] > 0 || priceRange[1] < 3000000 || selectedFacilities.length > 0

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        {/* Search header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Cari Kos di Rebana Metropolitan</h1>
          <p className="mt-1 text-muted-foreground">
            {loading ? "Mencari..." : `${results.length} kos ditemukan`}
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama kos, alamat, fasilitas..."
              className="w-full bg-transparent py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                showFilters
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-foreground hover:bg-accent"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {[selectedRegion, selectedType, selectedPeriod, priceRange[0] > 0 || priceRange[1] < 3000000 ? "p" : "", ...selectedFacilities].filter(Boolean).length}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="rating">Rating Tertinggi</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6 animate-in slide-in-from-top-2 duration-200">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Region */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Wilayah Rebana</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as Region | "")}
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Semua Wilayah</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Room Type / Gender */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Tipe Kamar / Gender</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as RoomType | "")}
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Semua Tipe</option>
                  <option value="putra">Putra</option>
                  <option value="putri">Putri</option>
                  <option value="campur">Campur</option>
                </select>
              </div>

              {/* Rental Period */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Periode Sewa</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as RentalPeriod | "")}
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Semua Periode</option>
                  <option value="mingguan">Mingguan</option>
                  <option value="bulanan">Bulanan</option>
                  <option value="tahunan">Tahunan</option>
                </select>
              </div>

              {/* Price range */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Rentang Harga</label>
                <div className="flex items-center gap-2">
                  <select
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full rounded-lg border border-border bg-background px-2 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={0}>Min</option>
                    <option value={500000}>500rb</option>
                    <option value={1000000}>1jt</option>
                    <option value={1500000}>1,5jt</option>
                    <option value={2000000}>2jt</option>
                  </select>
                  <span className="text-muted-foreground">-</span>
                  <select
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full rounded-lg border border-border bg-background px-2 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={1000000}>1jt</option>
                    <option value={1500000}>1,5jt</option>
                    <option value={2000000}>2jt</option>
                    <option value={2500000}>2,5jt</option>
                    <option value={3000000}>3jt</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Facilities Checklist */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-foreground">Fasilitas</label>
              <div className="flex flex-wrap gap-2">
                {allFacilities.map((f) => {
                  const isActive = selectedFacilities.includes(f)
                  return (
                    <button
                      key={f}
                      onClick={() => toggleFacility(f)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      )}
                    >
                      {isActive && <Check className="h-3 w-3" />}
                      {f}
                    </button>
                  )
                })}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Hapus semua filter
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedRegion && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                <MapPin className="h-3 w-3" />
                {regions.find((r) => r.id === selectedRegion)?.name}
                <button onClick={() => setSelectedRegion("")}><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedType && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {roomTypeLabel(selectedType)}
                <button onClick={() => setSelectedType("")}><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedPeriod && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {rentalPeriodLabel(selectedPeriod)}
                <button onClick={() => setSelectedPeriod("")}><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedFacilities.map((f) => (
              <span key={f} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {f}
                <button onClick={() => toggleFacility(f)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Tidak ada kos ditemukan</h3>
            <p className="mt-1 text-sm text-muted-foreground">Coba ubah kata kunci atau filter pencarian Anda</p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
            >
              Hapus Filter
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <ListingCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
