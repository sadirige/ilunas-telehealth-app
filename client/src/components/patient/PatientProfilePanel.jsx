import { useRef } from 'react';
import FormField from '../ui/FormField';
import FormSection from '../ui/FormSection';

const PatientProfilePanel = ({
  form,
  hasProfile,
  saving,
  uploading,
  previewUrl,
  status,
  handleChange,
  handleSubmit,
  handleUpload
}) => {
  const fileInputRef = useRef(null);

  return (
    <div className="panel">
      {status.type !== 'idle' && (
        <div className={`alert alert--${status.type}`} role="status">
          {status.message}
        </div>
      )}

      <form className="form form--grid" onSubmit={handleSubmit}>
        <FormSection
          title="Personal information"
          description="This helps your clinician provide personalized care."
          className="form--span"
        >
          <div className="form form--grid form--section-inner">
            <FormField label="Full name" required>
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </FormField>

            <FormField label="Birthday" required hint="Used to calculate age for clinical reference">
              <input
                type="date"
                name="birthday"
                value={form.birthday}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Weight (kg)" required>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                min="1"
                placeholder="e.g., 70"
                required
              />
            </FormField>

            <FormField label="Height (cm)" required>
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleChange}
                min="1"
                placeholder="e.g., 170"
                required
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Profile photo" className="form--span">
          <div className="form form--grid form--section-inner">
            <FormField label="Upload photo" hint="JPG or PNG, max 5 MB">
              <div className="upload-row">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="upload-row__input"
                  id="patient-photo-upload"
                />
                <button
                  type="button"
                  className="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Choose file'}
                </button>
              </div>
            </FormField>

            <FormField label="Or paste image URL">
              <input
                type="url"
                name="profilePictureUrl"
                value={form.profilePictureUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </FormField>

            {previewUrl && (
              <div className="preview form--span">
                <img src={previewUrl} alt="Profile preview" />
              </div>
            )}
          </div>
        </FormSection>

        <FormSection
          title="Contact details"
          description="How we can reach you about appointments."
          className="form--span"
        >
          <div className="form form--grid form--section-inner">
            <FormField label="Phone" required hint="Include country code if applicable">
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+63 912 345 6789"
                required
              />
            </FormField>

            <FormField label="Emergency contact" required>
              <input
                type="tel"
                name="emergencyContact"
                value={form.emergencyContact}
                onChange={handleChange}
                placeholder="Name and phone number"
                required
              />
            </FormField>

            <FormField label="Address" required className="form--span">
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, city, province"
                required
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Medical history"
          description="Share allergies, conditions, and medications your doctor should know."
          className="form--span"
        >
          <FormField label="Basic medical history" required>
            <textarea
              name="medicalHistory"
              rows="4"
              value={form.medicalHistory}
              onChange={handleChange}
              placeholder="Allergies, chronic conditions, current medications..."
              required
            />
          </FormField>
        </FormSection>

        <button type="submit" className="primary form--span" disabled={saving}>
          {saving ? 'Saving...' : hasProfile ? 'Update profile' : 'Save profile'}
        </button>
      </form>
    </div>
  );
};

export default PatientProfilePanel;
