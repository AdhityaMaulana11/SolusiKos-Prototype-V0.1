import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  ListingCard,
  ListingCardSkeleton,
} from "@/components/shared/listing-card";
import { useApp } from "@/lib/app-context";
import { regions, formatRupiah, roomTypeLabel } from "@/lib/mock-data";
import type { Region, RoomType } from "@/lib/types";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";

export default function SearchPageContent() {
  const { state } = useApp();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [selectedRegion, setSelectedRegion] = useState<Region | "">(
    (searchParams.get("region") as Region) ?? "",
  );
  const [selectedType, setSelectedType] = useState<RoomType | "">("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000000]);
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "rating">(
    "rating",
  );
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [query, selectedRegion, selectedType, priceRange, sortBy]);

  const results = useMemo(() => {
    let filtered = [...state.properties];

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.amenities.some((a) => a.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (selectedRegion) {
      filtered = filtered.filter((p) => p.region === selectedRegion);
    }
    if (selectedType) {
      filtered = filtered.filter((p) => p.roomType === selectedType);
    }
    filtered = filtered.filter(
      (p) =>
        p.pricePerMonth >= priceRange[0] && p.pricePerMonth <= priceRange[1],
    );

    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.pricePerMonth - b.pricePerMonth);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.pricePerMonth - a.pricePerMonth);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [
    state.properties,
    query,
    selectedRegion,
    selectedType,
    priceRange,
    sortBy,
  ]);

  function clearFilters() {
    setQuery("");
    setSelectedRegion("");
    setSelectedType("");
    setPriceRange([0, 3000000]);
    setSortBy("rating");
  }

  const hasActiveFilters =
    query ||
    selectedRegion ||
    selectedType ||
    priceRange[0] > 0 ||
    priceRange[1] < 3000000;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        {/* Search header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Cari Kos</h1>
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
              <button
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
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
          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Wilayah
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) =>
                    setSelectedRegion(e.target.value as Region | "")
                  }
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Semua Wilayah</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Tipe Kamar
                </label>
                <select
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value as RoomType | "")
                  }
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Semua Tipe</option>
                  <option value="putra">Putra</option>
                  <option value="putri">Putri</option>
                  <option value="campur">Campur</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Harga Minimum
                </label>
                <select
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={0}>Rp 0</option>
                  <option value={500000}>Rp 500.000</option>
                  <option value={1000000}>Rp 1.000.000</option>
                  <option value={1500000}>Rp 1.500.000</option>
                  <option value={2000000}>Rp 2.000.000</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Harga Maksimum
                </label>
                <select
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={1000000}>Rp 1.000.000</option>
                  <option value={1500000}>Rp 1.500.000</option>
                  <option value={2000000}>Rp 2.000.000</option>
                  <option value={2500000}>Rp 2.500.000</option>
                  <option value={3000000}>Rp 3.000.000</option>
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-primary hover:underline"
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
                {regions.find((r) => r.id === selectedRegion)?.name}
                <button onClick={() => setSelectedRegion("")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedType && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {roomTypeLabel(selectedType)}
                <button onClick={() => setSelectedType("")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
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
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Tidak ada kos ditemukan
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Coba ubah kata kunci atau filter pencarian Anda
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
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
  );
}
