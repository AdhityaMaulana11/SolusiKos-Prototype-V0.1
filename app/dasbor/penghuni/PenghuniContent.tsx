import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { useApp, useUserBookings, useNotifications } from "@/lib/app-context";
import {
  formatRupiah,
  getProperty,
  getUser,
  providerServices,
} from "@/lib/mock-data";
import type { ProviderType } from "@/lib/types";
import {
  CalendarDays,
  CreditCard,
  Wrench,
  Bell,
  Clock,
  Building2,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PenghuniContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "ringkasan";
  const { state, dispatch } = useApp();
  const bookings = useUserBookings();
  const userPayments = state.payments.filter(
    (p) => p.tenantId === state.currentUser.id,
  );
  const userServices = state.serviceRequests.filter(
    (sr) => sr.tenantId === state.currentUser.id,
  );
  const notifications = useNotifications();

  const [serviceType, setServiceType] = useState<ProviderType>("laundry");
  const [serviceDesc, setServiceDesc] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);

  const pendingPayments = userPayments.filter(
    (p) => p.status === "belum_bayar" || p.status === "menunggu",
  );
  const activeBookings = bookings.filter(
    (b) => b.status === "aktif" || b.status === "menunggu",
  );

  function handlePayment(paymentId: string) {
    setPayingId(paymentId);
    setTimeout(() => {
      dispatch({
        type: "UPDATE_PAYMENT_STATUS",
        paymentId,
        status: "lunas",
        paidAt: new Date().toISOString().split("T")[0],
        method: "GoPay",
      });
      dispatch({
        type: "ADD_NOTIFICATION",
        notification: {
          id: `n-${Date.now()}`,
          userId: state.currentUser.id,
          title: "Pembayaran Berhasil",
          message: `Pembayaran telah berhasil diproses.`,
          type: "payment",
          read: false,
          createdAt: new Date().toISOString().split("T")[0],
        },
      });
      toast.success("Pembayaran berhasil!");
      setPayingId(null);
    }, 1500);
  }

  function handleRequestService() {
    if (!serviceDesc.trim()) {
      toast.error("Masukkan deskripsi layanan");
      return;
    }
    const provider = state.users.find(
      (u) => u.role === "penyedia" && u.providerType === serviceType,
    );
    if (!provider) return;

    const booking = activeBookings[0];
    if (!booking) {
      toast.error("Anda belum memiliki booking aktif");
      return;
    }

    dispatch({
      type: "CREATE_SERVICE_REQUEST",
      request: {
        id: `sr-${Date.now()}`,
        tenantId: state.currentUser.id,
        providerId: provider.id,
        propertyId: booking.propertyId,
        serviceType,
        description: serviceDesc,
        status: "menunggu",
        price:
          providerServices.find((s) => s.providerId === provider.id)?.price ??
          50000,
        createdAt: new Date().toISOString().split("T")[0],
      },
    });

    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: `n-${Date.now()}`,
        userId: provider.id,
        title: "Pekerjaan Baru",
        message: `${state.currentUser.name} membutuhkan layanan ${serviceType}.`,
        type: "service",
        read: false,
        createdAt: new Date().toISOString().split("T")[0],
      },
    });

    toast.success("Permintaan layanan berhasil dikirim!");
    setServiceDesc("");
  }

  function getDaysUntilDue(dueDate: string) {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <DashboardShell>
        {/* Summary / Ringkasan */}
        {(tab === "ringkasan" ||
          !["booking", "pembayaran", "layanan", "notifikasi"].includes(
            tab,
          )) && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Selamat datang, {state.currentUser.name.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground">
                Berikut ringkasan aktivitas Anda
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Booking Aktif",
                  value: activeBookings.length,
                  icon: CalendarDays,
                  color: "text-primary",
                },
                {
                  label: "Tagihan Tertunda",
                  value: pendingPayments.length,
                  icon: CreditCard,
                  color: "text-red-500",
                },
                {
                  label: "Layanan Aktif",
                  value: userServices.filter((s) => s.status !== "selesai")
                    .length,
                  icon: Wrench,
                  color: "text-sky-500",
                },
                {
                  label: "Notifikasi Baru",
                  value: notifications.filter((n) => !n.read).length,
                  icon: Bell,
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
                  <p className="mt-2 text-3xl font-bold text-card-foreground">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent bookings */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-card-foreground">
                Booking Terbaru
              </h2>
              {activeBookings.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Building2 className="h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Belum ada booking aktif
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeBookings.map((b) => {
                    const prop = getProperty(b.propertyId);
                    return (
                      <div
                        key={b.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div>
                          <h3 className="font-medium text-card-foreground">
                            {prop?.name ?? "Kos"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {b.checkIn} - {b.checkOut}
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending payments */}
            {pendingPayments.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 font-semibold text-card-foreground flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" /> Tagihan
                  Menunggu Pembayaran
                </h2>
                <div className="flex flex-col gap-3">
                  {pendingPayments.map((p) => {
                    const days = getDaysUntilDue(p.dueDate);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div>
                          <p className="font-medium text-card-foreground">
                            {formatRupiah(p.amount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Jatuh tempo: {p.dueDate} (
                            {days > 0 ? `${days} hari lagi` : "Sudah lewat"})
                          </p>
                          {/* Progress bar */}
                          <div className="mt-2 h-1.5 w-32 rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                days > 7
                                  ? "bg-emerald-500"
                                  : days > 0
                                    ? "bg-amber-500"
                                    : "bg-red-500",
                              )}
                              style={{
                                width: `${Math.max(5, Math.min(100, (1 - days / 30) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handlePayment(p.id)}
                          disabled={payingId === p.id}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          {payingId === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Bayar Sekarang"
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookings tab */}
        {tab === "booking" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-foreground">Booking Saya</h1>
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-border bg-card py-16">
                <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-muted-foreground">Belum ada booking</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map((b) => {
                  const prop = getProperty(b.propertyId);
                  return (
                    <div
                      key={b.id}
                      className="rounded-xl border border-border bg-card p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-card-foreground">
                            {prop?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {prop?.address}
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Check-in
                          </p>
                          <p className="font-medium text-card-foreground">
                            {b.checkIn}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Check-out
                          </p>
                          <p className="font-medium text-card-foreground">
                            {b.checkOut}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Sewa/bulan
                          </p>
                          <p className="font-medium text-primary">
                            {formatRupiah(b.monthlyRent)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Payments tab */}
        {tab === "pembayaran" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-foreground">Pembayaran</h1>
            {userPayments.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-border bg-card py-16">
                <CreditCard className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-muted-foreground">
                  Belum ada riwayat pembayaran
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Jumlah
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Metode
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Jatuh Tempo
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPayments.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 text-card-foreground">
                          {p.createdAt}
                        </td>
                        <td className="px-4 py-3 font-medium text-card-foreground">
                          {formatRupiah(p.amount)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.method || "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.dueDate}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3">
                          {(p.status === "belum_bayar" ||
                            p.status === "menunggu") && (
                            <button
                              onClick={() => handlePayment(p.id)}
                              disabled={payingId === p.id}
                              className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                              {payingId === p.id ? "..." : "Bayar"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Services tab */}
        {tab === "layanan" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-foreground">Layanan</h1>

            {/* Request form */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-card-foreground">
                Minta Layanan Baru
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Jenis Layanan
                  </label>
                  <div className="flex gap-2">
                    {(
                      ["laundry", "kebersihan", "tukang"] as ProviderType[]
                    ).map((pt) => (
                      <button
                        key={pt}
                        onClick={() => setServiceType(pt)}
                        className={cn(
                          "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all",
                          serviceType === pt
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50",
                        )}
                      >
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Deskripsi
                  </label>
                  <textarea
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    placeholder="Jelaskan kebutuhan Anda..."
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  onClick={handleRequestService}
                  className="self-start rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Kirim Permintaan
                </button>
              </div>
            </div>

            {/* Service history */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-card-foreground">
                Riwayat Layanan
              </h2>
              {userServices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Belum ada permintaan layanan
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {userServices.map((sr) => {
                    const provider = getUser(sr.providerId);
                    return (
                      <div
                        key={sr.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div>
                          <p className="font-medium text-card-foreground capitalize">
                            {sr.serviceType} - {sr.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {provider?.name} - {formatRupiah(sr.price)}
                          </p>
                        </div>
                        <StatusBadge status={sr.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications tab */}
        {tab === "notifikasi" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Notifikasi</h1>
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={() =>
                    dispatch({
                      type: "MARK_ALL_NOTIFICATIONS_READ",
                      userId: state.currentUser.id,
                    })
                  }
                  className="text-sm text-primary hover:underline"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-border bg-card py-16">
                <Bell className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-muted-foreground">
                  Tidak ada notifikasi
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() =>
                      dispatch({
                        type: "MARK_NOTIFICATION_READ",
                        notificationId: n.id,
                      })
                    }
                    className={cn(
                      "flex flex-col gap-1 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50",
                      !n.read && "border-primary/20 bg-primary/5",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                      <span className="font-medium text-card-foreground">
                        {n.title}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {n.createdAt}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DashboardShell>
    </div>
  );
}
