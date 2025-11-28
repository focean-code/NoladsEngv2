import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { Quote } from '../../shared/api';
import { Dialog } from '@headlessui/react';

interface QuoteRequest {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  message: string | null;
  items: Array<{ id: number; name: string }>;
  type: 'service' | 'product';
  status: 'new' | 'viewed' | 'contacted' | 'completed';
  total_amount: number | null;
  notes: string | null;
  assigned_to: number | null;
  assigned_first_name: string | null;
  assigned_last_name: string | null;
  created_at: string;
  updated_at: string;
}

export function QuoteRequestsAdmin() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuoteRequests();
  }, []);

  const fetchQuoteRequests = async () => {
    try {
  const res = await (await import('../lib/api')).api.quotes.getAll();
  if (!res.success) throw new Error(res.error || 'Failed to fetch quote requests');
  const quotes = (res.data || []) as Quote[];
  // Map Quote -> QuoteRequest
  const mapped = quotes.map((q) => ({
    id: q.id,
    name: (q as any).user_name || 'Unknown',
    email: (q as any).user_email || '',
    phone: null,
    company_name: null,
    message: q.description || null,
    items: q.service_id ? [{ id: q.service_id, name: (q as any).service_name || 'Service' }] : [],
    type: 'service' as const,
    status: (q.status === 'pending' ? 'new' : q.status === 'reviewed' ? 'viewed' : q.status === 'approved' ? 'contacted' : 'completed') as QuoteRequest['status'],
    total_amount: q.estimated_cost ?? null,
    notes: q.notes ?? null,
    assigned_to: null,
    assigned_first_name: null,
    assigned_last_name: null,
    created_at: q.created_at,
    updated_at: q.updated_at,
  }));
  setRequests(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const [users, setUsers] = useState<Array<{ id: number; first_name: string; last_name: string }>>([]);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
  const res = await (await import('../lib/api')).api.users.getAll();
  if (res.success) setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const updateQuoteRequest = async (id: number, data: Partial<QuoteRequest>) => {
    try {
  // Translate local fields back to Quote fields
  const payload: any = {};
  if (data.status !== undefined) {
    payload.status = data.status === 'new' ? 'pending' : data.status === 'viewed' ? 'reviewed' : data.status === 'contacted' ? 'approved' : 'rejected';
  }
  if (data.total_amount !== undefined) payload.estimated_cost = data.total_amount;
  if (data.notes !== undefined) payload.notes = data.notes;

  const res = await (await import('../lib/api')).api.quotes.update(id, payload as any);
  if (!res.success) throw new Error(res.error || 'Failed to update quote request');
  // Update local mapped state
  setRequests(requests.map(req => req.id === id ? { ...req, ...data, ...(res.data ? { updated_at: (res.data as any).updated_at } : {}) } : req));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quote request');
    }
  };

  const handleViewDetails = async (request: QuoteRequest) => {
    try {
  const res = await (await import('../lib/api')).api.quotes.getAll();
  if (!res.success) throw new Error(res.error || 'Failed to fetch quote request details');
  const all = res.data || [];
  const q = all.find((x: Quote) => x.id === request.id) as Quote | undefined;
  if (!q) throw new Error('Quote not found');
  const mapped = {
    id: q.id,
    name: (q as any).user_name || 'Unknown',
    email: (q as any).user_email || '',
    phone: null,
    company_name: null,
    message: q.description || null,
    items: q.service_id ? [{ id: q.service_id, name: (q as any).service_name || 'Service' }] : [],
    type: 'service' as const,
    status: (q.status === 'pending' ? 'new' : q.status === 'reviewed' ? 'viewed' : q.status === 'approved' ? 'contacted' : 'completed') as QuoteRequest['status'],
    total_amount: q.estimated_cost ?? null,
    notes: q.notes ?? null,
    assigned_to: null,
    assigned_first_name: null,
    assigned_last_name: null,
    created_at: q.created_at,
    updated_at: q.updated_at,
  };
  setSelectedRequest(mapped as any);
  setIsDetailsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch details');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Quote Requests</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div>{request.name}</div>
                  {request.company_name && (
                    <div className="text-gray-500 text-xs">{request.company_name}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div>{request.email}</div>
                  {request.phone && <div className="text-gray-500">{request.phone}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                  {request.type}
                </td>
                <td className="px-6 py-4 text-sm">
                  <ul className="list-disc pl-5">
                    {request.items.map((item) => (
                      <li key={item.id}>{item.name}</li>
                    ))}
                  </ul>
                  {request.total_amount && (
                    <div className="text-gray-500 mt-2">
                      Amount: ${request.total_amount.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={request.status}
                    onChange={(e) => updateQuoteRequest(request.id, { status: e.target.value as QuoteRequest['status'] })}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="viewed">Viewed</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    {request.assigned_to ? (
                      <>Assigned: {request.assigned_first_name} {request.assigned_last_name}</>
                    ) : (
                      'Unassigned'
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-y-2">
                  <button
                    onClick={() => window.location.href = `mailto:${request.email}`}
                    className="block text-blue-600 hover:text-blue-800"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="block text-gray-600 hover:text-gray-800"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <Dialog
          open={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl rounded bg-white p-6 shadow-xl">
              <Dialog.Title className="text-xl font-semibold mb-4 flex justify-between items-center">
                <span>Quote Request Details</span>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </Dialog.Title>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Contact Information</h3>
                    <div className="mt-2 space-y-1">
                      <p>Name: {selectedRequest.name}</p>
                      <p>Email: {selectedRequest.email}</p>
                      <p>Phone: {selectedRequest.phone || 'Not provided'}</p>
                      <p>Company: {selectedRequest.company_name || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Quote Details</h3>
                    <div className="mt-2 space-y-1">
                      <p>Type: <span className="capitalize">{selectedRequest.type}</span></p>
                      <p>Status: <span className="capitalize">{selectedRequest.status}</span></p>
                      <p>Amount: {selectedRequest.total_amount ? 
                        `KSH ${selectedRequest.total_amount.toFixed(2)}` : 
                        'Not specified'}</p>
                      <p>Created: {format(new Date(selectedRequest.created_at), 'PPpp')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Selected {selectedRequest.type}s</h3>
                  <ul className="list-disc pl-5">
                    {selectedRequest.items.map((item) => (
                      <li key={item.id}>{item.name}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Message</h3>
                  <p className="whitespace-pre-wrap">
                    {selectedRequest.message || 'No message provided'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-medium mb-1">Assign To</label>
                    <select
                      value={selectedRequest.assigned_to || ''}
                      onChange={(e) => updateQuoteRequest(selectedRequest.id, {
                        assigned_to: e.target.value ? Number(e.target.value) : null
                      })}
                      className="w-full rounded-md border-gray-300 shadow-sm"
                    >
                      <option value="">Unassigned</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Internal Notes</label>
                    <textarea
                      value={selectedRequest.notes || ''}
                      onChange={(e) => updateQuoteRequest(selectedRequest.id, {
                        notes: e.target.value
                      })}
                      rows={4}
                      className="w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Add internal notes here..."
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Update Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={selectedRequest.total_amount || ''}
                      onChange={(e) => updateQuoteRequest(selectedRequest.id, {
                        total_amount: e.target.value ? Number(e.target.value) : null
                      })}
                      className="w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Enter amount..."
                    />
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
}
