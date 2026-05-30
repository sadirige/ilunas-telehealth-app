import { useRef } from 'react';
import FormField from '../ui/FormField';
import FormSection from '../ui/FormSection';

const DoctorProfilePanel = ({
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
          title="Professional identity"
          description="Patients use this to find and trust your practice."
          className="form--span"
        >
          <div className="form form--grid form--section-inner">
            <FormField label="Full name" required>
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </FormField>

            <FormField label="Specialization" required>
              <input
                type="text"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Family Medicine, Dermatology"
                required
              />
            </FormField>

            <FormField label="Credentials" required className="form--span">
              <input
                type="text"
                name="credentials"
                value={form.credentials}
                onChange={handleChange}
                placeholder="MD, Board Certified"
                required
              />
            </FormField>

            <FormField label="Consultation fee (₱)" required hint="Fee shown to patients when booking">
              <input
                type="number"
                name="consultationFee"
                value={form.consultationFee}
                onChange={handleChange}
                min="0"
                placeholder="500"
                required
              />
            </FormField>

            <FormField label="Bio" required className="form--span">
              <textarea
                name="bio"
                rows="4"
                value={form.bio}
                onChange={handleChange}
                placeholder="Brief introduction for patients — experience, approach, languages spoken..."
                required
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Profile photo" className="form--span">
          <div className="form form--grid form--section-inner">
            <FormField label="Upload photo" hint="A professional headshot helps patients recognize you">
              <div className="upload-row">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="upload-row__input"
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

        <button type="submit" className="primary form--span" disabled={saving}>
          {saving ? 'Saving...' : hasProfile ? 'Update profile' : 'Save profile'}
        </button>
      </form>
    </div>
  );
};

export default DoctorProfilePanel;
