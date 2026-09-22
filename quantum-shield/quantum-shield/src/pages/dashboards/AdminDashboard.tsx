import React, { useEffect, useState } from 'react';
import { FileText, Lock, ShieldAlert, Users, ShieldBan, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { api } from '../../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockTimelineData = [
  { name: 'Jan', papers: 10, incidents: 0 },
  { name: 'Feb', papers: 25, incidents: 2 },
  { name: 'Mar', papers: 45, incidents: 1 },
  { name: 'Apr', papers: 50, incidents: 4 },
  { name: 'May', papers: 70, incidents: 2 },
  { name: 'Jun', papers: 90, incidents: 1 },
];

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    api.get('/analytics/dashboard').then(setMetrics).catch(console.error);
  }, []);

  if (!metrics) return <div className="p-8">Loading Dashboard...</div>;

  const statCards = [
    { title: 'Total Papers', value: metrics.total_papers, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Secured Papers', value: metrics.verified_papers, icon: Lock, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Blocked Attempts', value: metrics.blocked_attempts, icon: ShieldBan, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'Active Users', value: metrics.active_users, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const pieData = [
    { name: 'Verified', value: metrics.verified_papers },
    { name: 'Tampered', value: metrics.tampered_papers },
    { name: 'Pending', value: metrics.total_papers - metrics.verified_papers },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Overview Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">Enterprise-grade cryptographic monitoring and security posture.</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
          <BadgeCheck className="w-5 h-5" />
          <span className="font-semibold text-sm">Success Rate: {metrics.success_rate}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} hoverable>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-2 text-text-main">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTimelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPapers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="papers" stroke="#3B82F6" fillOpacity={1} fill="url(#colorPapers)" />
                  <Area type="monotone" dataKey="incidents" stroke="#EF4444" fillOpacity={1} fill="url(#colorIncidents)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Posture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col w-full space-y-2 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span>{entry.name}</span>
                  </div>
                  <span className="font-semibold">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
