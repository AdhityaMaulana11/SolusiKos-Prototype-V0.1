import Link from "next/link"
import { regions } from "@/lib/mock-data"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                SK
              </div>
              SolusiKos
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Platform pencarian dan pengelolaan kos terpercaya di kawasan Rebana Metropolitan. Melayani Kota Cirebon, Kab. Cirebon, Kuningan, Majalengka, dan Indramayu.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Rebana Metropolitan</h4>
            <ul className="flex flex-col gap-2 text-sm">
              {regions.map((r) => (
                <li key={r.id}>
                  <Link href={`/cari?region=${r.id}`} className="text-muted-foreground transition-colors hover:text-primary">
                    Kos di {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Layanan</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link href="/membership" className="text-muted-foreground transition-colors hover:text-primary">Membership</Link></li>
              <li><Link href="/masuk" className="text-muted-foreground transition-colors hover:text-primary">Masuk</Link></li>
              <li><Link href="/daftar" className="text-muted-foreground transition-colors hover:text-primary">Daftar</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Bantuan</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><span className="text-muted-foreground">FAQ</span></li>
              <li><span className="text-muted-foreground">Syarat & Ketentuan</span></li>
              <li><span className="text-muted-foreground">Kebijakan Privasi</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          &copy; 2026 SolusiKos. Semua hak dilindungi. Platform kos Rebana Metropolitan. Dibuat untuk demo P2MW.
        </div>
      </div>
    </footer>
  )
}
