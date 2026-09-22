import React, { useState, useEffect } from 'react';
import { Activity, Download, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E'];

export function PerformanceBenchmark() {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  const runBenchmark = async () => {
    setLoading(true);
    try {
      const data = await api.get('/analytics/benchmark');
      setMetrics(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    runBenchmark();
  }, []);

  const chartData = metrics ? [
    { name: 'AES Encrypt', time: metrics.aes_encrypt },
    { name: 'AES Decrypt', time: metrics.aes_decrypt },
    { name: 'SHA3 Hash', time: metrics.sha3_hash },
    { name: 'Kyber Encap', time: metrics.kyber_encapsulate },
    { name: 'Kyber Decap', time: metrics.kyber_decapsulate },
    { name: 'ML-DSA Sign', time: metrics.dilithium_sign },
    { name: 'ML-DSA Verify', time: metrics.dilithium_verify },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance Benchmark</h1>
          <p className="text-sm text-text-muted mt-1">Live microsecond profiling of Post-Quantum algorithms.</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={runBenchmark} disabled={loading} variant="outline">
            {loading ? 'Running...' : 'Rerun Benchmark'}
            <Play className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="default">
            Export Report
            <Download className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Execution Time (Microseconds)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !metrics ? (
              <div className="h-[400px] flex items-center justify-center">Benchmarking Algorithms...</div>
            ) : (
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics && (
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-text-muted">Total Verification Pipeline Time</p>
                  <p className="text-3xl font-bold text-primary mt-1">{metrics.total_verification.toFixed(2)} ms</p>
                  <p className="text-xs text-text-muted mt-2">Includes SHA3 + Dilithium Verify + Kyber Decap + AES Decrypt</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold border-b border-border pb-2">Bottleneck Analysis</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Slowest Operation</span>
                    <span className="font-semibold text-text-main">
                      {chartData.reduce((prev, current) => (prev.time > current.time) ? prev : current).name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Fastest Operation</span>
                    <span className="font-semibold text-text-main">
                      {chartData.reduce((prev, current) => (prev.time < current.time) ? prev : current).name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Platform Architecture</span>
                    <span className="font-semibold text-text-main">x86_64</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
