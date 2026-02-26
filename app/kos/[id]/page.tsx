"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ListingCard } from "@/components/shared/listing-card"
import { useApp, usePropertyQA } from "@/lib/app-context"
import { formatRupiah, getUser, roomTypeLabel, membershipLabel, rentalPeriodLabel, ADMIN_FEE_PERCENTAGE } from "@/lib/mock-data"
import {
  MapPin, Star, Users, ArrowLeft, Check, Wifi, Wind, Bath,
  Car, Tv, UtensilsCrossed, Shield, Shirt, Phone, Mail,
  CalendarSearch, Send, MessageSquare, ChevronDown, ChevronUp, Clock, Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
  const { state, dispatch } = useApp()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState("")
  const [expandedQA, setExpandedQA] = useState<string | null>(null)
  const [surveyDate, setSurveyDate] = useState("")
  const [surveyTime, setSurveyTime] = useState("10:00")
  const [surveyNotes, setSurveyNotes] = useState("")
  const [surveySubmitted, setSurveySubmitted] = useState(false)

  const property = state.properties.find((p) => p.id === id)
  const owner = property ? getUser(property.ownerId) : undefined
  const qaThreads = usePropertyQA(id)
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
    "prop-11": "from-cyan-400 to-blue-500",
  }

  function handleSubmitQuestion() {
    if (!question.trim()) {
      toast.error("Masukkan pertanyaan Anda")
      return
    }
    dispatch({
      type: "ADD_QA_THREAD",
      thread: {
        id: `qa-${Date.now()}`,
        propertyId: property.id,
        tenantId: state.currentUser.id,
        question: question.trim(),
        createdAt: new Date().toISOString().split("T")[0],
      },
    })
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: `n-${Date.now()}`,
        userId: property.ownerId,
        title: "Pertanyaan Baru",
        message: `${state.currentUser.name} bertanya tentang ${property.name}: "${question.trim().substring(0, 60)}..."`,
        type: "qna",
        read: false,
        createdAt: new Date().toISOString().split("T")[0],
      },
    })
    setQuestion("")
    toast.success("Pertanyaan terkirim!")

    // Simulate owner answer after delay
    setTimeout(() => {
      dispatch({
        type: "ANSWER_QA_THREAD",
        threadId: `qa-${Date.now() - 1000}`,
        answer: "Terima kasih atas pertanyaan Anda. Kami akan segera menjawab pertanyaan ini.",
      })
    }, 3000)
  }

  function handleSubmitSurvey() {
    if (!surveyDate) {
      toast.error("Pilih tanggal survey")
      return
    }
    dispatch({
      type: "CREATE_SURVEY_VISIT",
      survey: {
        id: `sv-${Date.now()}`,
        propertyId: property.id,
        tenantId: state.currentUser.id,
        ownerId: property.ownerId,
        date: surveyDate,
        time: surveyTime,
        status: "menunggu",
        notes: surveyNotes || undefined,
        createdAt: new Date().toISOString().split("T")[0],
      },
    })
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: `n-${Date.now()}`,
        userId: property.ownerId,
        title: "Permintaan Survey Baru",
        message: `${state.currentUser.name} ingin survey ${property.name} pada ${surveyDate} pukul ${surveyTime}.`,
        type: "survey",
        read: false,
        createdAt: new Date().toISOString().split("T")[0],
      },
    })
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: `n-${Date.now() + 1}`,
        userId: state.currentUser.id,
        title: "Survey Dijadwalkan",
        message: `Permintaan survey untuk ${property.name} telah dikirim. Menunggu konfirmasi pemilik.`,
        type: "survey",
        read: false,
        createdAt: new Date().toISOString().split("T")[0],
      },
    })
    setSurveySubmitted(true)
    toast.success("Permintaan survey berhasil dikirim!")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
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
                {property.rentalPeriods.map((rp) => (
                  <span key={rp} className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                    {rentalPeriodLabel(rp)}
                  </span>
                ))}
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
                    <div key={a} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm text-foreground transition-colors hover:border-primary/30">
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
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{property.totalRooms}</p>
                  <p className="text-sm text-muted-foreground">Total Kamar</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{property.availableRooms}</p>
                  <p className="text-sm text-muted-foreground">Tersedia</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{roomTypeLabel(property.roomType)}</p>
                  <p className="text-sm text-muted-foreground">Tipe</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{property.rentalPeriods.length}</p>
                  <p className="text-sm text-muted-foreground">Opsi Sewa</p>
                </div>
              </div>
            </div>

            {/* Pricing Table */}
            <div className="mt-6">
              <h2 className="font-semibold text-foreground text-lg">Harga Sewa</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {property.rentalPeriods.map((rp) => {
                  const price = rp === "mingguan"
                    ? (property.pricePerWeek ?? Math.round(property.pricePerMonth / 4))
                    : rp === "tahunan"
                      ? (property.pricePerYear ?? property.pricePerMonth * 10)
                      : property.pricePerMonth
                  return (
                    <div key={rp} className="rounded-lg border border-border p-4 text-center transition-colors hover:border-primary/30">
                      <Calendar className="mx-auto mb-2 h-5 w-5 text-primary" />
                      <p className="text-sm font-medium text-muted-foreground">{rentalPeriodLabel(rp)}</p>
                      <p className="mt-1 text-xl font-bold text-primary">{formatRupiah(price)}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Q&A Section */}
            <div className="mt-8">
              <h2 className="flex items-center gap-2 font-semibold text-foreground text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Tanya Pemilik
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Ajukan pertanyaan langsung kepada pemilik kos</p>

              {/* Ask form */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Tulis pertanyaan Anda..."
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitQuestion()}
                />
                <button
                  onClick={handleSubmitQuestion}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Q&A Threads */}
              <div className="mt-4 flex flex-col gap-3">
                {qaThreads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Belum ada pertanyaan. Jadi yang pertama bertanya!</p>
                ) : (
                  qaThreads.map((thread) => {
                    const asker = getUser(thread.tenantId)
                    const isExpanded = expandedQA === thread.id
                    return (
                      <div key={thread.id} className="rounded-lg border border-border bg-card overflow-hidden transition-all">
                        <button
                          onClick={() => setExpandedQA(isExpanded ? null : thread.id)}
                          className="flex w-full items-start gap-3 p-4 text-left hover:bg-accent/30 transition-colors"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {asker?.avatar ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-card-foreground">{asker?.name ?? "Pengguna"}</span>
                              <span className="text-xs text-muted-foreground">{thread.createdAt}</span>
                            </div>
                            <p className="mt-0.5 text-sm text-foreground line-clamp-2">{thread.question}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {thread.answer && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Dijawab
                              </span>
                            )}
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </button>
                        {isExpanded && thread.answer && (
                          <div className="border-t border-border bg-secondary/30 p-4 animate-in slide-in-from-top-1 duration-200">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-600">
                                {owner?.avatar ?? "PK"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-card-foreground">{owner?.name ?? "Pemilik"}</span>
                                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pemilik</span>
                                  <span className="text-xs text-muted-foreground">{thread.answeredAt}</span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{thread.answer}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {isExpanded && !thread.answer && (
                          <div className="border-t border-border bg-secondary/30 p-4 animate-in slide-in-from-top-1 duration-200">
                            <p className="text-sm text-muted-foreground italic">Menunggu jawaban dari pemilik...</p>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
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
                    className="block w-full rounded-lg bg-primary py-3 text-center font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
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

              {/* Survey visit card */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-card-foreground">
                  <CalendarSearch className="h-5 w-5 text-primary" />
                  Jadwalkan Survey
                </h3>
                {surveySubmitted ? (
                  <div className="flex flex-col items-center text-center py-4 animate-in fade-in duration-300">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-card-foreground">Survey Dijadwalkan!</p>
                    <p className="mt-1 text-xs text-muted-foreground">Menunggu konfirmasi pemilik. Anda akan mendapat notifikasi.</p>
                    <button
                      onClick={() => setSurveySubmitted(false)}
                      className="mt-3 text-xs text-primary hover:underline"
                    >
                      Jadwalkan lagi
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Tanggal</label>
                      <input
                        type="date"
                        value={surveyDate}
                        onChange={(e) => setSurveyDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Waktu</label>
                      <select
                        value={surveyTime}
                        onChange={(e) => setSurveyTime(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"].map((t) => (
                          <option key={t} value={t}>{t} WIB</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Catatan (opsional)</label>
                      <textarea
                        value={surveyNotes}
                        onChange={(e) => setSurveyNotes(e.target.value)}
                        placeholder="Misal: ingin melihat kamar lantai 2"
                        rows={2}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <button
                      onClick={handleSubmitSurvey}
                      className="w-full rounded-lg border border-primary bg-primary/5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
                    >
                      Kirim Permintaan Survey
                    </button>
                  </div>
                )}
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
