import FormField from '../ui/FormField';
import SlotPicker from '../ui/SlotPicker';

const TAGALOG_SYMPTOMS = [
  { tagalog: 'masakit sa dibdib', english: 'chest pain' },
  { tagalog: 'masakit na ulo', english: 'headache' },
  { tagalog: 'makati ang balat', english: 'skin itch' },
  { tagalog: 'sakit ng tiyan', english: 'stomach pain' },
  { tagalog: 'ubo', english: 'cough' },
  { tagalog: 'lagnat', english: 'fever' },
  { tagalog: 'pagkahilo', english: 'dizziness' },
  { tagalog: 'hirap sa paghinga', english: 'shortness of breath' },
  { tagalog: 'masakit na likod', english: 'back pain' },
  { tagalog: 'masakit ng kasu-kasan', english: 'joint pain' },
  { tagalog: 'pagkatuyo ng balat', english: 'dry skin' },
  { tagalog: 'pangangati', english: 'itching' }
];

const getSelectedSymptoms = (query) => {
  if (!query) return new Set();
  const symptoms = query.toLowerCase().split(',').map(s => s.trim());
  return new Set(symptoms);
};

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
        <h2>AI Recommendation</h2>
        <p>Describe your symptoms or health concerns to get AI-matched doctors based on medical specialization.</p>
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

      <div className="form__field">
        <label className="form__label">Quick symptom buttons (Tagalog)</label>
        <p className="form__hint">Click to add common symptoms in Tagalog</p>
        <div className="symptom-buttons">
          {TAGALOG_SYMPTOMS.map((symptom) => {
            const selectedSymptoms = getSelectedSymptoms(recommendationQuery);
            const isSelected = selectedSymptoms.has(symptom.english.toLowerCase());

            return (
              <button
                key={symptom.tagalog}
                type="button"
                className={`ghost symptom-button ${isSelected ? 'symptom-button--selected' : ''}`}
                onClick={() => {
                  const currentQuery = recommendationQuery.trim();
                  const selectedSymptoms = getSelectedSymptoms(currentQuery);
                  const symptomLower = symptom.english.toLowerCase();

                  if (selectedSymptoms.has(symptomLower)) {
                    // Remove the symptom
                    const updatedSymptoms = Array.from(selectedSymptoms)
                      .filter(s => s !== symptomLower);
                    const newQuery = updatedSymptoms.join(', ');
                    setRecommendationQuery(newQuery);
                  } else {
                    // Add the symptom
                    const newQuery = currentQuery
                      ? `${currentQuery}, ${symptom.english}`
                      : symptom.english;
                    setRecommendationQuery(newQuery);
                  }
                }}
              >
                {symptom.tagalog}
              </button>
            );
          })}
        </div>
      </div>

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

              {doctor.matchedSymptoms && doctor.matchedSymptoms.length > 0 && (
                <div className="doctor-card__match-reasoning">
                  <p className="doctor-card__match-label">Matched symptoms:</p>
                  <p className="doctor-card__match-symptoms">
                    {doctor.matchedSymptoms.join(', ')}
                  </p>
                </div>
              )}

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
