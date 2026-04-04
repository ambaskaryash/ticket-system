import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { AnimatedCounter } from '../components/StatsCard';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' }, padding: 16, usePointStyle: true, pointStyleWidth: 10 },
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#e2e8f0',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(148,163,184,0.15)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10,
      titleFont: { family: 'Inter', weight: 'bold' },
      bodyFont: { family: 'Inter' },
    },
  },
};

export default function AnalyticsPage({ tickets }) {
  const data = useMemo(() => {
    const byStatus = { Open: 0, 'In Progress': 0, Resolved: 0 };
    const byPriority = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const byAgent = {};
    const byDate = {};
    let totalResolveTime = 0;
    let resolvedCount = 0;

    tickets.forEach((t) => {
      const status = t.status || t.Status || 'Open';
      const sNorm = status.toLowerCase().replace(/[\s_-]/g, '');
      if (sNorm === 'inprogress') byStatus['In Progress']++;
      else if (sNorm === 'resolved') byStatus['Resolved']++;
      else byStatus['Open']++;

      const priority = (t.priority || t.Priority || 'Medium');
      const pKey = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
      if (byPriority[pKey] !== undefined) byPriority[pKey]++;

      const agent = t.agent || t.Agent || t.assignedAgent || 'Unassigned';
      byAgent[agent] = (byAgent[agent] || 0) + 1;

      const created = t.createdAt || t.CreatedAt || t.timestamp || t.Timestamp;
      if (created) {
        const d = new Date(created);
        if (!isNaN(d.getTime())) {
          const dateKey = d.toISOString().slice(0, 10);
          byDate[dateKey] = (byDate[dateKey] || 0) + 1;

          if (sNorm === 'resolved') {
            const resTime = Date.now() - d.getTime();
            totalResolveTime += resTime;
            resolvedCount++;
          }
        }
      }
    });

    const avgResHours = resolvedCount > 0 ? totalResolveTime / resolvedCount / 3600000 : 0;

    // Sort dates for line chart
    const sortedDates = Object.keys(byDate).sort();
    const last14 = sortedDates.slice(-14);

    return { byStatus, byPriority, byAgent, byDate: last14.map((d) => ({ date: d, count: byDate[d] })), avgResHours, resolvedCount };
  }, [tickets]);

  const statusChart = {
    labels: Object.keys(data.byStatus),
    datasets: [{
      data: Object.values(data.byStatus),
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const priorityChart = {
    labels: Object.keys(data.byPriority),
    datasets: [{
      label: 'Tickets',
      data: Object.values(data.byPriority),
      backgroundColor: ['#06b6d4', '#f59e0b', '#ef4444', '#dc2626'],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const agentLabels = Object.keys(data.byAgent);
  const agentChart = {
    labels: agentLabels,
    datasets: [{
      label: 'Tickets',
      data: agentLabels.map((a) => data.byAgent[a]),
      backgroundColor: '#6366f1',
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const trendChart = {
    labels: data.byDate.map((d) => d.date.slice(5)),
    datasets: [{
      label: 'Tickets Created',
      data: data.byDate.map((d) => d.count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
    }],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-dark-500 text-sm">Insights into your ticket data</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Tickets" value={tickets.length} icon="📋" color="indigo" />
        <MetricCard label="Open Rate" value={`${tickets.length ? Math.round((data.byStatus.Open / tickets.length) * 100) : 0}%`} icon="📊" color="blue" />
        <MetricCard label="Avg Resolution" value={`${Math.round(data.avgResHours)}h`} icon="⏱" color="green" />
        <MetricCard label="Resolved" value={data.resolvedCount} icon="✅" color="emerald" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPanel title="Tickets by Status">
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={statusChart} options={{ ...chartOptions, cutout: '65%' }} />
          </div>
        </ChartPanel>

        <ChartPanel title="Tickets by Priority">
          <div className="h-64">
            <Bar data={priorityChart} options={{
              ...chartOptions,
              scales: {
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } },
                y: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#64748b', font: { size: 11 } } },
              },
            }} />
          </div>
        </ChartPanel>

        <ChartPanel title="Agent Workload">
          <div className="h-64">
            <Bar data={agentChart} options={{
              ...chartOptions,
              indexAxis: 'y',
              scales: {
                x: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#64748b', font: { size: 11 } } },
                y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
              },
            }} />
          </div>
        </ChartPanel>

        <ChartPanel title="Tickets Over Time (Last 14 days)">
          <div className="h-64">
            <Line data={trendChart} options={{
              ...chartOptions,
              scales: {
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                y: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#64748b', font: { size: 11 } }, beginAtZero: true },
              },
            }} />
          </div>
        </ChartPanel>
      </div>
    </div>
  );
}

function ChartPanel({ title, children }) {
  return (
    <div className="glass-panel p-6 border-t-2 border-t-dark-700/50 hover:border-t-accent-blue/50 transition-colors">
      <h3 className="text-white text-sm font-semibold tracking-wide mb-6">{title}</h3>
      {children}
    </div>
  );
}

function MetricCard({ label, value, icon, color }) {
  const colors = {
    indigo: 'border-l-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.08)] group-hover:shadow-[0_8px_40px_rgba(99,102,241,0.2)]',
    blue: 'border-l-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.08)] group-hover:shadow-[0_8px_40px_rgba(59,130,246,0.2)]',
    green: 'border-l-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.08)] group-hover:shadow-[0_8px_40px_rgba(16,185,129,0.2)]',
    emerald: 'border-l-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.08)] group-hover:shadow-[0_8px_40px_rgba(16,185,129,0.2)]',
  };
  return (
    <div className={`group relative overflow-hidden bg-dark-900/60 backdrop-blur-xl rounded-2xl border border-dark-700/40 border-l-[4px] p-5 cursor-default transition-all duration-400 transform hover:-translate-y-1 ${colors[color] || colors.indigo}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className="text-dark-400 group-hover:text-dark-300 text-xs font-bold uppercase tracking-widest transition-colors">{label}</span>
        <span className="text-xl transition-transform duration-300 group-hover:scale-110 drop-shadow-md">{icon}</span>
      </div>
      <div className="text-3xl font-black text-white tracking-tight relative z-10 drop-shadow-md">
        {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
      </div>
    </div>
  );
}
