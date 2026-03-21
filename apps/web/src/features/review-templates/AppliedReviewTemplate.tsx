import type { ReviewTemplate } from '@scrambleiq/shared';

interface AppliedReviewTemplateProps {
  template: ReviewTemplate | null;
  completionByItemId: Record<string, boolean>;
  onToggleChecklistItem: (itemId: string) => void;
  onClearAppliedTemplate: () => void;
}

export function AppliedReviewTemplate({
  template,
  completionByItemId,
  onToggleChecklistItem,
  onClearAppliedTemplate,
}: AppliedReviewTemplateProps) {
  if (!template) {
    return <p>No template applied to this review session.</p>;
  }

  return (
    <section aria-labelledby="applied-review-template-heading">
      <h3 id="applied-review-template-heading">Applied Review Template</h3>
      <p>
        Active template: <strong>{template.name}</strong>
      </p>
      <ul>
        {template.checklistItems.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={completionByItemId[item.id] ?? false}
                onChange={() => onToggleChecklistItem(item.id)}
              />
              {item.label} {item.isRequired ? '(required)' : '(optional)'}
            </label>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onClearAppliedTemplate}>
        Clear Applied Template
      </button>
    </section>
  );
}
