import Link from "next/link";
import { Header } from "@/components/Header";
import { logoutAction } from "@/actions/auth";
import { ThemeSelector } from "@/components/ThemeSelector";
import {
  Wallet,
  Tag,
  Database,
  Moon,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function SettingsPage() {
  const menuItems = [
    {
      label: "Manajemen Akun",
      description: "Cash, rekening bank, dan e-wallet",
      icon: Wallet,
      href: "/settings/accounts",
    },
    {
      label: "Kategori Transaksi",
      description: "Atur kategori pemasukan & pengeluaran",
      icon: Tag,
      href: "/settings/categories",
    },
    {
      label: "Backup & Restore",
      description: "Ekspor JSON/CSV & impor data mandiri",
      icon: Database,
      href: "/settings/backup",
    },
  ];

  return (
    <div className="flex flex-col flex-1 pb-6">
      <Header title="Pengaturan" showGreeting={false} showSettings={false} />

      <div className="px-5 space-y-5 mt-2">
        {/* Security / Status Card */}
        <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Mode Pemilik Aktif
              </div>
              <div className="text-[11px] text-zinc-500">
                Sesi privat terlindungi cookie bertanda tangan HMAC
              </div>
            </div>
          </div>
        </div>

        {/* Master Data Menu List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            Data Master &amp; Pencatatan
          </h3>

          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-hidden shadow-2xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-zinc-400">{item.description}</div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Theme Settings Card (FR-THEME) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            <Moon className="w-3.5 h-3.5" />
            <span>Tampilan &amp; Tema</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-white dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Pilihan Mode Warna
            </div>
            <ThemeSelector />
          </div>
        </div>

        {/* Logout Form */}
        <div className="pt-2">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100/60 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Aplikasi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
