import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { backupDataSchema } from "@/features/backup/schemas";

export async function POST(request: NextRequest) {
  const isAuth = await getSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const parseResult = backupDataSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      return NextResponse.json(
        {
          success: false,
          error: `Format file backup tidak valid. ${errorMsg}`,
        },
        { status: 400 }
      );
    }

    const { data } = parseResult.data;

    // Relational integrity check (FR-IMP-4)
    const accountIds = new Set(data.accounts.map((a) => a.id));
    const categoryIds = new Set(data.categories.map((c) => c.id));

    for (let i = 0; i < data.transactions.length; i++) {
      const t = data.transactions[i];
      if (!accountIds.has(t.accountId)) {
        return NextResponse.json(
          {
            success: false,
            error: `Integritas relasi gagal: Transaksi #${i + 1} merujuk ke akun yang tidak ditemukan di file backup.`,
          },
          { status: 400 }
        );
      }
      if (!categoryIds.has(t.categoryId)) {
        return NextResponse.json(
          {
            success: false,
            error: `Integritas relasi gagal: Transaksi #${i + 1} merujuk ke kategori yang tidak ditemukan di file backup.`,
          },
          { status: 400 }
        );
      }
    }

    for (let i = 0; i < data.budgets.length; i++) {
      const b = data.budgets[i];
      if (!categoryIds.has(b.categoryId)) {
        return NextResponse.json(
          {
            success: false,
            error: `Integritas relasi gagal: Budget #${i + 1} merujuk ke kategori yang tidak ditemukan di file backup.`,
          },
          { status: 400 }
        );
      }
    }

    // Determine date range of transactions
    let minDate: string | null = null;
    let maxDate: string | null = null;

    if (data.transactions.length > 0) {
      const sortedDates = data.transactions
        .map((t) => t.date)
        .sort((a, b) => a.localeCompare(b));
      minDate = sortedDates[0];
      maxDate = sortedDates[sortedDates.length - 1];
    }

    return NextResponse.json({
      success: true,
      preview: {
        accountCount: data.accounts.length,
        categoryCount: data.categories.length,
        transactionCount: data.transactions.length,
        budgetCount: data.budgets.length,
        minDate,
        maxDate,
        exportedAt: parseResult.data.exportedAt,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal membaca berkas JSON backup. Pastikan berkas berformat JSON yang valid.",
      },
      { status: 400 }
    );
  }
}
