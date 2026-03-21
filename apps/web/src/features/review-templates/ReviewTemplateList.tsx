import type { ReviewTemplateMetadata } from '@scrambleiq/shared';

interface ReviewTemplateListProps {
  templates: ReviewTemplateMetadata[];
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  onEditTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onApplyTemplate: (templateId: string) => void;
  isApplyingTemplate: boolean;
}

export function ReviewTemplateList({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onApplyTemplate,
  isApplyingTemplate,
}: ReviewTemplateListProps) {
  if (templates.length === 0) {
    return <p>No review templates yet.</p>;
  }

  return (
    <ul className="match-list-results" aria-label="Review templates list">
      {templates.map((template) => (
        <li key={template.id} className="match-list-item">
          <div className="match-list-item__header">
            <div>
              <h4>{template.name}</h4>
              <p>{template.description || 'No description provided.'}</p>
              <p>Checklist items: {template.checklistItemCount}</p>
            </div>
          </div>
          <div>
            <button type="button" onClick={() => onSelectTemplate(template.id)} disabled={selectedTemplateId === template.id}>
              View Template
            </button>
            <button type="button" onClick={() => onEditTemplate(template.id)}>
              Edit Template
            </button>
            <button type="button" onClick={() => onDeleteTemplate(template.id)}>
              Delete Template
            </button>
            <button type="button" onClick={() => onApplyTemplate(template.id)} disabled={isApplyingTemplate}>
              Apply in Review Workflow
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
