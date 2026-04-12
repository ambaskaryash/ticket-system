import { useState, useMemo } from 'react';
import { getStatusConfig, getPriorityConfig } from './StatsCard';
import { getSLAStatus } from '../utils/sla';
import SLAProgressBar from './SLAProgressBar';

const SortIcon = ({ active, direction }) => (
  <svg className={`ml-1 inline size-4 transition ${active ? 'text-neutral-950' : 'text-neutral-300 group-hover:text-neutral-400'}`} viewBox="0 0 20 20" fill="currentColor">
    {direction === 'asc' ? (
      <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
    ) : (
      <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
    )}
  </svg>
);

function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

const SORTABLE_COLUMNS = [
  { key: 'subject', label: 'Subject' },
  { key: 'name', label: 'Reporter' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'agent', label: 'Agent' },
  { key: 'createdAt', label: 'Created' },
  { key: 'sla', label: 'SLA' },
];

const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const STATUS_ORDER = { Open: 0, 'In Progress': 1, Resolved: 2 };

export default function TicketTable({ tickets, onTicketClick, selectedIds, onSelect, onEmailClick }) {
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'createdAt' ? 'desc' : 'asc');
    }
  };

  const sorted = useMemo(() => {
    return [...tickets].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'priority':
          cmp = (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
          break;
        case 'status':
          cmp = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'sla': {
          const slaA = getSLAStatus(a);
          const slaB = getSLAStatus(b);
          cmp = (slaA.percent ?? 0) - (slaB.percent ?? 0);
          break;
        }
        default:
          cmp = (a[sortKey] || '').localeCompare(b[sortKey] || '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [tickets, sortKey, sortDir]);

  const handleCheckbox = (e, ticket) => {
    e.stopPropagation();
    onSelect?.(ticket);
  };

  return (
    <div className="rounded-2xl ring-1 ring-neutral-950/5 overflow-hidden">
      <div className="-mx-0 overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-950/5">
          <thead className="bg-neutral-50">
            <tr>
              {/* Checkbox column */}
              <th scope="col" className="w-10 py-3.5 pl-4 pr-1">
                <span className="sr-only">Select</span>
              </th>
              {SORTABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-950"
                >
                  <button
                    onClick={() => handleSort(col.key)}
                    className="group inline-flex items-center cursor-pointer hover:text-neutral-700 transition"
                  >
                    {col.label}
                    <SortIcon active={sortKey === col.key} direction={sortKey === col.key ? sortDir : 'asc'} />
                  </button>
                </th>
              ))}
              <th scope="col" className="relative py-3.5 pl-3 pr-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-950/5 bg-white">
            {sorted.map((ticket) => {
              const sc = getStatusConfig(ticket.status);
              const pc = getPriorityConfig(ticket.priority);
              const sla = getSLAStatus(ticket);
              const isSelected = selectedIds?.has(ticket.id);

              return (
                <tr
                  key={ticket.id}
                  onClick={() => onTicketClick?.(ticket)}
                  className={`cursor-pointer transition hover:bg-neutral-50 ${isSelected ? 'bg-neutral-50' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="py-4 pl-4 pr-1">
                    <button
                      onClick={(e) => handleCheckbox(e, ticket)}
                      className={`size-4 rounded border flex items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-950 border-neutral-950'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {isSelected && (
                        <svg className="size-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </td>

                  {/* Subject */}
                  <td className="py-4 pr-3 pl-3 text-sm">
                    <div className="font-semibold text-neutral-950 truncate max-w-[200px]">{ticket.subject || 'No subject'}</div>
                    {ticket.course && (
                      <span className="text-xs text-neutral-400">{ticket.course}</span>
                    )}
                  </td>

                  {/* Reporter */}
                  <td className="px-3 py-4 text-sm text-neutral-600 whitespace-nowrap">
                    {ticket.name || '—'}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                      <svg viewBox="0 0 6 6" aria-hidden="true" className={`size-1.5 ${sc.dot.replace('bg-', 'fill-')}`}>
                        <circle r={3} cx={3} cy={3} />
                      </svg>
                      {sc.label}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                      <svg viewBox="0 0 6 6" aria-hidden="true" className={`size-1.5 ${pc.dot.replace('bg-', 'fill-')}`}>
                        <circle r={3} cx={3} cy={3} />
                      </svg>
                      {pc.label}
                    </span>
                  </td>

                  {/* Agent */}
                  <td className="px-3 py-4 text-sm text-neutral-600 whitespace-nowrap">
                    {ticket.agent ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded border border-neutral-200 bg-white text-[0.5rem] font-medium text-neutral-950">
                          {ticket.agent.charAt(0).toUpperCase()}
                        </span>
                        {ticket.agent}
                      </span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="px-3 py-4 text-sm text-neutral-500 whitespace-nowrap">
                    {timeAgo(ticket.createdAt)}
                  </td>

                  {/* SLA */}
                  <td className="px-3 py-4">
                    <SLAProgressBar sla={sla} compact />
                  </td>

                  {/* Actions */}
                  <td className="py-4 pr-4 pl-3 text-right whitespace-nowrap">
                    {ticket.email && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onEmailClick?.(ticket); }}
                        className="text-neutral-400 hover:text-neutral-600 transition cursor-pointer p-1"
                        title="Reply"
                      >
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sorted.length === 0 && (
        <div className="py-10 text-center text-sm text-neutral-400">No tickets to display</div>
      )}
    </div>
  );
}
