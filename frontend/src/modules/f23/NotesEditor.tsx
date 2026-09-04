import React, { useState } from 'react';
import { Tag, Send, Mic, Sparkles } from 'lucide-react';

interface NotesEditorProps {
  onAddNote: (text: string, ruleTags: string[]) => Promise<void>;
  isSubmitting?: boolean;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  onAddNote,
  isSubmitting = false,
}) => {
  const [text, setText] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const presetTags = [
    'Rule 6(1)(a) Mfg Address',
    'Rule 6(1)(e) MRP & USP',
    'Rule 6(1)(h) Net Qty',
    'Rule 7 Font Size',
    'Physical Sample',
    'Retail Shelf Check',
    'Warehouse Verification'
  ];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(tagInput.trim())) {
        setSelectedTags([...selectedTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleVoiceSim = () => {
    setIsRecording(true);
    setTimeout(() => {
      setText((prev) => prev + (prev ? ' ' : '') + 'Verified physical specimen in retail outlet: MRP sticker altered over original print.');
      setIsRecording(false);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onAddNote(text.trim(), selectedTags);
    setText('');
    setSelectedTags([]);
  };

  return (
    <div className="card">
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Tag size={18} color="var(--color-primary-500)" />
        Add Inspector Observation / Annotation
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Type field inspection notes, sensory observations, packaging defects, or merchant statements..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Tag Selection */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Attach Statutory Rule / Inspection Tags:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
            {presetTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: active ? '1px solid var(--color-primary-500)' : '1px solid var(--border-light)',
                    backgroundColor: active ? 'var(--color-primary-50)' : 'var(--bg-app)',
                    color: active ? 'var(--color-primary-700)' : 'var(--text-main)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            className="form-input"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            placeholder="Type custom tag and press Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddCustomTag}
          />
        </div>

        {/* Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleVoiceSim}
            className="btn btn-secondary btn-sm"
            disabled={isRecording || isSubmitting}
            title="Speech to Text Simulation"
          >
            <Mic size={14} color={isRecording ? 'red' : 'inherit'} />
            {isRecording ? 'Listening...' : 'Voice Note'}
          </button>

          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className="btn btn-primary btn-sm"
          >
            <Send size={14} />
            {isSubmitting ? 'Posting...' : 'Post Observation'}
          </button>
        </div>
      </form>
    </div>
  );
};
