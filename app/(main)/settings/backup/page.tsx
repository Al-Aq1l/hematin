import Link from "next/link";
import { Header } from "@/components/Header";
import { getBackupStatus } from "@/features/backup/actions";
import { BackupClient } from "@/features/backup/BackupClient";
import { ChevronLeft } from "lucide-react";

export default async function BackupPage() {
  const status = await getBackupStatus();

  return (
    <div className="flex flex-col flex-1 pb-6">
      <Header title="Backup & Restore" showGreeting={false} showSettings={false} />

      <div className="px-5 space-y-4 mt-2">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Pengaturan</span>
        </Link>

        <BackupClient
          lastBackupAt={status.lastBackupAt}
          currentCounts={status.currentCounts}
        />
      </div>
    </div>
  );
}
