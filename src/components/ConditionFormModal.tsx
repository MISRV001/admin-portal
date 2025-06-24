import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConditionTypeFields } from './ConditionTypeFields';

const CONDITION_TYPES = [
  'GEOGRAPHICAL',
  'WEATHER',
  'TEMPORAL',
  'DEMOGRAPHIC',
  'PURCHASE',
  'INVENTORY',
];
const OPERATORS = ['IN', 'NOT IN', 'EQUALS', 'NOT EQUALS'];

export const ConditionFormModal: React.FC<{
  onClose: () => void;
  onSave: (cond: any) => void;
  initial?: any;
}> = ({ onClose, onSave, initial }) => {
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState(initial?.type || CONDITION_TYPES[0]);
  const [operator, setOperator] = useState(initial?.operator || OPERATORS[0]);
  const [values, setValues] = useState(initial?.values ? initial.values.join(', ') : '');
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeValues, setTypeValues] = useState<any>(initial?.typeValues || {});

  useEffect(() => {
    setName(initial?.name || '');
    setType(initial?.type || CONDITION_TYPES[0]);
    setOperator(initial?.operator || OPERATORS[0]);
    setValues(initial?.values ? initial.values.join(', ') : '');
    setEnabled(initial?.enabled ?? true);
    setTypeValues(initial?.typeValues || {});
    setError(null);
  }, [initial]);

  useEffect(() => {
    setTypeValues({}); // Reset type-specific fields on type change
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    try {
      const cond = {
        ...(initial || {}),
        name: name.trim(),
        type,
        operator,
        values: values.split(',').map((v: string) => v.trim()).filter(Boolean),
        enabled,
        typeValues,
      };
      await onSave(cond);
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <div className="font-bold text-lg mb-4">{initial ? 'Edit Condition' : 'Add Condition'}</div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded p-2" disabled={loading}>
              {CONDITION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Operator</label>
            <select value={operator} onChange={e => setOperator(e.target.value)} className="w-full border rounded p-2" disabled={loading}>
              {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Values (comma separated)</label>
            <Input value={values} onChange={e => setValues(e.target.value)} disabled={loading} />
          </div>
          {/* Type-specific fields */}
          <ConditionTypeFields type={type} values={typeValues} setValues={setTypeValues} />
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} disabled={loading} id="enabled" />
            <label htmlFor="enabled" className="text-sm">Enabled</label>
          </div>
          {/* Preview section */}
          <div className="bg-gray-50 rounded p-3 text-xs text-gray-700">
            <div className="font-semibold mb-1">Preview:</div>
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify({ name, type, operator, values: values.split(','), enabled, ...typeValues }, null, 2)}</pre>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
