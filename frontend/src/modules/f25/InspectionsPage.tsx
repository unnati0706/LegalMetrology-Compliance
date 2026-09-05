import React, { useEffect, useState } from 'react';
import { apiClient } from '../../shared/api/client.js';
import { InspectionSearchBar } from './InspectionSearchBar.js';
import { InspectionFilterPanel } from './InspectionFilterPanel.js';
import { InspectionListTable } from './InspectionListTable.js';
import { InspectionDetailView } from './InspectionDetailView.js';
import { Inspection } from '../../shared/types/index.js';
import { Plus, Download, RefreshCw } from 'lucide-react';

export const InspectionsPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('ALL');
  const [category, setCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getInspections({ search, status, category });
      setInspections(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, status, category]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setCategory('ALL');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>
            Inspection History & Search
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Comprehensive repository of packaged commodity inspections, compliance trails, and evidence logs.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadData} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <InspectionSearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
        />

        <InspectionFilterPanel
          status={status}
          category={category}
          onStatusChange={setStatus}
          onCategoryChange={setCategory}
          onReset={handleResetFilters}
        />
      </div>

      {/* Selected Drawer / Drill-down View */}
      {selectedInspection && (
        <InspectionDetailView
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}

      {/* List Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ height: '60px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '60px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '60px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
        </div>
      ) : (
        <InspectionListTable
          inspections={inspections}
          onSelectInspection={(insp) => setSelectedInspection(insp)}
        />
      )}
    </div>
  );
};
