import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { useApp, useProviderJobs, useNotifications } from "@/lib/app-context";
import {
  formatRupiah,
  getUser,
  getProperty,
  providerServices,
} from "@/lib/mock-data";
import {
  Briefcase,
  DollarSign,
  ClipboardList,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  TrendingUp,
  Package,
  Star,
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
} from "recharts";

export default function ServicesProviderPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "ringkasan";
  const { state, dispatch } = useApp();
  const jobs = useProviderJobs();
  const notifications = useNotifications();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const myServices = providerServices.filter(
    (s) => s.providerId === state.currentUser.id,
  );
  const pendingJobs = jobs.filter((j) => j.status === "menunggu");
  const activeJobs = jobs.filter((j) => j.status === "dikerjakan");
  const completedJobs = jobs.filter((j) => j.status === "selesai");
  const totalEarnings = completedJobs.reduce((sum, j) => sum + j.price, 0);
  const pendingEarnings = [...pendingJobs, ...activeJobs].reduce(
    (sum, j) => sum + j.price,
    0,
  );

  const earningsData = [
    { bulan: "Jan", pendapatan: 0 },
    {
      bulan: "Feb",
      pendapatan: completedJobs
        .filter((j) => j.completedAt?.startsWith("2026-02"))
        .reduce((s, j) => s + j.price, 0),
    },
    {
      bulan: "Mar",
      pendapatan: completedJobs
        .filter((j) => j.completedAt?.startsWith("2026-03"))
        .reduce((s, j) => s + j.price, 0),
    },
    { bulan: "Apr", pendapatan: 0 },
  ];

  function handleAcceptJob(jobId: string) {
    setProcessingId(jobId);
    setTimeout(() => {
      dispatch({
        type: "UPDATE_JOB_STATUS",
        requestId: jobId,
        status: "dikerjakan",
      });
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        dispatch({
          type: "ADD_NOTIFICATION",
          notification: {
            id: `n-${Date.now()}`,
            userId: job.tenantId,
            title: "Layanan Diterima",
            message: `${state.currentUser.name} telah menerima permintaan layanan Anda.`,
            type: "service",
            read: false,
            createdAt: new Date().toISOString().split("T")[0],
          },
        });
      }
      toast.success("Pekerjaan diterima!");
      setProcessingId(null);
    }, 1000);
  }

  function handleCompleteJob(jobId: string) {
    setProcessingId(jobId);
    setTimeout(() => {
      dispatch({
        type: "UPDATE_JOB_STATUS",
        requestId: jobId,
        status: "selesai",
        completedAt: new Date().toISOString().split("T")[0],
      });
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        dispatch({
          type: "ADD_NOTIFICATION",
          notification: {
            id: `n-${Date.now()}`,
            userId: job.tenantId,
            title: "Layanan Selesai",
            message: `Layanan ${job.serviceType} dari ${state.currentUser.name} telah selesai.`,
            type: "service",
            read: false,
            createdAt: new Date().toISOString().split("T")[0],
          },
        });
      }
      toast.success("Pekerjaan selesai!");
      setProcessingId(null);
    }, 1000);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <DashboardShell>
        {/* Ringkasan */}
        {(tab === "ringkasan" ||
          !["pekerjaan", "layanan", "pendapatan"].includes(tab)) && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dasbor Penyedia
              </h1>
              <p className="text-muted-foreground capitalize">
                {state.currentUser.providerType} - {state.currentUser.name}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Pekerjaan Baru",
                  value: pendingJobs.length,
                  icon: AlertCircle,
                  color: "text-amber-500",
                },
                {
                  label: "Sedang Dikerjakan",
                  value: activeJobs.length,
                  icon: Clock,
                  color: "text-sky-500",
                },
                {
                  label: "Selesai",
                  value: completedJobs.length,
                  icon: CheckCircle2,
                  color: "text-emerald-500",
                },
                {
                  label: "Total Pendapatan",
                  value: formatRupiah(totalEarnings),
                  icon: DollarSign,
                  color: "text-primary",
                  small: true,
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

            {/* Pending jobs */}
            {pendingJobs.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/30 dark:bg-amber-900/10">
                <h2 className="mb-3 flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
                  <Briefcase className="h-5 w-5" /> Pekerjaan Menunggu
                </h2>
                <div className="flex flex-col gap-3">
                  {pendingJobs.map((j) => {
                    const tenant = getUser(j.tenantId);
                    const prop = getProperty(j.propertyId);
                    return (
                      <div
                        key={j.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                      >
                        <div>
                          <p className="font-medium capitalize text-card-foreground">
                            {j.serviceType}: {j.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tenant?.name} - {prop?.name}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {formatRupiah(j.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAcceptJob(j.id)}
                          disabled={processingId === j.id}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          {processingId === j.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Terima"
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active jobs */}
            {activeJobs.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-3 font-semibold text-card-foreground">
                  Sedang Dikerjakan
                </h2>
                <div className="flex flex-col gap-3">
                  {activeJobs.map((j) => {
                    const tenant = getUser(j.tenantId);
                    return (
                      <div
                        key={j.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div>
                          <p className="font-medium capitalize text-card-foreground">
                            {j.serviceType}: {j.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tenant?.name} - {formatRupiah(j.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCompleteJob(j.id)}
                          disabled={processingId === j.id}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {processingId === j.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Selesai"
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

        {/* Pekerjaan tab */}
        {tab === "pekerjaan" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-foreground">
              Daftar Pekerjaan
            </h1>
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-border bg-card py-16">
                <Briefcase className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-muted-foreground">
                  Belum ada pekerjaan
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {jobs.map((j) => {
                  const tenant = getUser(j.tenantId);
                  const prop = getProperty(j.propertyId);
                  return (
                    <div
                      key={j.id}
                      className="rounded-xl border border-border bg-card p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold capitalize text-card-foreground">
                            {j.serviceType}: {j.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tenant?.name} - {prop?.name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {j.createdAt}
                            {j.completedAt
                              ? ` - Selesai: ${j.completedAt}`
                              : ""}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={j.status} />
                          <span className="font-semibold text-primary">
                            {formatRupiah(j.price)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {j.status === "menunggu" && (
                          <button
                            onClick={() => handleAcceptJob(j.id)}
                            disabled={processingId === j.id}
                            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                          >
                            Terima
                          </button>
                        )}
                        {j.status === "dikerjakan" && (
                          <button
                            onClick={() => handleCompleteJob(j.id)}
                            disabled={processingId === j.id}
                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Tandai Selesai
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Layanan tab */}
        {tab === "layanan" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-foreground">Layanan Saya</h1>
            <div className="grid gap-4 sm:grid-cols-2">
              {myServices.map((svc) => (
                <div
                  key={svc.id}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        {svc.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {svc.description}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        svc.active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {svc.active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatRupiah(svc.price)}
                    </span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground">
                      {svc.serviceType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pendapatan tab */}
        {tab === "pendapatan" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-foreground">Pendapatan</h1>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Total Pendapatan
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(totalEarnings)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Pendapatan Tertunda
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatRupiah(pendingEarnings)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Pekerjaan Selesai
                </p>
                <p className="mt-1 text-2xl font-bold text-card-foreground">
                  {completedJobs.length}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-card-foreground">
                Pendapatan Bulanan
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsData}>
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
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}rb`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatRupiah(value),
                        "Pendapatan",
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
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Earnings details */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-card-foreground">
                Detail Pendapatan
              </h2>
              {completedJobs.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Belum ada pendapatan
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {completedJobs.map((j) => {
                    const tenant = getUser(j.tenantId);
                    return (
                      <div
                        key={j.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div>
                          <p className="font-medium capitalize text-card-foreground">
                            {j.serviceType}: {j.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tenant?.name} - {j.completedAt}
                          </p>
                        </div>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(j.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardShell>
    </div>
  );
}
