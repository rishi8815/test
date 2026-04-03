import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { Stat } from '../components/Stat';
import { Card } from '../components/ui/Card';
import { Gamification } from '../components/Gamification';
import { PrivateRoute } from '../routes/PrivateRoute';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

type DashboardData = {
  totals: { earnings: number; clicks: number; conversions: number };
  trend: Array<{ date: string; earnings: number; clicks: number; conversions: number }>;
  transactions: Array<{ id: string; date: string; amount: number; status: string }>;
  payouts: Array<{ id: string; date: string; amount: number; status: string }>;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/reseller/dashboard')
      .then((res) => setData(res.data?.data))
      .catch(() => setError('Unable to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PrivateRoute>
      {loading && <Loader text="Loading dashboard..." />}
      {error && <ErrorState message={error} />}
      {data && (
        <div className="stack">
          <Gamification totalEarnings={data.totals.earnings} />

          <div className="grid-3">
            <Stat label="Total earnings" value={`€${data.totals.earnings.toLocaleString()}`} />
            <Stat label="Clicks" value={data.totals.clicks} />
            <Stat label="Conversions" value={data.totals.conversions} />
          </div>

          <Card>
            <div className="title-sm" style={{ marginBottom: 8 }}>Performance</div>
            <div style={{ height: 256, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="earnings" stroke="#4f46e5" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicks" stroke="#06b6d4" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </PrivateRoute>
  );
}