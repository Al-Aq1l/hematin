import { test } from "node:test";
import assert from "node:assert/strict";
import { backupDataSchema } from "../features/backup/schemas";

test("backupDataSchema - validates valid backup payload successfully", () => {
  const sampleBackup = {
    schemaVersion: 1,
    appVersion: "1.0.0",
    exportedAt: new Date().toISOString(),
    data: {
      accounts: [
        {
          id: "acc-1",
          name: "BCA Utama",
          type: "BANK",
          initialBalance: "5000000",
          icon: null,
          isArchived: false,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      categories: [
        {
          id: "cat-1",
          name: "Makan & Minum",
          type: "EXPENSE",
          icon: null,
          color: "#EF4444",
          isDefault: true,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      transactions: [
        {
          id: "trx-1",
          type: "EXPENSE",
          amount: "50000",
          date: new Date().toISOString(),
          note: "Makan siang",
          accountId: "acc-1",
          categoryId: "cat-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      budgets: [
        {
          id: "bud-1",
          categoryId: "cat-1",
          amount: "1500000",
          month: 10,
          year: 2026,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      settings: [
        {
          key: "lastBackupAt",
          value: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  };

  const result = backupDataSchema.safeParse(sampleBackup);
  assert.equal(result.success, true);
});

test("backupDataSchema - rejects invalid schemaVersion", () => {
  const invalidBackup = {
    schemaVersion: 2, // invalid
    appVersion: "1.0.0",
    exportedAt: new Date().toISOString(),
    data: {
      accounts: [],
      categories: [],
      transactions: [],
      budgets: [],
      settings: [],
    },
  };

  const result = backupDataSchema.safeParse(invalidBackup);
  assert.equal(result.success, false);
});
