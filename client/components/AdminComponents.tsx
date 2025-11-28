import React, { useState, useEffect } from 'react';
// Simple modal for advanced filtering
function FilterModal({ open, onClose, onApply, filters, setFilters, categories }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Advanced Filters</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={filters.name || ''} onChange={e => setFilters((f: any) => ({ ...f, name: e.target.value }))} />
  <input type="text" className="w-full border rounded px-3 py-2" value={filters.name || ''} onChange={e => setFilters((f: any) => ({ ...f, name: e.target.value }))} aria-label="Filter by name" />
          </div>
          {categories && (
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border rounded px-3 py-2" value={filters.category || ''} onChange={e => setFilters((f: any) => ({ ...f, category: e.target.value }))}>
                <option value="">All</option>
                {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Min Price</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={filters.minPrice || ''} onChange={e => setFilters((f: any) => ({ ...f, minPrice: e.target.value }))} />
  <input type="number" className="w-full border rounded px-3 py-2" value={filters.minPrice || ''} onChange={e => setFilters((f: any) => ({ ...f, minPrice: e.target.value }))} aria-label="Minimum price" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Max Price</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={filters.maxPrice || ''} onChange={e => setFilters((f: any) => ({ ...f, maxPrice: e.target.value }))} />
  <input type="number" className="w-full border rounded px-3 py-2" value={filters.maxPrice || ''} onChange={e => setFilters((f: any) => ({ ...f, maxPrice: e.target.value }))} aria-label="Maximum price" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 rounded bg-slate-200" onClick={onClose}>Cancel</button>
  <button className="px-4 py-2 rounded bg-slate-200" onClick={onClose} aria-label="Cancel filter modal" tabIndex={0}>Cancel</button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onApply}>Apply</button>
  <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onApply} aria-label="Apply filters" tabIndex={0}>Apply</button>
        </div>
      </div>
    </div>
  );
}
import {
  Plus, Edit, Trash2, Search, Filter, Download, Upload, 
  MoreHorizontal, Eye, CheckCircle, XCircle, Clock,
  Users, Package, FileText, MessageSquare, Star,
  Calendar, DollarSign, TrendingUp, AlertCircle
} from 'lucide-react';
import { ModernButton } from './ui/modern-button';
import { ModernInput, ModernTextarea } from './ui/modern-input';
import { FormField, useFormValidation, validators, composeValidators } from './FormValidation';
import { 
  InlineLoading, 
  TableSkeleton, 
  ErrorState, 
  EmptyState,
  ServiceCardSkeleton 
} from './LoadingStates';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Service, Product, Quote, User, ContactMessage, Testimonial } from '@shared/api';

interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
  }>;
  loading?: boolean;
  error?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  searchable?: boolean;
  filterable?: boolean;
  bulkActions?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  loading,
  error,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  filterable = false,
  bulkActions = false,
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number | string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  // For demo: extract categories from data
  const categories = Array.from(new Set((data as any[]).map((d: any) => d.category).filter(Boolean)));

  // Filter and sort data
  const processedData = React.useMemo(() => {
    let filtered = data;
    // Advanced filters
    if (filters.name) {
      filtered = filtered.filter((item: any) =>
        String(item.name || '').toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.category) {
      filtered = filtered.filter((item: any) => item.category === filters.category);
    }
    if (filters.minPrice) {
      filtered = filtered.filter((item: any) => Number(item.price) >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((item: any) => Number(item.price) <= Number(filters.maxPrice));
    }
    // Search filtering
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    // Sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof T];
        const bVal = b[sortConfig.key as keyof T];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchTerm, sortConfig, filters]);

  const handleSort = (key: keyof T | string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectedItems.size === processedData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(processedData.map(item => item.id)));
    }
  };

  // Bulk delete handler (assumes /api/products supports bulk delete)
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!window.confirm(`Delete ${selectedItems.size} selected items? This cannot be undone.`)) return;
    try {
      // If backend supports bulk delete, replace with a single API call
      // await api.products.bulkDelete(Array.from(selectedItems));
      // Otherwise, delete one by one
      await Promise.all(Array.from(selectedItems).map(id => api.products.delete(Number(id))));
      toast.success('Selected items deleted');
      setSelectedItems(new Set());
      window.location.reload();
    } catch (err: any) {
      toast.error('Bulk delete failed');
    }
  };

  const handleSelectItem = (id: number | string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  if (loading) return <TableSkeleton rows={5} columns={columns.length} />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        {searchable && (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <ModernInput
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Search table"
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {bulkActions && selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                {selectedItems.size} selected
              </span>
              <ModernButton variant="outline" size="sm" onClick={handleBulkDelete} aria-label="Bulk delete selected rows" tabIndex={0}>
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </ModernButton>
            </div>
          )}
          
          <ModernButton variant="outline" size="sm" aria-label="Export table data" tabIndex={0}>
            <Download className="w-4 h-4" />
            Export
          </ModernButton>
          
          {filterable && (
            <ModernButton variant="outline" size="sm" onClick={() => setFilterModalOpen(true)} aria-label="Open filter modal" tabIndex={0}>
              <Filter className="w-4 h-4" />
              Filter
            </ModernButton>
          )}
      {/* Advanced Filter Modal */}
      <FilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={() => setFilterModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
        categories={categories}
      />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden" role="region" aria-label="Data Table">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Admin Data Table">
            <thead className="bg-slate-50 border-b border-slate-200" role="rowgroup">
              <tr role="row">
                {bulkActions && (
                  <th className="w-12 px-4 py-3" scope="col">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === processedData.length && processedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300"
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key as string}
                    className={`px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-slate-100' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                    scope="col"
                    tabIndex={column.sortable ? 0 : undefined}
                    aria-sort={column.sortable && sortConfig?.key === column.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                    aria-label={column.label + (column.sortable ? ', sortable' : '')}
                    role="columnheader"
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-slate-400" aria-hidden="true">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-20 px-4 py-3 text-right" scope="col" role="columnheader">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200" role="rowgroup">
              {processedData.length === 0 ? (
                <tr role="row">
                  <td colSpan={columns.length + (bulkActions ? 2 : 1)} className="px-4 py-12">
                    <EmptyState
                      title="No results found"
                      description={emptyMessage}
                    />
                  </td>
                </tr>
              ) : (
                processedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50" role="row">
                    {bulkActions && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="rounded border-slate-300"
                          aria-label={`Select row for ${item.id}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key as string} className="px-4 py-3 text-sm">
                        {column.render 
                          ? column.render(item)
                          : String(item[column.key as keyof T] || '-')
                        }
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                            title="View"
                            aria-label={`View details for ${item.id}`}
                            tabIndex={0}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1 text-slate-400 hover:text-blue-600"
                            title="Edit"
                            aria-label={`Edit ${item.id}`}
                            tabIndex={0}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Delete"
                            aria-label={`Delete ${item.id}`}
                            tabIndex={0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Status badge component
interface StatusBadgeProps {
  status: string;
  type?: 'quote' | 'contact' | 'user' | 'default';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default' }) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'quote':
        switch (status) {
          case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
          case 'reviewed': return { bg: 'bg-blue-100', text: 'text-blue-800', icon: Eye };
          case 'approved': return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
          case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
          default: return { bg: 'bg-slate-100', text: 'text-slate-800', icon: AlertCircle };
        }
      case 'contact':
        switch (status) {
          case 'unread': return { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle };
          case 'read': return { bg: 'bg-blue-100', text: 'text-blue-800', icon: Eye };
          case 'replied': return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
          default: return { bg: 'bg-slate-100', text: 'text-slate-800', icon: AlertCircle };
        }
      case 'user':
        switch (status) {
          case 'active': return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
          case 'inactive': return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
          default: return { bg: 'bg-slate-100', text: 'text-slate-800', icon: AlertCircle };
        }
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-800', icon: AlertCircle };
    }
  };

  const { bg, text, icon: Icon } = getStatusConfig();

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

// Quick stats component
interface QuickStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    change?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            {stat.change && (
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-600">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Modal component for forms
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Export/Import functionality
export const useDataExport = () => {
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { exportToCSV, exportToJSON };
};