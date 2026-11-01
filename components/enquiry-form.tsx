'use client';

import { useEffect, useState } from 'react';
import { useForm, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { enquirySchema, type EnquiryInput } from '@/lib/validation';
import { products } from '@/lib/products';
import { CONTACT_EMAIL } from '@/lib/company';
import { WhatsAppButton } from '@/components/whatsapp-button';

type Notice = { kind: 'success' | 'error'; text: string };

export function EnquiryForm() {
  const params = useSearchParams();
  const [notice, setNotice] = useState<Notice | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { enquiry_type: 'quotation', product_category: 'General enquiry' },
  });

  useEffect(() => {
    const requested = params.get('product');
    if (requested && products.some((product) => product.name === requested)) {
      setValue('product_category', requested);
    }
  }, [params, setValue]);

  async function submit(values: EnquiryInput) {
    setNotice(null);
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.fields && typeof result.fields === 'object') {
          for (const [field, messages] of Object.entries(result.fields)) {
            if (Array.isArray(messages) && typeof messages[0] === 'string') {
              setError(field as keyof EnquiryInput, { type: 'server', message: messages[0] });
            }
          }
        }
        throw new Error(result.error || 'We could not submit your enquiry. Please try WhatsApp or email.');
      }
      setNotice({ kind: 'success', text: 'Your enquiry has been received. We will follow up using the contact details you provided.' });
      reset({ enquiry_type: 'quotation', product_category: 'General enquiry' });
    } catch (error) {
      setNotice({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Submission failed. Please try WhatsApp or email.',
      });
    }
  }

  return (
    <form className="enquiry-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-grid">
        <Field name="customer_name" label="Full name" required error={errors.customer_name?.message} register={register} />
        <Field name="company_name" label="Company name (optional)" error={errors.company_name?.message} register={register} />
        <Field name="email" label="Email address" type="email" required error={errors.email?.message} register={register} />
        <Field name="telephone" label="Phone number (optional)" type="tel" error={errors.telephone?.message} register={register} />
        <label>
          Product category
          <select {...register('product_category')}>
            <option>General enquiry</option>
            {products.map((product) => <option key={product.slug}>{product.name}</option>)}
          </select>
          {errors.product_category && <small className="field-error">{errors.product_category.message}</small>}
        </label>
        <Field name="quantity" label="Quantity or required volume (optional)" error={errors.quantity?.message} register={register} />
        <Field name="destination_country" label="Destination country (optional)" error={errors.destination_country?.message} register={register} />
        <label className="full-field">
          Product specifications or requirements
          <textarea {...register('message')} rows={5} placeholder="Include relevant specifications, vehicle make/model/year for parts, or preferred arrangements." aria-invalid={Boolean(errors.message)} />
          {errors.message && <small className="field-error">{errors.message.message}</small>}
        </label>
        <input type="text" {...register('website')} tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
      </div>
      {notice && (
        <div className={`form-notice ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
          <p>{notice.text}</p>
          {notice.kind === 'error' && (
            <p>Contact us directly: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or use the WhatsApp link below.</p>
          )}
        </div>
      )}
      <button className="button button-gold submit-button" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting…' : 'Submit enquiry'} <span aria-hidden="true">↗</span>
      </button>
      {notice?.kind === 'error' && <WhatsAppButton label="Continue on WhatsApp" message="Hello P-WRLD OIL, I need help submitting a quotation enquiry." />}
      <p className="form-privacy">By submitting, you agree that we may use these details to respond to this enquiry. See our <a href="/privacy">privacy notice</a>.</p>
    </form>
  );
}

type FieldProps = {
  name: 'customer_name' | 'company_name' | 'email' | 'telephone' | 'quantity' | 'destination_country';
  label: string;
  type?: string;
  required?: boolean;
  error?: string;
  register: UseFormRegister<EnquiryInput>;
};

function Field({ name, label, type = 'text', required, error, register }: FieldProps) {
  return (
    <label>
      {label}{required && <span aria-hidden="true"> *</span>}
      <input type={type} {...register(name)} aria-invalid={Boolean(error)} />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
