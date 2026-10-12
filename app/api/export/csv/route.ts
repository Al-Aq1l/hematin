import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toWIBDateInputString } from "@/lib/date";
import { fromBigIntToNumber } from "@/lib/money";

export async function GET(request: NextRequest) {
  const isAuth = await getSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");

  const whereClause: Record<string, unknown> = {};
  if (startDateStr || endDateStr) {
    const dateFilter: Record<string, Date> = {};
    if (startDateStr) dateFilter.gte = new Date(startDateStr);
    if (endDateStr) dateFilter.lte = new Date(endDateStr);
    whereClause.date = dateFilter;
  }

  const transactions = await db.transaction.findMany({
    where: whereClause,
    include: {
      account: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const dateStr = toWIBDateInputString(now);

  // Update lastBackupAt
  await db.setting.upsert({
    where: { key: "lastBackupAt" },
    update: { value: now.toISOString() },
    create: { key: "lastBackupAt", value: now.toISOString() },
  });

  // Build CSV content
  const headers = ["Tanggal", "Tipe", "Kategori", "Akun", "Nominal", "Catatan"];
  const rows = transactions.map((t) => {
    const formattedDate = toWIBDateInputString(t.date);
    const typeLabel = t.type === "EXPENSE" ? "Pengeluaran" : "Pemasukan";
    const amountNum = fromBigIntToNumber(t.amount);
    const cleanNote = (t.note || "").replace(/"/g, '""');
    return [
      `"${formattedDate}"`,
      `"${typeLabel}"`,
      `"${t.category.name}"`,
      `"${t.account.name}"`,
      amountNum.toString(),
      `"${cleanNote}"`,
    ].join(",");
  });

  // UTF-8 BOM (\uFEFF) ensures Excel reads Indonesian characters and UTF-8 correctly
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="money-management-transactions-${dateStr}.csv"`,
    },
  });
}
