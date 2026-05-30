const DoctorAvailabilityPanel = ({
  availabilityForm,
  availabilities,
  previewSlots,
  previewError,
  availabilityStatus,
  availabilityLoading,
  availabilitySaving,
  handleAvailabilityChange,
  handleAvailabilitySubmit,
  handleAvailabilityDelete
}) => (
  <section className="panel">
    {availabilityStatus.type !== 'idle' && (
      <div className={`alert alert--${availabilityStatus.type}`} role="status">
        {availabilityStatus.message}
      </div>
    )}

    <form className="form form--grid" onSubmit={handleAvailabilitySubmit}>
      <label className="field">
        Start time
        <input
          type="datetime-local"
          name="startAt"
          value={availabilityForm.startAt}
          onChange={handleAvailabilityChange}
          required
        />
      </label>
      <label className="field">
        End time
        <input
          type="datetime-local"
          name="endAt"
          value={availabilityForm.endAt}
          onChange={handleAvailabilityChange}
          required
        />
      </label>
      <label className="field">
        Slot duration (minutes)
        <input
          type="number"
          name="slotMinutes"
          value={availabilityForm.slotMinutes}
          onChange={handleAvailabilityChange}
          min="1"
          list="slot-duration-options"
        />
        <datalist id="slot-duration-options">
          <option value="30" />
          <option value="45" />
          <option value="60" />
          <option value="120" />
        </datalist>
      </label>
      <button type="submit" className="primary form--span" disabled={availabilitySaving}>
        {availabilitySaving ? 'Saving...' : 'Add availability'}
      </button>
    </form>

    <div className="availability__preview">
      <div className="section__header">
        <div>
          <h3>Slot preview</h3>
          <p>Review generated slots before saving.</p>
        </div>
      </div>
      {previewError ? (
        <p className="hint">{previewError}</p>
      ) : previewSlots.length === 0 ? (
        <p className="hint">Add a time range to preview slots.</p>
      ) : (
        <div className="slot-preview">
          {previewSlots.map((slot, index) => (
            <div key={`${slot.startAt.toISOString()}-${index}`} className="slot-preview__item">
              <span>{new Date(slot.startAt).toLocaleString()}</span>
              <span>→ {new Date(slot.endAt).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>

    {availabilityLoading ? (
      <p className="hint">Loading availability...</p>
    ) : availabilities.length === 0 ? (
      <p className="hint">No availability windows yet. Add your first slot above.</p>
    ) : (
      <div className="availability__list">
        {availabilities.map((slot) => (
          <div key={slot.id} className="availability__item">
            <div>
              <h4>{new Date(slot.startAt).toLocaleString()}</h4>
              <p>Ends {new Date(slot.endAt).toLocaleString()}</p>
            </div>
            <button
              type="button"
              className="ghost ghost--compact"
              onClick={() => handleAvailabilityDelete(slot.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default DoctorAvailabilityPanel;
