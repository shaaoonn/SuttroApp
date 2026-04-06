'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsChartsProps {
  dailyActivity: { date: string; count: number }[];
  eventCounts: Record<string, number>;
  topContent: { type: string; id: string; count: number }[];
}

export default function AnalyticsCharts({ dailyActivity, eventCounts, topContent }: AnalyticsChartsProps) {
  const eventData = Object.entries(eventCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Daily activity chart */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold mb-4">দৈনিক কার্যকলাপ (৭ দিন)</h2>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Event types */}
        <div className="admin-card p-6">
          <h2 className="text-lg font-semibold mb-4">ইভেন্টের ধরন</h2>
          {eventData.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>ডেটা নেই</p>
          ) : (
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top content */}
        <div className="admin-card p-6">
          <h2 className="text-lg font-semibold mb-4">জনপ্রিয় কন্টেন্ট</h2>
          {topContent.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>ডেটা নেই</p>
          ) : (
            <div className="space-y-2">
              {topContent.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: '#f8fafc' }}
                >
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded font-medium mr-2" style={{ background: '#e2e8f0' }}>
                      {item.type}
                    </span>
                    <span className="text-sm">{item.id}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--admin-primary)' }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
