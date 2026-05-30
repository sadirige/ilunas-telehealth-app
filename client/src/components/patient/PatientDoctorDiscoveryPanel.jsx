import EmptyState from '../ui/EmptyState';
import SkeletonLoader from '../ui/SkeletonLoader';

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
}) => {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const dateStr = isToday ? 'Today' : date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${dateStr} at ${timeStr}`;
  };

  const isSlotSelected = (slot, doctor) => {
    return selectedSlot?.slot?.id === slot.id && selectedSlot?.doctor?.userId === doctor.userId;
  };

  return (
    <section className="panel">
      <div className="section__header">
        <div>
          <h2>Find a doctor</h2>
          <p>Search by name, specialty, or symptoms to book your consultation.</p>
        </div>
      </div>

      {doctorStatus.type === 'error' && (
        <div className="alert alert--error" role="status">
          {doctorStatus.message}
        </div>
      )}

      <form className="form form--grid" onSubmit={handleDoctorSearch}>
        <label className="field">
          Search doctors
          <input
            type="text"
            value={doctorQuery}
            onChange={(event) => setDoctorQuery(event.target.value)}
            placeholder="Doctor name, symptoms, or condition"
          />
        </label>
        <label className="field">
          Specialization
          <input
            type="text"
            value={specializationQuery}
            onChange={(event) => setSpecializationQuery(event.target.value)}
            placeholder="e.g., Cardiology, Dermatology"
          />
        </label>
        <button type="submit" className="primary form--span">
          Search
        </button>
      </form>

      {doctors.length === 0 && doctorStatus.type !== 'loading' ? (
        <EmptyState
          title="No doctors found"
          description="Try adjusting your search terms or specialization filter."
        />
      ) : doctorStatus.type === 'loading' ? (
        <div className="cards">
          <SkeletonLoader variant="card" count={3} />
        </div>
      ) : (
        <div className="cards">
          {doctors.map((doctor) => {
            const availability = availabilityMap[doctor.userId];
            const hasSelectedSlot = availability?.slots?.some(slot => isSlotSelected(slot, doctor));

            return (
              <article key={doctor.id} className={`card doctor-card ${hasSelectedSlot ? 'doctor-card--selected' : ''}`}>
                <div className="doctor-card__header">
                  <div className="doctor-card__info">
                    <h3>{doctor.name}</h3>
                    <p className="doctor-card__specialization">{doctor.specialization}</p>
                    {doctor.credentials && (
                      <p className="doctor-card__credentials">{doctor.credentials}</p>
                    )}
                  </div>
                  <div className="doctor-card__meta">
                    <span className="pill pill--fee">
                      {doctor.consultationFee ? `₱${doctor.consultationFee}` : 'Fee TBD'}
                    </span>
                  </div>
                </div>
                
                {doctor.bio && (
                  <p className="doctor-card__bio">{doctor.bio}</p>
                )}
                
                <div className="doctor-card__actions">
                  {availability?.status === 'ready' && availability.slots.length > 0 ? (
                    <div className="availability-section">
                      <div className="availability-section__header">
                        <h4>Available time slots</h4>
                        <span className="availability-section__count">{availability.slots.length} slots</span>
                      </div>
                      <ul className="availability availability--expanded">
                        {availability.slots.slice(0, 5).map((slot) => {
                          const isSelected = isSlotSelected(slot, doctor);

                          return (
                            <li key={slot.id}>
                              <div
                                className={
                                  isSelected ? 'slot-row slot-row--active' : 'slot-row'
                                }
                              >
                                <div className="slot-row__info">
                                  <span className="slot-row__time">
                                    {formatDateTime(slot.startAt)}
                                  </span>
                                  <span className="slot-row__duration">
                                    {Math.round((new Date(slot.endAt) - new Date(slot.startAt)) / 60000)} min
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className={isSelected ? 'primary primary--compact' : 'ghost ghost--compact'}
                                  onClick={() => handleSelectSlot(doctor, slot)}
                                  disabled={isSelected}
                                  aria-label={isSelected ? 'Time slot selected' : `Select time slot for ${formatDateTime(slot.startAt)}`}
                                >
                                  {isSelected ? '✓ Selected' : 'Select'}
                                </button>
                              </div>
                            </li>
                          );
                        })}
                        {availability.slots.length > 5 && (
                          <li className="availability__more">
                            +{availability.slots.length - 5} more slots available
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : availability?.status === 'ready' && availability.slots.length === 0 ? (
                    <div className="availability-section availability-section--empty">
                      <p className="hint">No available time slots</p>
                      <p className="hint hint--subtle">Check back later for new openings</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="primary doctor-card__view-btn"
                      onClick={() => handleLoadAvailability(doctor.userId)}
                      disabled={availability?.status === 'loading'}
                    >
                      {availability?.status === 'loading' ? 'Loading...' : 'View available times'}
                    </button>
                  )}
                  
                  {availability?.status === 'error' && (
                    <p className="hint hint--error">{availability.message}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PatientDoctorDiscoveryPanel;
