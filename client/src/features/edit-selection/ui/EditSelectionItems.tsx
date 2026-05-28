'use client';

import { reorderSelectionItems, updateSelectionItemComment } from '@/entities/client-selection';
import type { ClientSelection } from '@/entities/client-selection';

export function EditSelectionItems({ selection, onUpdated }: { selection: ClientSelection; onUpdated: (value: ClientSelection) => void }) {
  const move = async (index: number, direction: number) => {
    const items = [...selection.items];
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    const result = await reorderSelectionItems(selection.id, items.map((item, order) => ({ itemId: item.id, order })));
    onUpdated(result);
  };

  return (
    <div className="space-y-2">
      {selection.items.map((item, index) => (
        <div key={item.id} className="border border-border rounded-lg p-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span>{item.property.title}</span>
            <div className="flex gap-1">
              <button onClick={() => move(index, -1)} className="px-2 py-1 border rounded">↑</button>
              <button onClick={() => move(index, 1)} className="px-2 py-1 border rounded">↓</button>
            </div>
          </div>
          <textarea
            defaultValue={item.agentComment || ''}
            aria-label={`Agent comment for ${item.property.title}`}
            onBlur={async (e) => {
              if ((item.agentComment || '') === e.target.value) return;
              onUpdated(await updateSelectionItemComment(selection.id, item.id, e.target.value));
            }}
            className="w-full mt-2 px-2 py-1 border border-border rounded"
          />
        </div>
      ))}
    </div>
  );
}
