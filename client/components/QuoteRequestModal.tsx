import React from 'react';
import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateQuote } from '../../shared/api';

const quoteRequestSchema = z.object({
  project_name: z.string().min(2, 'Project name is required'),
  client_name: z.string().min(2, 'Client name is required'),
  company_name: z.string().optional(),
  description: z.string().min(10, 'Please provide a brief description'),
  requirements: z.string().optional(),
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
  status: z.enum(['pending', 'reviewed', 'approved', 'rejected']).optional(),
  service_id: z.number().optional(),
  estimated_cost: z.number().optional(),
  notes: z.string().optional(),
});

type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;

// Transform form data to API format
const transformFormDataToApiFormat = (data: QuoteRequestFormData): CreateQuote => {
  return {
    project_name: data.project_name,
    description: `${data.client_name}${data.company_name ? ` (${data.company_name})` : ''}\n\n${data.description}`,
    requirements: data.requirements,
    budget_range: data.budget_range,
    timeline: data.timeline,
    status: 'pending',
    service_id: data.service_id,
    notes: data.notes,
  };
};

interface QuoteItem {
  id: number;
  name: string;
  description?: string;
}

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: QuoteItem[];
  type: 'service' | 'product';
  onSubmit: (data: CreateQuote) => Promise<void>;
}

export function QuoteRequestModal({
  isOpen,
  onClose,
  items,
  type,
  onSubmit,
}: QuoteRequestModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestSchema),
  });

  const handleFormSubmit = async (data: QuoteRequestFormData) => {
    try {
      await onSubmit(transformFormDataToApiFormat(data));
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting quote request:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white shadow-xl overflow-hidden">
          <div className="flex flex-col h-full max-h-[90vh]">
            <div className="p-6 border-b border-gray-200">
              <Dialog.Title className="text-2xl font-semibold text-gray-900">
                Request a Quote
              </Dialog.Title>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Selected {type}s:</h3>
                  <div className="overflow-x-auto">
                    <ul className="list-disc pl-5 min-w-max">
                      {items.map((item) => (
                        <li key={item.id} className="text-gray-700 mb-1">
                          <span className="font-medium">{item.name}</span>
                          {item.description && (
                            <span className="text-gray-500 text-sm ml-2">- {item.description}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Client Name *</label>
                <input
                  type="text"
                  {...register('client_name')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter client name"
                />
                {errors.client_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.client_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  {...register('company_name')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter company name (optional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Project Name *</label>
              <input
                type="text"
                {...register('project_name')}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter project name"
              />
              {errors.project_name && (
                <p className="text-red-500 text-sm mt-1">{errors.project_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Please describe your project requirements"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Specific Requirements</label>
              <textarea
                {...register('requirements')}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Any specific requirements or technical specifications?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Budget Range</label>
              <select
                {...register('budget_range')}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select budget range</option>
                <option value="Under 100K">Under 100K KSH</option>
                <option value="100K - 500K">100K - 500K KSH</option>
                <option value="500K - 1M">500K - 1M KSH</option>
                <option value="1M - 5M">1M - 5M KSH</option>
                <option value="Above 5M">Above 5M KSH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Timeline</label>
              <select
                {...register('timeline')}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select expected timeline</option>
                <option value="Immediate">Immediate</option>
                <option value="Within 1 month">Within 1 month</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6+ months">6+ months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Any additional information you'd like to share?"
              />
            </div>

            <input
              type="hidden"
              {...register('status')}
              value="pending"
            />

            {items.length === 1 && (
              <input
                type="hidden"
                {...register('service_id', { valueAsNumber: true })}
                value={items[0].id}
              />
            )}

            <div className="sticky bottom-0 bg-white pt-4 pb-3 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Dialog.Panel>
  </div>
</Dialog>
);
}
