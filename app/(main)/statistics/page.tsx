import { Header } from "@/components/Header";
import { getStatisticsData } from "@/features/statistics/actions";
import { StatisticsClient } from "@/features/statistics/StatisticsClient";

interface StatisticsPageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function StatisticsPage({ searchParams }: StatisticsPageProps) {
  const params = await searchParams;
  const yearParam = params.year ? parseInt(params.year, 10) : undefined;
  const monthParam = params.month ? parseInt(params.month, 10) : undefined;

  const data = await getStatisticsData(yearParam, monthParam);

  return (
    <div className="flex flex-col flex-1 pb-6">
      <Header title="Statistik & Analisis" showGreeting={false} />

      <div className="px-5 mt-2">
        <StatisticsClient data={data} />
      </div>
    </div>
  );
}
