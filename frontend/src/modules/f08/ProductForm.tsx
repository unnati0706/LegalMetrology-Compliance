import React, { useState } from 'react';
import { CategoryAutocomplete } from './CategoryAutocomplete';
import { ManufacturerLookup } from './ManufacturerLookup';
import { PackageTypeSelect } from './PackageTypeSelect';
import { FormField } from '../f04/FormField';
import { FormWrapper } from '../f04/FormWrapper';
import { ValidationSchemaRegistry } from '../f04/ValidationSchemaRegistry';
import { Package } from 'lucide-react';

interface ProductFormProps {
  initialValues?: {
    productName?: string;
    brandName?: string;
    category?: string;
    manufacturer?: string;
    packageType?: string;
    mrp?: string;
    netQuantity?: string;
  };
  onSubmit: (data: any) => Promise<void> | void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialValues, onSubmit }) => {
  const [productName, setProductName] = useState(initialValues?.productName || '');
  const [brandName, setBrandName] = useState(initialValues?.brandName || '');
  const [category, setCategory] = useState(initialValues?.category || 'Spices & Condiments');
  const [manufacturer, setManufacturer] = useState(initialValues?.manufacturer || '');
  const [packageType, setPackageType] = useState(initialValues?.packageType || 'Flexible Pouch');
  const [mrp, setMrp] = useState(initialValues?.mrp || '₹140.00');
  const [netQuantity, setNetQuantity] = useState(initialValues?.netQuantity || '500 g');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const mrpRes = ValidationSchemaRegistry.validateMrp(mrp);
    if (!mrpRes.isValid && mrpRes.error) newErrors.mrp = mrpRes.error;

    const netRes = ValidationSchemaRegistry.validateNetQuantity(netQuantity);
    if (!netRes.isValid && netRes.error) newErrors.netQuantity = netRes.error;

    if (!productName.trim()) newErrors.productName = 'Product name is mandatory.';
    if (!brandName.trim()) newErrors.brandName = 'Brand name is mandatory.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit({
        productName,
        brandName,
        category,
        manufacturer,
        packageType,
        mrp,
        netQuantity
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormWrapper
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Proceed to Multi-Side Camera Capture"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        <FormField id="prod-name" label="Product Commercial Name" required error={errors.productName}>
          <input
            id="prod-name"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Premium Chilli Powder 500g"
            className="input-text"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          />
        </FormField>

        <FormField id="brand-name" label="Brand Name" required error={errors.brandName}>
          <input
            id="brand-name"
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Priya Foods"
            className="input-text"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          />
        </FormField>
      </div>

      <CategoryAutocomplete
        value={category}
        onChange={(cat) => setCategory(cat)}
      />

      <ManufacturerLookup
        value={manufacturer}
        onChange={(mfg) => setManufacturer(mfg)}
      />

      <PackageTypeSelect
        value={packageType}
        onChange={(pkg) => setPackageType(pkg)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <FormField id="mrp-input" label="Maximum Retail Price (MRP)" required error={errors.mrp} tooltip="Rule 6(1)(e): Inclusive of all taxes">
          <input
            id="mrp-input"
            type="text"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            placeholder="e.g. ₹140.00"
            className="input-text"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          />
        </FormField>

        <FormField id="net-qty-input" label="Declared Net Quantity" required error={errors.netQuantity} tooltip="Rule 6(1)(b): Metric standard SI units">
          <input
            id="net-qty-input"
            type="text"
            value={netQuantity}
            onChange={(e) => setNetQuantity(e.target.value)}
            placeholder="e.g. 500 g"
            className="input-text"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          />
        </FormField>
      </div>
    </FormWrapper>
  );
};
