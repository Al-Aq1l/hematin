import { PrismaClient, CategoryType } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES: {
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string;
  isDefault: boolean;
}[] = [
  // Expense Categories
  { name: "Food", type: CategoryType.EXPENSE, icon: null, color: "#F97316", isDefault: true },
  { name: "Transportation", type: CategoryType.EXPENSE, icon: null, color: "#3B82F6", isDefault: true },
  { name: "Shopping", type: CategoryType.EXPENSE, icon: null, color: "#EC4899", isDefault: true },
  { name: "Entertainment", type: CategoryType.EXPENSE, icon: null, color: "#8B5CF6", isDefault: true },
  { name: "Bills", type: CategoryType.EXPENSE, icon: null, color: "#EF4444", isDefault: true },
  { name: "Education", type: CategoryType.EXPENSE, icon: null, color: "#10B981", isDefault: true },
  { name: "Health", type: CategoryType.EXPENSE, icon: null, color: "#06B6D4", isDefault: true },
  { name: "Other", type: CategoryType.EXPENSE, icon: null, color: "#6B7280", isDefault: true },

  // Income Categories
  { name: "Salary", type: CategoryType.INCOME, icon: null, color: "#10B981", isDefault: true },
  { name: "Freelance", type: CategoryType.INCOME, icon: null, color: "#3B82F6", isDefault: true },
  { name: "Gift", type: CategoryType.INCOME, icon: null, color: "#F59E0B", isDefault: true },
  { name: "Other", type: CategoryType.INCOME, icon: null, color: "#6B7280", isDefault: true },
];

const DEFAULT_SETTINGS = [
  { key: "theme", value: "system" },
  { key: "monthStartDay", value: "1" },
  { key: "onboardingDone", value: "false" },
];

async function main() {
  console.log("Seeding default categories...");
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        name_type: {
          name: cat.name,
          type: cat.type,
        },
      },
      update: {
        icon: cat.icon,
        color: cat.color,
        isDefault: cat.isDefault,
      },
      create: cat,
    });
  }

  console.log("Seeding default settings...");
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
