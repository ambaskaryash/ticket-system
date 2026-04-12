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
    labels: { color: '#64748b', font: { size: 10, weight: 'bold', family: 'Inter' }, padding: 16, usePointStyle: true, pointStyleWidth: 8 },
    },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#111827',
      bodyColor: '#4b5563',
      borderColor: '#f1f5f9',
      borderWidth: 1,
      cornerRadius: 12,
      padding: 12,
      titleFont: { family: 'Inter', weight: 'bold', size: 13 },
      bodyFont: { family: 'Inter', size: 12 },
      displayColors: true,
      boxPadding: 6,
      shadowBlur: 10,
      shadowColor: 'rgba(0,0,0,0.1)',
    },
  },
};

/**
 * AnalyticsPage — uses normalized ticket fields.
 */
export default function AnalyticsPage({ tickets }) {
  const data = useMemo(() => {
    const byStatus = { Open: 0, 'In Progress': 0, Resolved: 0 };
    const byPriority = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const byAgent = {};
    const byDate = {};
    let totalResolveTime = 0;
    let resolvedCount = 0;

    tickets.forEach((t) => {
      // Status (already normalized)
      if (byStatus[t.status] !== undefined) {
        byStatus[t.status]++;
      } else {
        byStatus['Open']++;
      }

      // Priority (already normalized)
      if (byPriority[t.priority] !== undefined) {
        byPriority[t.priority]++;
      }

      // Agent
      const agent = t.agent || 'Unassigned';
      byAgent[agent] = (byAgent[agent] || 0) + 1;

      // Date trend
      if (t.createdAt) {
        const d = new Date(t.createdAt);
        if (!isNaN(d.getTime())) {
          const dateKey = d.toISOString().slice(0, 10);
          byDate[dateKey] = (byDate[dateKey] || 0) + 1;

          if (t.status === 'Resolved') {
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
      hoverBackgroundColor: ['#2563eb', '#d97706', '#059669'],
      borderWidth: 4,
      borderColor: '#ffffff',
      hoverOffset: 12,
    }],
  };

  const priorityChart = {
    labels: Object.keys(data.byPriority),
    datasets: [{
      label: 'Tickets',
      data: Object.values(data.byPriority),
      backgroundColor: ['#94a3b8', '#f59e0b', '#ef4444', '#dc2626'],
      borderRadius: 12,
      borderSkipped: false,
      maxBarThickness: 40,
    }],
  };

  const agentLabels = Object.keys(data.byAgent);
  const agentChart = {
    labels: agentLabels,
    datasets: [{
      label: 'Tickets',
      data: agentLabels.map((a) => data.byAgent[a]),
      backgroundColor: '#4f46e5',
      borderRadius: 12,
      borderSkipped: false,
      maxBarThickness: 30,
    }],
  };

  const trendChart = {
    labels: data.byDate.map((d) => d.date.slice(5)),
    datasets: [{
      label: 'Tickets Created',
      data: data.byDate.map((d) => d.count),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#2563eb',
      pointBorderWidth: 2,
    }],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-semibold text-neutral-950 tracking-tight">Analytics</h1>
        <p className="text-neutral-400 text-xs sm:text-sm font-medium uppercase tracking-widest mt-1">Insights into your ticket data</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Tickets" value={tickets.length} icon="📋" color="indigo" />
        <MetricCard label="Open Rate" value={`${tickets.length ? Math.round((data.byStatus.Open / tickets.length) * 100) : 0}%`} icon="📊" color="blue" />
        <MetricCard label="Resolved Rate" value={`${tickets.length ? Math.round((data.resolvedCount / tickets.length) * 100) : 0}%`} icon="📈" color="green" />
        <MetricCard label="Avg Resolution" value={`${Math.round(data.avgResHours)}h`} icon="⏱" color="emerald" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPanel title="Tickets by Status">
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={statusChart} options={{ ...chartOptions, cutout: '72%' }} />
          </div>
        </ChartPanel>

        <ChartPanel title="Tickets by Priority">
          <div className="h-64">
            <Bar data={priorityChart} options={{
              ...chartOptions,
              scales: {
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } } },
                y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10 } }, border: { dash: [4, 4] } },
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
                x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10 } }, border: { dash: [4, 4] } },
                y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } } },
              },
            }} />
          </div>
        </ChartPanel>

        <ChartPanel title="Tickets Over Time">
          <div className="h-64">
            <Line data={trendChart} options={{
              ...chartOptions,
              scales: {
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9, weight: 'bold' } } },
                y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10 } }, beginAtZero: true, border: { dash: [4, 4] } },
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
    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300">
      <h3 className="text-neutral-950 text-xs font-semibold tracking-widest uppercase mb-6">{title}</h3>
      {children}
    </div>
  );
}

function MetricCard({ label, value, icon, color }) {
  const colors = {
    indigo: 'border-l-indigo-500 shadow-sm group-hover:shadow-lg',
    blue: 'border-l-blue-500 shadow-sm group-hover:shadow-lg',
    green: 'border-l-emerald-500 shadow-sm group-hover:shadow-lg',
    emerald: 'border-l-teal-500 shadow-sm group-hover:shadow-lg',
  };
  const labelColors = {
    indigo: 'text-indigo-600/80',
    blue: 'text-blue-600/80',
    green: 'text-emerald-600/80',
    emerald: 'text-teal-600/80',
  };

  return (
    <div className={`group relative overflow-hidden bg-white rounded-2xl border border-neutral-200 border-l-[4px] p-5 cursor-default transition-all duration-400 transform hover:-translate-y-1 ${colors[color] || colors.indigo}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className={`text-[10px] font-semibold uppercase tracking-widest transition-colors ${labelColors[color] || 'text-neutral-400'}`}>{label}</span>
        <span className="text-xl transition-transform duration-300 group-hover:scale-110 drop-shadow-sm">{icon}</span>
      </div>
      <div className="text-3xl font-semibold text-neutral-950 tracking-tight relative z-10">
        {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
      </div>
    </div>
  );
}
