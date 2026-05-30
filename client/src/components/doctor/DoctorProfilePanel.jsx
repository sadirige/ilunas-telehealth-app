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
        Specialization
        <input
          type="text"
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
          placeholder="Family Medicine, Dermatology"
          required
        />
      </label>

      <label className="field form--span">
        Credentials
        <input
          type="text"
          name="credentials"
          value={form.credentials}
          onChange={handleChange}
          placeholder="MD, Board Certified"
          required
        />
      </label>

      <label className="field">
        Consultation fee
        <input
          type="number"
          name="consultationFee"
          value={form.consultationFee}
          onChange={handleChange}
          min="0"
          required
        />
      </label>

      <label className="field">
        Bio
        <textarea name="bio" rows="4" value={form.bio} onChange={handleChange} required />
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

      <button type="submit" className="primary form--span" disabled={saving}>
        {saving ? 'Saving...' : hasProfile ? 'Update profile' : 'Save profile'}
      </button>
    </form>
  </div>
);

export default DoctorProfilePanel;
