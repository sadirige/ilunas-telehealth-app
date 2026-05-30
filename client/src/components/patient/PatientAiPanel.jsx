import FormField from '../ui/FormField';
import SlotPicker from '../ui/SlotPicker';

const PatientAiPanel = ({
  recommendations,
  recommendationQuery,
  recommendationStatus,
  availabilityMap,
  selectedSlot,
  setRecommendationQuery,
  handleRecommendation,
  handleLoadAvailability,
  handleSelectSlot,
  onOpenConfirm
}) => (
  <section className="panel">
    <div className="section__header">
      <div>
        <h2>AI recommendations</h2>
        <p>Describe your symptoms to find doctors best suited to your needs.</p>
      </div>
    </div>

    {recommendationStatus.type === 'error' && (
      <div className="alert alert--error" role="status">
        {recommendationStatus.message}
      </div>
    )}

    <form className="form" onSubmit={handleRecommendation}>
      <FormField
        label="What are you experiencing?"
        hint="Be specific — e.g., persistent cough, skin rash, anxiety"
      >
        <textarea
          rows="3"
          value={recommendationQuery}
          onChange={(event) => setRecommendationQuery(event.target.value)}
          placeholder="Describe your symptoms or health concern..."
          required
        />
      </FormField>
      <button type="submit" className="primary">
        Get recommendations
      </button>
    </form>

    {recommendations.length > 0 && (
      <div className="cards">
        {recommendations.map((doctor) => {
          const availability = availabilityMap[doctor.userId];
          const hasSelectedSlot = availability?.slots?.some(
            (slot) =>
              selectedSlot?.slot?.id === slot.id &&
              selectedSlot?.doctor?.userId === doctor.userId
          );

          return (
            <article key={doctor.id} className="card doctor-card">
              <div className="doctor-card__header">
                {doctor.profilePictureUrl ? (
                  <img
                    src={doctor.profilePictureUrl}
                    alt={`${doctor.name}'s profile`}
                    className="doctor-card__avatar doctor-card__avatar--image"
                  />
                ) : (
                  <div className="doctor-card__avatar" aria-hidden="true">
                    {doctor.name?.charAt(0) || 'D'}
                  </div>
                )}
                <div className="doctor-card__info">
                  <h3>{doctor.name}</h3>
                  <p className="doctor-card__specialization">{doctor.specialization}</p>
                </div>
                <span className="pill pill--accent">AI match</span>
              </div>
              {doctor.bio && <p className="doctor-card__bio">{doctor.bio}</p>}

              {availability?.status === 'ready' && availability.slots.length > 0 ? (
                <>
                  <SlotPicker
                    slots={availability.slots}
                    selectedSlotId={hasSelectedSlot ? selectedSlot?.slot?.id : undefined}
                    onSelectSlot={(slot) => handleSelectSlot(doctor, slot)}
                  />
                  {hasSelectedSlot && (
                    <button type="button" className="primary" onClick={onOpenConfirm}>
                      Book this time
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="primary doctor-card__view-btn"
                  onClick={() => handleLoadAvailability(doctor.userId)}
                  disabled={availability?.status === 'loading'}
                >
                  {availability?.status === 'loading'
                    ? 'Loading availability...'
                    : 'View available times'}
                </button>
              )}
            </article>
          );
        })}
      </div>
    )}

    {recommendations.length === 0 && recommendationStatus.type === 'success' && (
      <p className="hint">No matching doctors found. Try describing your symptoms differently.</p>
    )}
  </section>
);

export default PatientAiPanel;
