import { useState } from 'react';
import { CheckCircle2, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';

const defaultItem = {
  brand: '',
  description: '',
  targetPrice: '',
  quantity: 1,
};

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  company: '',
  gst: '',
  address: '',
  pincode: '',
  city: '',
  state: '',
  agentAssist: false,
  items: [{ ...defaultItem }],
};

const RequestQuotePage = () => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const [serverError, setServerError] = useState('');

  const onFieldChange = event => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const onItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...defaultItem }],
    }));
  };

  const removeItemRow = index => {
    setFormData(prev => {
      if (prev.items.length === 1) {
        return prev;
      }

      return {
        ...prev,
        items: prev.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const validateForm = () => {
    const nextErrors = {};
    const requiredFields = ['fullName', 'phone', 'email', 'company', 'pincode', 'city', 'state'];

    requiredFields.forEach(field => {
      if (!String(formData[field] || '').trim()) {
        nextErrors[field] = 'This field is required';
      }
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      nextErrors.phone = 'Enter a valid 10-digit phone number';
    }

    const hasValidItem = formData.items.some(
      item => String(item.description || '').trim() && Number(item.quantity) > 0
    );

    if (!hasValidItem) {
      nextErrors.items = 'Add at least one item with description and quantity';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async event => {
    event.preventDefault();
    setServerError('');
    setSuccessId(null);

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formData,
      phone: formData.phone.replace(/\D/g, ''),
      items: formData.items
        .filter(item => item.description && Number(item.quantity) > 0)
        .map(item => ({
          brand: item.brand?.trim() || null,
          description: item.description.trim(),
          targetPrice: item.targetPrice ? Number(item.targetPrice) : null,
          quantity: Number(item.quantity),
        })),
    };

    setLoading(true);
    try {
      const response = await api.submitRFQ(payload);
      setSuccessId(response?.data?.rfqId || 'Submitted');
      setFormData(initialForm);
      setErrors({});
    } catch (error) {
      setServerError(error?.message || 'Unable to submit quote request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 shadow-sm mb-4">
            <FileText size={30} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Get a Quote</h1>
          <p className="text-gray-600 mt-2">
            Share your requirement details and our team will respond with pricing quickly.
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-lg">
          {serverError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {successId && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              RFQ submitted successfully. Reference ID: <span className="font-semibold">{successId}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-7">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name" required error={errors.fullName}>
                  <Input name="fullName" value={formData.fullName} onChange={onFieldChange} />
                </Field>

                <Field label="Company" required error={errors.company}>
                  <Input name="company" value={formData.company} onChange={onFieldChange} />
                </Field>

                <Field label="Email" required error={errors.email}>
                  <Input name="email" type="email" value={formData.email} onChange={onFieldChange} />
                </Field>

                <Field label="Phone" required error={errors.phone}>
                  <Input name="phone" value={formData.phone} onChange={onFieldChange} maxLength={10} />
                </Field>

                <Field label="GST Number">
                  <Input name="gst" value={formData.gst} onChange={onFieldChange} />
                </Field>

                <Field label="Pincode" required error={errors.pincode}>
                  <Input name="pincode" value={formData.pincode} onChange={onFieldChange} />
                </Field>

                <Field label="City" required error={errors.city}>
                  <Input name="city" value={formData.city} onChange={onFieldChange} />
                </Field>

                <Field label="State" required error={errors.state}>
                  <Input name="state" value={formData.state} onChange={onFieldChange} />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Address">
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={onFieldChange}
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </Field>
              </div>

              <label className="mt-1 inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  name="agentAssist"
                  type="checkbox"
                  checked={formData.agentAssist}
                  onChange={onFieldChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Need assistance from a sales agent
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Items Required</h2>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              {errors.items && <p className="mb-3 text-sm text-red-600">{errors.items}</p>}

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-xl border border-gray-200 p-3">
                    <div className="md:col-span-3">
                      <Input
                        placeholder="Brand"
                        value={item.brand}
                        onChange={event => onItemChange(index, 'brand', event.target.value)}
                      />
                    </div>
                    <div className="md:col-span-5">
                      <Input
                        placeholder="Item description *"
                        value={item.description}
                        onChange={event => onItemChange(index, 'description', event.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Target ₹"
                        type="number"
                        min="0"
                        value={item.targetPrice}
                        onChange={event => onItemChange(index, 'targetPrice', event.target.value)}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        placeholder="Qty"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={event => onItemChange(index, 'quantity', event.target.value)}
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        disabled={formData.items.length === 1}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                        aria-label="Remove item"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting Quote...
                </>
              ) : (
                'Submit Quote Request'
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

const Field = ({ label, required = false, error, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const Input = props => (
  <input
    {...props}
    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  />
);

export default RequestQuotePage;
