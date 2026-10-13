import Link from "next/link";
import { Header } from "@/components/Header";
import { getBackupStatus } from "@/features/backup/actions";
import { BackupClient } from "@/features/backup/BackupClient";
import { ChevronLeft } from "lucide-react";

export default async function BackupPage() {
  const status = await getBackupStatus();

  return (
    <div className="flex flex-col flex-1 pb-6">
      <Header title="Backup & Restore" showBack backHref="/settings" showGreeting={false} showSettings={false} />

      <div className="px-5 space-y-4 mt-2">

        <BackupClient
          lastBackupAt={status.lastBackupAt}
          currentCounts={status.currentCounts}
        />
      </div>
    </div>
  );
}
