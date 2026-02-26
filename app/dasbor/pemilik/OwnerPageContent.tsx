import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  useApp,
  useOwnerProperties,
  useOwnerPayments,
  useOwnerSurveys,
  useNotifications,
  ADMIN_FEE_PERCENTAGE,
} from "@/lib/app-context";
import {
  formatRupiah,
  getUser,
  getProperty,
  membershipLabel,
} from "@/lib/mock-data";
import {
  Building2,
  Users,
  BarChart3,
  CheckCircle,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  Loader2,
  Eye,
  Star,
  CalendarSearch,
  MapPin,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function OwnerPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "ringkasan";
  const { state, dispatch } = useApp();
  const properties = useOwnerProperties();
  const payments = useOwnerPayments();
  const ownerSurveys = useOwnerSurveys();
  const notifications = useNotifications();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [surveyProcessingId, setSurveyProcessingId] = useState<string | null>(
    null,
  );

  const totalRooms = properties.reduce((sum, p) => sum + p.totalRooms, 0);
  const occupiedRooms = properties.reduce(
    (sum, p) => sum + (p.totalRooms - p.availableRooms),
    0,
  );
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const totalRevenue = payments
    .filter((p) => p.status === "lunas")
    .reduce((sum, p) => sum + p.netAmount, 0);
  const pendingPayments = payments.filter(
    (p) => p.status === "belum_bayar" || p.status === "menunggu",
  );
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const ownerBookings = state.bookings.filter((b) => {
    const prop = state.properties.find((p) => p.id === b.propertyId);
    return prop?.ownerId === state.currentUser.id;
  });
  const pendingBookings = ownerBookings.filter((b) => b.status === "menunggu");

  // Chart data
  const monthlyRevenue = [
    { bulan: "Jan", pendapatan: 0, biaya_admin: 0 },
    { bulan: "Feb", pendapatan: 1500000, biaya_admin: 75000 },
    { bulan: "Mar", pendapatan: 2800000, biaya_admin: 140000 },
    { bulan: "Apr", pendapatan: 0, biaya_admin: 0 },
    { bulan: "Mei", pendapatan: 0, biaya_admin: 0 },
    { bulan: "Jun", pendapatan: 0, biaya_admin: 0 },
  ];

  const propertyOccupancy = properties.map((p) => ({
    name: p.name.replace("Kos ", ""),
    terisi: p.totalRooms - p.availableRooms,
    kosong: p.availableRooms,
  }));

  const revenueByProperty = properties
    .map((p) => {
      const propPayments = payments.filter((pay) => {
        const booking = state.bookings.find((b) => b.id === pay.bookingId);
        return booking?.propertyId === p.id && pay.status === "lunas";
      });
      return {
        name: p.name.replace("Kos ", ""),
        value: propPayments.reduce((sum, pay) => sum + pay.netAmount, 0),
      };
    })
    .filter((d) => d.value > 0);

  const COLORS = [
    "oklch(0.7 0.16 55)",
    "oklch(0.65 0.12 75)",
    "oklch(0.6 0.1 160)",
    "oklch(0.75 0.14 85)",
    "oklch(0.55 0.08 40)",
  ];

  function handleApproveBooking(bookingId: string) {
    setApprovingId(bookingId);
    setTimeout(() => {
      dispatch({ type: "UPDATE_BOOKING_STATUS", bookingId, status: "aktif" });
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (booking) {
        dispatch({
          type: "ADD_NOTIFICATION",
          notification: {
            id: `n-${Date.now()}`,
            userId: booking.tenantId,
            title: "Booking Disetujui",
            message: `Booking Anda telah disetujui oleh pemilik kos.`,
            type: "booking",
            read: false,
            createdAt: new Date().toISOString().split("T")[0],
          },
        });
      }
      toast.success("Booking berhasil disetujui!");
      setApprovingId(null);
    }, 1200);
  }

  function handleRejectBooking(bookingId: string) {
    dispatch({
      type: "UPDATE_BOOKING_STATUS",
      bookingId,
      status: "dibatalkan",
    });
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (booking) {
      dispatch({
        type: "ADD_NOTIFICATION",
        notification: {
          id: `n-${Date.now()}`,
          userId: booking.tenantId,
          title: "Booking Ditolak",
          message: `Maaf, booking Anda telah ditolak oleh pemilik kos.`,
          type: "booking",
          read: false,
          createdAt: new Date().toISOString().split("T")[0],
        },
      });
    }
    toast.info("Booking ditolak");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <DashboardShell>
        {/* Ringkasan */}
        {(tab === "ringkasan" ||
          ![
            "properti",
            "penghuni",
            "keuangan",
            "persetujuan",
            "survey",
          ].includes(tab)) && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dasbor Pemilik
              </h1>
              <p className="text-muted-foreground">
                Membership:{" "}
                <span className="font-semibold text-primary">
                  {membershipLabel(
                    state.currentUser.membershipTier ?? "gratis",
                  )}
                </span>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Total Properti",
                  value: properties.length,
                  icon: Building2,
                  color: "text-primary",
                },
                {
                  label: "Tingkat Hunian",
                  value: `${occupancyRate}%`,
                  icon: Users,
                  color: "text-emerald-500",
                },
                {
                  label: "Pendapatan Bersih",
                  value: formatRupiah(totalRevenue),
                  icon: TrendingUp,
                  color: "text-sky-500",
                  small: true,
                },
                {
                  label: "Menunggu Persetujuan",
                  value: pendingBookings.length,
                  icon: Clock,
                  color: "text-amber-500",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <p
                    className={cn(
                      "mt-2 font-bold text-card-foreground",
                      stat.small ? "text-xl" : "text-3xl",
                    )}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-card-foreground">
                Arus Kas Bulanan
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="bulan"
                      className="text-xs"
                      tick={{ fill: "oklch(0.5 0.02 55)" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "oklch(0.5 0.02 55)" }}
                      tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatRupiah(value),
                        name === "pendapatan" ? "Pendapatan" : "Biaya Admin",
                      ]}
                      contentStyle={{
                        backgroundColor: "oklch(0.995 0.001 75)",
                        border: "1px solid oklch(0.9 0.02 75)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="pendapatan"
                      fill="oklch(0.7 0.16 55)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="biaya_admin"
                      fill="oklch(0.88 0.06 75)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pending approval summary */}
            {pendingBookings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/30 dark:bg-amber-900/10">
                <h2 className="mb-2 flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
                  <AlertCircle className="h-5 w-5" /> {pendingBookings.length}{" "}
                  Booking Menunggu Persetujuan
                </h2>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Silakan buka tab Persetujuan untuk mereview.
                </p>
              </div>
            )}

            {/* Pending survey summary */}
            {ownerSurveys.filter((s) => s.status === "menunggu").length > 0 && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-6 dark:border-sky-900/30 dark:bg-sky-900/10">
                <h2 className="mb-2 flex items-center gap-2 font-semibold text-sky-800 dark:text-sky-300">
                  <CalendarSearch className="h-5 w-5" />{" "}
                  {ownerSurveys.filter((s) => s.status === "menunggu").length}{" "}
                  Permintaan Survey Menunggu
                </h2>
                <p className="text-sm text-sky-700 dark:text-sky-400">
                  Silakan buka tab Survey untuk mengkonfirmasi jadwal kunjungan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Properti */}
        {tab === "properti" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-foreground">
              Properti Saya
            </h1>
            <div className="grid gap-4 sm:grid-cols-2">
              {properties.map((prop) => {
                const occ = prop.totalRooms - prop.availableRooms;
                const occPct = Math.round((occ / prop.totalRooms) * 100);
                return (
                  <div
                    key={prop.id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground">
                          {prop.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {prop.address}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          prop.membershipTier === "emas"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : prop.membershipTier === "perak"
                              ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        {membershipLabel(prop.membershipTier)}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Kamar</p>
                        <p className="text-lg font-bold text-card-foreground">
                          {occ}/{prop.totalRooms}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Hunian</p>
                        <p className="text-lg font-bold text-card-foreground">
                          {occPct}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Harga</p>
                        <p className="text-lg font-bold text-primary">
                          {formatRupiah(prop.pricePerMonth)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          occPct >= 80
                            ? "bg-emerald-500"
                            : occPct >= 50
                              ? "bg-amber-500"
                              : "bg-red-500",
                        )}
                        style={{ width: `${occPct}%` }}
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-card-foreground">
                        {prop.rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({prop.reviewCount} ulasan)
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {prop.amenities.slice(0, 4).map((a) => (
                        <span
                          key={a}
                          className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                        >
                          {a}
                        </span>
                      ))}
                      {prop.amenities.length > 4 && (
                        <span className="text-xs text-muted-foreground">
                          +{prop.amenities.length - 4} lagi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Penghuni */}
        {tab === "penghuni" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-foreground">
              Daftar Penghuni
            </h1>
            {ownerBookings.filter((b) => b.status === "aktif").length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-border bg-card py-16">
                <Users className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-muted-foreground">
                  Belum ada penghuni aktif
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Penghuni
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Properti
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Check-in
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Check-out
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Sewa/bulan
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerBookings
                      .filter((b) => b.status === "aktif")
                      .map((b) => {
                        const tenant = getUser(b.tenantId);
                        const prop = state.properties.find(
                          (p) => p.id === b.propertyId,
                        );
                        return (
                          <tr
                            key={b.id}
                            className="border-b border-border last:border-0"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  {tenant?.avatar}
                                </div>
                                <div>
                                  <p className="font-medium text-card-foreground">
                                    {tenant?.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {tenant?.phone}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-card-foreground">
                              {prop?.name}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {b.checkIn}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {b.checkOut}
                            </td>
                            <td className="px-4 py-3 font-medium text-primary">
                              {formatRupiah(b.monthlyRent)}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={b.status} />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Keuangan */}
        {tab === "keuangan" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-foreground">Arus Kas</h1>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Total Pendapatan
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(totalRevenue)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Menunggu Pembayaran
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatRupiah(pendingAmount)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Biaya Admin ({ADMIN_FEE_PERCENTAGE}%)
                </p>
                <p className="mt-1 text-2xl font-bold text-muted-foreground">
                  {formatRupiah(
                    payments
                      .filter((p) => p.status === "lunas")
                      .reduce((sum, p) => sum + p.adminFee, 0),
                  )}
                </p>
              </div>
            </div>

            {/* Revenue chart */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-card-foreground">
                Pendapatan Bulanan
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="bulan"
                      tick={{ fill: "oklch(0.5 0.02 55)" }}
                    />
                    <YAxis
                      tick={{ fill: "oklch(0.5 0.02 55)" }}
                      tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatRupiah(value),
                        name === "pendapatan"
                          ? "Pendapatan Bersih"
                          : "Biaya Admin",
                      ]}
                      contentStyle={{
                        backgroundColor: "oklch(0.995 0.001 75)",
                        border: "1px solid oklch(0.9 0.02 75)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend
                      formatter={(value) =>
                        value === "pendapatan" ? "Pendapatan" : "Biaya Admin"
                      }
                    />
                    <Bar
                      dataKey="pendapatan"
                      fill="oklch(0.7 0.16 55)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="biaya_admin"
                      fill="oklch(0.88 0.06 75)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue by property pie chart */}
            {revenueByProperty.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 font-semibold text-card-foreground">
                    Pendapatan per Properti
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueByProperty}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {revenueByProperty.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatRupiah(value)}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 font-semibold text-card-foreground">
                    Tingkat Hunian per Properti
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={propertyOccupancy} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-border"
                        />
                        <XAxis
                          type="number"
                          tick={{ fill: "oklch(0.5 0.02 55)" }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={80}
                          tick={{ fill: "oklch(0.5 0.02 55)", fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="terisi"
                          stackId="a"
                          fill="oklch(0.7 0.16 55)"
                        />
                        <Bar
                          dataKey="kosong"
                          stackId="a"
                          fill="oklch(0.9 0.02 75)"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Payment history table */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-card-foreground">
                Riwayat Pembayaran Masuk
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Penghuni
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Jumlah
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Admin Fee
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Bersih
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Metode
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const tenant = getUser(p.tenantId);
                      return (
                        <tr
                          key={p.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-4 py-3 text-card-foreground">
                            {tenant?.name}
                          </td>
                          <td className="px-4 py-3 text-card-foreground">
                            {formatRupiah(p.amount)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatRupiah(p.adminFee)}
                          </td>
                          <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(p.netAmount)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {p.method || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={p.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Persetujuan */}
        {tab === "persetujuan" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-foreground">
              Persetujuan Booking
            </h1>
            {pendingBookings.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-border bg-card py-16">
                <CheckCircle className="h-12 w-12 text-emerald-500/30" />
                <p className="mt-3 text-muted-foreground">
                  Tidak ada booking yang menunggu persetujuan
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {pendingBookings.map((b) => {
                  const tenant = getUser(b.tenantId);
                  const prop = state.properties.find(
                    (p) => p.id === b.propertyId,
                  );
                  return (
                    <div
                      key={b.id}
                      className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/30 dark:bg-amber-900/10"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                              {tenant?.avatar}
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {tenant?.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {tenant?.email} | {tenant?.phone}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 rounded-lg border border-border bg-card p-3">
                            <p className="text-sm font-medium text-card-foreground">
                              {prop?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {prop?.address}
                            </p>
                            <div className="mt-2 flex gap-4 text-xs">
                              <span className="text-muted-foreground">
                                Check-in:{" "}
                                <strong className="text-card-foreground">
                                  {b.checkIn}
                                </strong>
                              </span>
                              <span className="text-muted-foreground">
                                Check-out:{" "}
                                <strong className="text-card-foreground">
                                  {b.checkOut}
                                </strong>
                              </span>
                              <span className="text-muted-foreground">
                                Sewa:{" "}
                                <strong className="text-primary">
                                  {formatRupiah(b.monthlyRent)}
                                </strong>
                                /bln
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 sm:flex-col">
                          <button
                            onClick={() => handleApproveBooking(b.id)}
                            disabled={approvingId === b.id}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {approvingId === b.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Setujui
                          </button>
                          <button
                            onClick={() => handleRejectBooking(b.id)}
                            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Past decisions */}
            {ownerBookings.filter((b) => b.status !== "menunggu").length >
              0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 font-semibold text-card-foreground">
                  Riwayat Persetujuan
                </h2>
                <div className="flex flex-col gap-3">
                  {ownerBookings
                    .filter((b) => b.status !== "menunggu")
                    .map((b) => {
                      const tenant = getUser(b.tenantId);
                      const prop = state.properties.find(
                        (p) => p.id === b.propertyId,
                      );
                      return (
                        <div
                          key={b.id}
                          className="flex items-center justify-between rounded-lg border border-border p-4"
                        >
                          <div>
                            <p className="font-medium text-card-foreground">
                              {tenant?.name} - {prop?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {b.checkIn} - {b.checkOut}
                            </p>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Survey Visits */}
        {tab === "survey" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-foreground">
              Permintaan Survey Kunjungan
            </h1>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Menunggu Konfirmasi",
                  value: ownerSurveys.filter((s) => s.status === "menunggu")
                    .length,
                  color: "text-amber-500",
                  icon: Clock,
                },
                {
                  label: "Dikonfirmasi",
                  value: ownerSurveys.filter((s) => s.status === "dikonfirmasi")
                    .length,
                  color: "text-sky-500",
                  icon: CalendarSearch,
                },
                {
                  label: "Selesai",
                  value: ownerSurveys.filter((s) => s.status === "selesai")
                    .length,
                  color: "text-emerald-500",
                  icon: CheckCircle,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-card-foreground">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Pending surveys */}
            {ownerSurveys.filter((s) => s.status === "menunggu").length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/30 dark:bg-amber-900/10">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
                  <AlertCircle className="h-5 w-5" /> Menunggu Konfirmasi
                </h2>
                <div className="flex flex-col gap-4">
                  {ownerSurveys
                    .filter((s) => s.status === "menunggu")
                    .map((sv) => {
                      const tenant = getUser(sv.tenantId);
                      const prop = getProperty(sv.propertyId);
                      return (
                        <div
                          key={sv.id}
                          className="rounded-xl border border-border bg-card p-5"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                  {tenant?.avatar}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-card-foreground">
                                    {tenant?.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {tenant?.phone}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-4 w-4" /> {prop?.name}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <CalendarSearch className="h-4 w-4" />{" "}
                                  {sv.date} pukul {sv.time}
                                </span>
                              </div>
                              {sv.notes && (
                                <p className="mt-2 flex items-start gap-1 text-sm text-muted-foreground">
                                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
                                  {sv.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 sm:flex-col">
                              <button
                                onClick={() => {
                                  setSurveyProcessingId(sv.id);
                                  setTimeout(() => {
                                    dispatch({
                                      type: "UPDATE_SURVEY_STATUS",
                                      surveyId: sv.id,
                                      status: "dikonfirmasi",
                                    });
                                    dispatch({
                                      type: "ADD_NOTIFICATION",
                                      notification: {
                                        id: `n-${Date.now()}`,
                                        userId: sv.tenantId,
                                        title: "Survey Dikonfirmasi",
                                        message: `Permintaan survey Anda ke ${prop?.name} pada ${sv.date} pukul ${sv.time} telah dikonfirmasi oleh pemilik.`,
                                        type: "survey",
                                        read: false,
                                        createdAt: new Date()
                                          .toISOString()
                                          .split("T")[0],
                                      },
                                    });
                                    toast.success(
                                      "Survey berhasil dikonfirmasi!",
                                    );
                                    setSurveyProcessingId(null);
                                  }, 1000);
                                }}
                                disabled={surveyProcessingId === sv.id}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {surveyProcessingId === sv.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                                Konfirmasi
                              </button>
                              <button
                                onClick={() => {
                                  dispatch({
                                    type: "UPDATE_SURVEY_STATUS",
                                    surveyId: sv.id,
                                    status: "dibatalkan",
                                  });
                                  dispatch({
                                    type: "ADD_NOTIFICATION",
                                    notification: {
                                      id: `n-${Date.now()}`,
                                      userId: sv.tenantId,
                                      title: "Survey Ditolak",
                                      message: `Maaf, permintaan survey Anda ke ${prop?.name} pada ${sv.date} pukul ${sv.time} telah ditolak oleh pemilik.`,
                                      type: "survey",
                                      read: false,
                                      createdAt: new Date()
                                        .toISOString()
                                        .split("T")[0],
                                    },
                                  });
                                  toast.info("Survey ditolak");
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <XCircle className="h-4 w-4" /> Tolak
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Confirmed surveys */}
            {ownerSurveys.filter((s) => s.status === "dikonfirmasi").length >
              0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 font-semibold text-card-foreground">
                  Jadwal Survey Dikonfirmasi
                </h2>
                <div className="flex flex-col gap-3">
                  {ownerSurveys
                    .filter((s) => s.status === "dikonfirmasi")
                    .map((sv) => {
                      const tenant = getUser(sv.tenantId);
                      const prop = getProperty(sv.propertyId);
                      return (
                        <div
                          key={sv.id}
                          className="flex items-center justify-between rounded-lg border border-border p-4"
                        >
                          <div>
                            <p className="font-medium text-card-foreground">
                              {tenant?.name} - {prop?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {sv.date} pukul {sv.time}
                            </p>
                            {sv.notes && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {sv.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={sv.status} />
                            <button
                              onClick={() => {
                                dispatch({
                                  type: "UPDATE_SURVEY_STATUS",
                                  surveyId: sv.id,
                                  status: "selesai",
                                });
                                dispatch({
                                  type: "ADD_NOTIFICATION",
                                  notification: {
                                    id: `n-${Date.now()}`,
                                    userId: sv.tenantId,
                                    title: "Survey Selesai",
                                    message: `Survey kunjungan Anda ke ${prop?.name} telah ditandai selesai. Terima kasih!`,
                                    type: "survey",
                                    read: false,
                                    createdAt: new Date()
                                      .toISOString()
                                      .split("T")[0],
                                  },
                                });
                                toast.success("Survey ditandai selesai");
                              }}
                              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                            >
                              Tandai Selesai
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Completed/cancelled history */}
            {ownerSurveys.filter(
              (s) => s.status === "selesai" || s.status === "dibatalkan",
            ).length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 font-semibold text-card-foreground">
                  Riwayat Survey
                </h2>
                <div className="flex flex-col gap-2">
                  {ownerSurveys
                    .filter(
                      (s) =>
                        s.status === "selesai" || s.status === "dibatalkan",
                    )
                    .map((sv) => {
                      const tenant = getUser(sv.tenantId);
                      const prop = getProperty(sv.propertyId);
                      return (
                        <div
                          key={sv.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="font-medium text-card-foreground">
                              {tenant?.name} - {prop?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sv.date} pukul {sv.time}
                            </p>
                          </div>
                          <StatusBadge status={sv.status} />
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {ownerSurveys.length === 0 && (
              <div className="flex flex-col items-center rounded-xl border border-border bg-card py-16">
                <CalendarSearch className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-muted-foreground">
                  Belum ada permintaan survey kunjungan
                </p>
              </div>
            )}
          </div>
        )}
      </DashboardShell>
    </div>
  );
}
