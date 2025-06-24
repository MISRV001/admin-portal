import React from 'react';
import { Button } from '@/components/ui/button';
import { useConditionStore } from '@/stores/conditionStore';

const TYPE_ICONS: Record<string, string> = {
  GEOGRAPHICAL: '🌎',
  WEATHER: '⛅',
  TEMPORAL: '⏰',
  DEMOGRAPHIC: '👤',
  PURCHASE: '🛒',
  INVENTORY: '📦',
};
const TYPE_COLORS: Record<string, string> = {
  GEOGRAPHICAL: 'text-blue-600',
  WEATHER: 'text-cyan-600',
  TEMPORAL: 'text-yellow-600',
  DEMOGRAPHIC: 'text-pink-600',
  PURCHASE: 'text-green-600',
  INVENTORY: 'text-purple-600',
};

export const ConditionCard: React.FC<{
  condition: any;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ condition, onEdit, onDelete }) => {
  const { toggleCondition } = useConditionStore();
  const icon = TYPE_ICONS[condition.type] || '⚡';
  const color = TYPE_COLORS[condition.type] || 'text-gray-600';
  // Type-specific summary
  let summary = '';
  if (condition.typeValues) {
    summary = Object.entries(condition.typeValues)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
  }
  return (
    <div className={`border rounded-lg p-4 bg-white shadow flex flex-col gap-2`} aria-label={`Condition: ${condition.name}`}>
      <div className="flex items-center gap-2">
        <span className={`text-2xl ${color}`}>{icon}</span>
        <span className="font-bold text-blue-700 flex-1">{condition.name}</span>
        <Button size="sm" variant={condition.enabled ? 'default' : 'outline'} aria-pressed={condition.enabled} onClick={() => toggleCondition(condition.id)}>
          {condition.enabled ? 'Enabled' : 'Disabled'}
        </Button>
      </div>
      <div className="text-xs text-gray-500 mb-1">{condition.type}</div>
      {summary && <div className="text-xs text-gray-700 mb-1">{summary}</div>}
      <div className="text-xs text-gray-400">Operator: {condition.operator}</div>
      <div className="text-xs text-gray-400">Values: {Array.isArray(condition.values) ? condition.values.join(', ') : ''}</div>
      <div className="text-xs text-gray-400">Reach: {condition.reach ?? 'N/A'}</div>
      <div className="flex gap-2 mt-2">
        {onEdit && <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>}
        {onDelete && <Button size="sm" variant="destructive" onClick={onDelete}>Delete</Button>}
      </div>
    </div>
  );
};
