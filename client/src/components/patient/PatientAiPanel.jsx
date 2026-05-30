const PatientAiPanel = ({
  recommendations,
  recommendationQuery,
  recommendationStatus,
  setRecommendationQuery,
  handleRecommendation,
  handleLoadAvailability
}) => (
  <section className="panel">
    <div className="section__header">
      <div>
        <h2>AI recommendations</h2>
        <p>Describe your symptoms to find the best doctor fit.</p>
      </div>
    </div>

    {recommendationStatus.type === 'error' && (
      <div className="alert alert--error" role="status">
        {recommendationStatus.message}
      </div>
    )}

    <form className="form" onSubmit={handleRecommendation}>
      <label className="field">
        Symptoms
        <input
          type="text"
          value={recommendationQuery}
          onChange={(event) => setRecommendationQuery(event.target.value)}
          placeholder="Headache, dizziness, stress"
          required
        />
      </label>
      <button type="submit" className="primary">
        Get recommendations
      </button>
    </form>

    {recommendations.length > 0 && (
      <div className="cards">
        {recommendations.map((doctor) => (
          <article key={doctor.id} className="card">
            <div className="card__header">
              <div>
                <h3>{doctor.name}</h3>
                <p>{doctor.specialization}</p>
              </div>
              <span className="pill">AI match</span>
            </div>
            <p>{doctor.bio}</p>
            <button
              type="button"
              className="ghost"
              onClick={() => handleLoadAvailability(doctor.userId)}
            >
              View availability
            </button>
          </article>
        ))}
      </div>
    )}
  </section>
);

export default PatientAiPanel;
