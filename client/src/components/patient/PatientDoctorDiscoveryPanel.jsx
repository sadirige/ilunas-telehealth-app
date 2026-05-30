import EmptyState from '../ui/EmptyState';

const PatientDoctorDiscoveryPanel = ({
  doctors,
  doctorQuery,
  specializationQuery,
  doctorStatus,
  availabilityMap,
  selectedSlot,
  setDoctorQuery,
  setSpecializationQuery,
  handleDoctorSearch,
  handleLoadAvailability,
  handleSelectSlot
}) => (
  <section className="panel">
    <div className="section__header">
      <div>
        <h2>Doctor discovery</h2>
        <p>Search by name, specialty, or symptoms and review schedules.</p>
      </div>
    </div>

    {doctorStatus.type === 'error' && (
      <div className="alert alert--error" role="status">
        {doctorStatus.message}
      </div>
    )}

    <form className="form form--grid" onSubmit={handleDoctorSearch}>
      <label className="field">
        Search
        <input
          type="text"
          value={doctorQuery}
          onChange={(event) => setDoctorQuery(event.target.value)}
          placeholder="Doctor name or symptoms"
        />
      </label>
      <label className="field">
        Specialization
        <input
          type="text"
          value={specializationQuery}
          onChange={(event) => setSpecializationQuery(event.target.value)}
          placeholder="Cardiology"
        />
      </label>
      <button type="submit" className="primary form--span">
        Search doctors
      </button>
    </form>

    {doctors.length === 0 ? (
      <EmptyState
        title="No doctors found"
        description="Try adjusting your search terms or specialization filter."
      />
    ) : (
      <div className="cards">
        {doctors.map((doctor) => {
          const availability = availabilityMap[doctor.userId];

          return (
            <article key={doctor.id} className="card">
              <div className="card__header">
                <div>
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialization}</p>
                </div>
                <span className="pill">Fee {doctor.consultationFee ?? 'TBD'}</span>
              </div>
              <p>{doctor.bio}</p>
              {doctor.credentials && <p className="card__meta">{doctor.credentials}</p>}
              <button
                type="button"
                className="ghost"
                onClick={() => handleLoadAvailability(doctor.userId)}
              >
                {availability?.status === 'loading'
                  ? 'Loading schedules...'
                  : 'View availability'}
              </button>
              {availability?.status === 'ready' && (
                <ul className="availability">
                  {availability.slots.length === 0 ? (
                    <li>No open slots yet.</li>
                  ) : (
                    availability.slots.map((slot) => {
                      const isSelected =
                        selectedSlot?.slot?.id === slot.id &&
                        selectedSlot?.doctor?.userId === doctor.userId;

                      return (
                        <li key={slot.id}>
                          <div
                            className={
                              isSelected ? 'slot-row slot-row--active' : 'slot-row'
                            }
                          >
                            <span>
                              {new Date(slot.startAt).toLocaleString()} -{' '}
                              {new Date(slot.endAt).toLocaleTimeString()}
                            </span>
                            <button
                              type="button"
                              className="ghost ghost--compact"
                              onClick={() => handleSelectSlot(doctor, slot)}
                              disabled={isSelected}
                            >
                              {isSelected ? 'Selected' : 'Book'}
                            </button>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
              {availability?.status === 'error' && (
                <p className="hint">{availability.message}</p>
              )}
            </article>
          );
        })}
      </div>
    )}
  </section>
);

export default PatientDoctorDiscoveryPanel;
