import SkeletonLoader from '../ui/SkeletonLoader';
import SlotPicker from '../ui/SlotPicker';
import FormField from '../ui/FormField';

const SPECIALIZATIONS = [
  '',
  'Family Medicine',
  'Internal Medicine',
  'Pediatrics',
  'Dermatology',
  'Cardiology',
  'Neurology',
  'Psychiatry',
  'Orthopedics',
  'Obstetrics & Gynecology',
  'General Surgery'
];

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
  handleSelectSlot,
  onOpenConfirm
}) => {
  const isSlotSelected = (slot, doctor) =>
    selectedSlot?.slot?.id === slot.id && selectedSlot?.doctor?.userId === doctor.userId;

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

      <form className="form form--grid form--search" onSubmit={handleDoctorSearch}>
        <FormField label="Search doctors" hint="Try symptoms like headache, rash, or anxiety">
          <input
            type="search"
            value={doctorQuery}
            onChange={(event) => setDoctorQuery(event.target.value)}
            placeholder="Doctor name, symptoms, or condition"
          />
        </FormField>
        <FormField label="Specialization">
          <select
            value={specializationQuery}
            onChange={(event) => setSpecializationQuery(event.target.value)}
          >
            <option value="">All specializations</option>
            {SPECIALIZATIONS.filter(Boolean).map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </FormField>
        <button type="submit" className="primary form--span">
          Search doctors
        </button>
      </form>

      {doctors.length === 0 && doctorStatus.type !== 'loading' ? (
        <EmptyState
          title="No doctors found"
          description="Try adjusting your search terms or choose a different specialization."
        />
      ) : doctorStatus.type === 'loading' ? (
        <div className="cards">
          <SkeletonLoader variant="card" count={3} />
        </div>
      ) : (
        <div className="cards">
          {doctors.map((doctor) => {
            const availability = availabilityMap[doctor.userId];
            const hasSelectedSlot = availability?.slots?.some((slot) =>
              isSlotSelected(slot, doctor)
            );

            return (
              <article
                key={doctor.id}
                className={`card doctor-card ${hasSelectedSlot ? 'doctor-card--selected' : ''}`}
              >
                <div className="doctor-card__header">
                  <div className="doctor-card__avatar" aria-hidden="true">
                    {doctor.name?.charAt(0) || 'D'}
                  </div>
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

                {doctor.bio && <p className="doctor-card__bio">{doctor.bio}</p>}

                <div className="doctor-card__actions">
                  {availability?.status === 'ready' && availability.slots.length > 0 ? (
                    <>
                      <SlotPicker
                        slots={availability.slots}
                        selectedSlotId={
                          hasSelectedSlot ? selectedSlot?.slot?.id : undefined
                        }
                        onSelectSlot={(slot) => handleSelectSlot(doctor, slot)}
                      />
                      {hasSelectedSlot && (
                        <button
                          type="button"
                          className="primary doctor-card__book-btn"
                          onClick={onOpenConfirm}
                        >
                          Book this time
                        </button>
                      )}
                    </>
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
                      {availability?.status === 'loading'
                        ? 'Loading availability...'
                        : 'View available times'}
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
