import { supabaseAdmin } from '@/lib/supabase-admin';
import AnalyticsCharts from './AnalyticsCharts';

async function getAnalyticsData() {
  // Get exam attempt stats
  const { data: attempts } = await supabaseAdmin
    .from('exam_attempts')
    .select('exam_paper_id, score, total_marks, completed_at')
    .order('completed_at', { ascending: false })
    .limit(500);

  // Get activity counts by type
  const { data: activityRaw } = await supabaseAdmin
    .from('user_activity')
    .select('event_type, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  // Get popular content
  const { data: popularContent } = await supabaseAdmin
    .from('user_activity')
    .select('content_type, content_id')
    .limit(500);

  // Aggregate exam stats
  const examStats = {
    totalAttempts: (attempts ?? []).length,
    avgScore: 0,
    avgPercentage: 0,
  };

  if (attempts && attempts.length > 0) {
    const totalScore = attempts.reduce((sum: number, a: Record<string, number>) =>
      sum + (a.score / a.total_marks) * 100, 0);
    examStats.avgPercentage = Math.round(totalScore / attempts.length);
    examStats.avgScore = Math.round(
      attempts.reduce((sum: number, a: Record<string, number>) => sum + a.score, 0) / attempts.length,
    );
  }

  // Aggregate activity by day (last 7 days)
  const dailyActivity: Record<string, number> = {};
  (activityRaw ?? []).forEach((a: Record<string, string>) => {
    const day = new Date(a.created_at).toISOString().split('T')[0];
    dailyActivity[day] = (dailyActivity[day] || 0) + 1;
  });

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    last7Days.push({ date: key, count: dailyActivity[key] || 0 });
  }

  // Aggregate event types
  const eventCounts: Record<string, number> = {};
  (activityRaw ?? []).forEach((a: Record<string, string>) => {
    eventCounts[a.event_type] = (eventCounts[a.event_type] || 0) + 1;
  });

  // Popular content
  const contentCounts: Record<string, number> = {};
  (popularContent ?? []).forEach((a: Record<string, string>) => {
    const key = `${a.content_type}:${a.content_id}`;
    contentCounts[key] = (contentCounts[key] || 0) + 1;
  });
  const topContent = Object.entries(contentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, count]) => {
      const [type, id] = key.split(':');
      return { type, id, count };
    });

  return { examStats, dailyActivity: last7Days, eventCounts, topContent };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="admin-card p-5">
          <div className="text-sm" style={{ color: 'var(--admin-muted)' }}>মোট পরীক্ষা</div>
          <div className="text-3xl font-bold mt-1" style={{ color: 'var(--admin-primary)' }}>
            {data.examStats.totalAttempts}
          </div>
        </div>
        <div className="admin-card p-5">
          <div className="text-sm" style={{ color: 'var(--admin-muted)' }}>গড় স্কোর</div>
          <div className="text-3xl font-bold mt-1" style={{ color: 'var(--admin-success)' }}>
            {data.examStats.avgPercentage}%
          </div>
        </div>
        <div className="admin-card p-5">
          <div className="text-sm" style={{ color: 'var(--admin-muted)' }}>ইভেন্ট (7 দিন)</div>
          <div className="text-3xl font-bold mt-1" style={{ color: '#7c3aed' }}>
            {data.dailyActivity.reduce((s, d) => s + d.count, 0)}
          </div>
        </div>
      </div>

      <AnalyticsCharts
        dailyActivity={data.dailyActivity}
        eventCounts={data.eventCounts}
        topContent={data.topContent}
      />
    </div>
  );
}
