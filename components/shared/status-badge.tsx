import { cn } from "@/lib/utils"
import { statusLabel } from "@/lib/mock-data"

const variants: Record<string, string> = {
  aktif: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  lunas: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  selesai: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  menunggu: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  dikonfirmasi: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  dikerjakan: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  belum_bayar: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  gagal: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  dibatalkan: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      variants[status] ?? "bg-secondary text-secondary-foreground",
      className
    )}>
      {statusLabel(status)}
    </span>
  )
}
