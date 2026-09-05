import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EntityDeclarationCard } from './EntityDeclarationCard.js';
import { ConsumerCareCard } from './ConsumerCareCard.js';
import { EntityDeclarationDetails, ConsumerCareDetails } from '../../shared/types/index.js';

const sampleEntityData: EntityDeclarationDetails = {
  type: 'MANUFACTURER',
  legalName: 'Priya Foods Ltd',
  completeAddress: 'Plot No. 42, Sector 4, Industrial Area, Pune, Maharashtra - 411028',
  hasPinCode: true,
  pinCode: '411028',
  countryOfOrigin: 'India',
  status: 'COMPLIANT',
  remarks: [
    'Complete postal address includes premise number, street, city, state and valid 6-digit postal index code.',
    'Entity role is unequivocally declared as "Manufactured by".',
    'Origin verification confirms domestic packaging location in Pune, Maharashtra.'
  ]
};

const sampleCareData: ConsumerCareDetails = {
  officerNameOrDesignation: 'Manager, Consumer Grievance Cell',
  contactNumber: '1800-200-1122',
  isTollFreeOrValidPhone: true,
  emailAddress: 'care@priyafoods.in',
  isEmailValid: true,
  postalAddress: 'Priya Foods Consumer Care, Sector 4, Pune - 411028',
  status: 'COMPLIANT',
  remarks: [
    'Toll-free customer care phone number is operational and prominently declared.',
    'Email address complies with standard electronic mail syntax.',
    'Physical redressal address declared in compliance with Rule 6(1)(n).'
  ]
};

export const EntityConsumerCarePage: React.FC = () => {
  const { id = 'insp-sample-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [entityData] = useState<EntityDeclarationDetails>(sampleEntityData);
  const [careData] = useState<ConsumerCareDetails>(sampleCareData);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Entity Identity & Consumer Care Verification
            </h1>
            <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-700, #1d4ed8)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              Entity & Redressal
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Statutory validation of manufacturer / packer / importer addresses, PIN codes, country of origin, and consumer care channels.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate(`/inspections/${id}/dates-readability`)} className="btn btn-primary">
            Dates & Readability →
          </button>
        </div>
      </div>

      <EntityDeclarationCard data={entityData} />
      <ConsumerCareCard data={careData} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button onClick={() => navigate(`/inspections/${id}/mrp-quantity`)} className="btn btn-secondary">
          ← Back to MRP & Net Quantity
        </button>
        <button onClick={() => navigate(`/inspections/${id}/dates-readability`)} className="btn btn-primary">
          Proceed to Dates & Readability →
        </button>
      </div>
    </div>
  );
};
