"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatDateIndo } from "@/lib/date";
import {
  Download,
  Upload,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";

interface BackupClientProps {
  lastBackupAt: string | null;
  currentCounts: {
    accountCount: number;
    categoryCount: number;
    transactionCount: number;
    budgetCount: number;
  };
}

interface ImportPreview {
  accountCount: number;
  categoryCount: number;
  transactionCount: number;
  budgetCount: number;
  minDate: string | null;
  maxDate: string | null;
  exportedAt: string;
}

export function BackupClient({ lastBackupAt, currentCounts }: BackupClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<unknown | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [now] = useState(() => Date.now());
  const backupDate = lastBackupAt ? new Date(lastBackupAt) : null;
  const daysSinceBackup = backupDate
    ? Math.floor((now - backupDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Handle JSON file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPreview(null);
    setSelectedFileContent(null);
    setConfirmationText("");

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      setIsLoading(true);
      const res = await fetch("/api/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const result = await res.json();
      setIsLoading(false);

      if (!res.ok || !result.success) {
        setErrorMessage(result.error || "Gagal memverifikasi berkas backup.");
        return;
      }

      setPreview(result.preview);
      setSelectedFileContent(parsed);
    } catch {
      setIsLoading(false);
      setErrorMessage("Format berkas tidak valid. Harap pilih berkas JSON.");
    }
  };

  // Handle Commit Import
  const handleCommitImport = async () => {
    if (confirmationText !== "IMPORT" || !selectedFileContent) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmation: "IMPORT",
          backupData: selectedFileContent,
        }),
      });

      const result = await res.json();
      setIsLoading(false);

      if (!res.ok || !result.success) {
        setErrorMessage(result.error || "Gagal mengimpor data.");
        return;
      }

      // Download auto-backup snapshot of old data (FR-IMP-7)
      if (result.autoBackupSnapshot) {
        const blob = new Blob([JSON.stringify(result.autoBackupSnapshot, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pre-import-auto-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setSuccessMessage("Data berhasil dipulihkan! Mengarahkan ke Dashboard...");
      setPreview(null);
      setSelectedFileContent(null);
      setConfirmationText("");

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch {
      setIsLoading(false);
      setErrorMessage("Terjadi kegagalan jaringan saat mengimpor data.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Backup Status Banner */}
      <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 flex items-start gap-3.5">
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
            daysSinceBackup === null || daysSinceBackup >= 30
              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
              : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          <Clock className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {backupDate
              ? `Terakhir dibackup: ${formatDateIndo(backupDate, { withTime: true })}`
              : "Belum pernah backup"}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {daysSinceBackup !== null
              ? daysSinceBackup === 0
                ? "Data telah dibackup hari ini."
                : `${daysSinceBackup} hari yang lalu sejak backup terakhir.`
              : "Amankan data keuanganmu dengan mengekspor berkas backup secara berkala."}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
          <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Ekspor Data (Backup)</span>
        </div>
        <p className="text-[11px] text-zinc-500">
          Unduh salinan seluruh catatan keuangan ke perangkatmu. Data tersimpan secara privat
          tanpa pihak ketiga.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* JSON Full Backup */}
          <a
            href="/api/export/json"
            download
            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center gap-3 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Backup Lengkap (JSON)
              </div>
              <div className="text-[10px] text-zinc-400">
                {currentCounts.transactionCount} transaksi · Seluruh tabel
              </div>
            </div>
          </a>

          {/* CSV Transactions */}
          <a
            href="/api/export/csv"
            download
            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center gap-3 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Transaksi Saja (CSV)
              </div>
              <div className="text-[10px] text-zinc-400">
                Format tabel untuk Excel/Sheets
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Import Section */}
      <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
          <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Impor Data (Restore)</span>
        </div>
        <p className="text-[11px] text-zinc-500">
          Pulihkan database dari berkas JSON backup resmi Hematin.
        </p>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Trigger Button */}
        {!preview && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-500 bg-white/50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>{isLoading ? "Memeriksa berkas..." : "Pilih Berkas JSON Backup"}</span>
            <span className="text-[10px] text-zinc-400 font-normal">
              Berkas harus berformat .json hasil ekspor Hematin
            </span>
          </button>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Success message banner */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>{successMessage}</div>
          </div>
        )}

        {/* Import Preview Card (FR-IMP-5 & FR-IMP-6) */}
        {preview && (
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-700">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Ringkasan Berkas Backup
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setSelectedFileContent(null);
                }}
                className="text-[11px] text-zinc-400 hover:text-zinc-600"
              >
                Batal
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <span className="text-[10px] text-zinc-400 block">Akun</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {preview.accountCount} Akun
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <span className="text-[10px] text-zinc-400 block">Kategori</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {preview.categoryCount} Kategori
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <span className="text-[10px] text-zinc-400 block">Transaksi</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {preview.transactionCount} Catatan
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <span className="text-[10px] text-zinc-400 block">Budget</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {preview.budgetCount} Anggaran
                </span>
              </div>
            </div>

            {preview.minDate && preview.maxDate && (
              <div className="text-[11px] text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl">
                <span>Rentang transaksi: </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {formatDateIndo(preview.minDate, { shortMonth: true })} s/d{" "}
                  {formatDateIndo(preview.maxDate, { shortMonth: true })}
                </span>
              </div>
            )}

            {/* Warning Box (FR-IMP-6) */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Peringatan:</strong> Data saat ini ({currentCounts.transactionCount} transaksi) akan <strong>DITIMPA</strong> secara permanen. Backup data lama akan otomatis diunduh ke browser sebelum proses penimpaan.
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block">
                Ketik <strong className="text-rose-600 dark:text-rose-400">&quot;IMPORT&quot;</strong> untuk konfirmasi:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                placeholder="Ketik IMPORT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold tracking-widest text-zinc-900 dark:text-zinc-100 placeholder:font-normal placeholder:tracking-normal focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setSelectedFileContent(null);
                }}
                disabled={isLoading}
                className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCommitImport}
                disabled={confirmationText !== "IMPORT" || isLoading}
                className="flex-1 py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Konfirmasi &amp; Timpa</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
