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
}) => (
  <div className="panel">
    {status.type !== 'idle' && (
      <div className={`alert alert--${status.type}`} role="status">
        {status.message}
      </div>
    )}

    <form className="form form--grid" onSubmit={handleSubmit}>
      <label className="field">
        Full name
        <input type="text" name="name" value={form.name} onChange={handleChange} required />
      </label>

      <label className="field">
        Birthday
        <input
          type="date"
          name="birthday"
          value={form.birthday}
          onChange={handleChange}
          required
        />
      </label>

      <label className="field">
        Weight (kg)
        <input
          type="number"
          name="weight"
          value={form.weight}
          onChange={handleChange}
          min="1"
          required
        />
      </label>

      <label className="field">
        Height (cm)
        <input
          type="number"
          name="height"
          value={form.height}
          onChange={handleChange}
          min="1"
          required
        />
      </label>

      <label className="field form--span">
        Profile picture
        <div className="upload-row">
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          <button type="button" className="ghost" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
          </button>
        </div>
        <input
          type="url"
          name="profilePictureUrl"
          value={form.profilePictureUrl}
          onChange={handleChange}
          placeholder="Or paste a URL"
        />
      </label>

      {previewUrl && (
        <div className="form--span preview">
          <img src={previewUrl} alt="Profile preview" />
        </div>
      )}

      <label className="field">
        Phone
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
      </label>

      <label className="field">
        Emergency contact
        <input
          type="tel"
          name="emergencyContact"
          value={form.emergencyContact}
          onChange={handleChange}
          required
        />
      </label>

      <label className="field form--span">
        Address
        <input type="text" name="address" value={form.address} onChange={handleChange} required />
      </label>

      <label className="field form--span">
        Basic medical history
        <textarea
          name="medicalHistory"
          rows="4"
          value={form.medicalHistory}
          onChange={handleChange}
          required
        />
      </label>

      <button type="submit" className="primary form--span" disabled={saving}>
        {saving ? 'Saving...' : hasProfile ? 'Update profile' : 'Save profile'}
      </button>
    </form>
  </div>
);

export default PatientProfilePanel;
