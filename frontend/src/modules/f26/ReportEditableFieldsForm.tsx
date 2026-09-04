import React from 'react';
import { Settings2, HelpCircle } from 'lucide-react';

interface ReportEditableOptions {
  includeEvidenceThumbnails: boolean;
  legalNoticeHeader: boolean;
  officerRemarks: string;
}

interface ReportEditableFieldsFormProps {
  options: ReportEditableOptions;
  onChange: (newOptions: ReportEditableOptions) => void;
  disabled?: boolean;
}

export const ReportEditableFieldsForm: React.FC<ReportEditableFieldsFormProps> = ({
  options,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Settings2 size={18} color="var(--color-primary-light)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Report Customization & Statutory Flags</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="checkbox"
            id="legalNoticeHeader"
            checked={options.legalNoticeHeader}
            onChange={(e) => onChange({ ...options, legalNoticeHeader: e.target.checked })}
            disabled={disabled}
            style={{ width: '1.1rem', height: '1.1rem', cursor: disabled ? 'not-allowed' : 'pointer' }}
          />
          <label htmlFor="legalNoticeHeader" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
            Include Official DoCA Statutory Legal Notice Header & Watermark
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="checkbox"
            id="includeEvidenceThumbnails"
            checked={options.includeEvidenceThumbnails}
            onChange={(e) => onChange({ ...options, includeEvidenceThumbnails: e.target.checked })}
            disabled={disabled}
            style={{ width: '1.1rem', height: '1.1rem', cursor: disabled ? 'not-allowed' : 'pointer' }}
          />
          <label htmlFor="includeEvidenceThumbnails" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
            Attach Cryptographically Tagged Evidence Thumbnails (PDP & Declarations)
          </label>
        </div>

        <div>
          <label htmlFor="officerRemarks" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Statutory Assessment & Directions / Officer Remarks
          </label>
          <textarea
            id="officerRemarks"
            rows={3}
            className="form-input"
            value={options.officerRemarks}
            onChange={(e) => onChange({ ...options, officerRemarks: e.target.value })}
            disabled={disabled}
            placeholder="Enter statutory directives, compounding notice references, or verification sign-off notes..."
            style={{ width: '100%', resize: 'vertical', fontSize: '0.85rem' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <HelpCircle size={12} />
            <span>Remarks will be baked into the immutable PDF digital signature payload.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
