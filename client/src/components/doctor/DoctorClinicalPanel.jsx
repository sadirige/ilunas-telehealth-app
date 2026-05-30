import EmptyState from '../ui/EmptyState';

const DoctorClinicalPanel = ({
  appointments,
  records,
  notes,
  prescriptions,
  recordStatus,
  noteStatus,
  prescriptionStatus,
  recordLoading,
  noteLoading,
  prescriptionLoading,
  recordSaving,
  noteSaving,
  prescriptionSaving,
  recordForm,
  noteForm,
  prescriptionForm,
  handleRecordChange,
  handleRecordSubmit,
  handleNoteChange,
  handleNoteSubmit,
  handlePrescriptionChange,
  handlePrescriptionSubmit,
  onExportRecords,
  onExportPrescriptions,
  onNavigateToAppointments
}) => (
  <>
    <section className="panel">
      <div className="section__header">
        <div>
          <h2>Medical records</h2>
          <p>Document summaries after consultations.</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="ghost ghost--compact"
            onClick={onExportRecords}
            disabled={records.length === 0}
          >
            Export PDF
          </button>
        </div>
      </div>

      {recordStatus.type !== 'idle' && (
        <div className={`alert alert--${recordStatus.type}`} role="status">
          {recordStatus.message}
        </div>
      )}

      <form className="form form--grid" onSubmit={handleRecordSubmit}>
        <label className="field">
          Appointment
          <select
            name="appointmentId"
            value={recordForm.appointmentId}
            onChange={handleRecordChange}
            required
          >
            <option value="">Select appointment</option>
            {appointments.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {new Date(appointment.scheduledAt).toLocaleString()} ·{' '}
                {appointment.id.slice(-6)}
              </option>
            ))}
          </select>
        </label>
        <label className="field form--span">
          Summary
          <textarea
            name="summary"
            rows="4"
            value={recordForm.summary}
            onChange={handleRecordChange}
            required
          />
        </label>
        <label className="field form--span">
          Diagnosis (optional)
          <input
            type="text"
            name="diagnosis"
            value={recordForm.diagnosis}
            onChange={handleRecordChange}
          />
        </label>
        <button type="submit" className="primary form--span" disabled={recordSaving}>
          {recordSaving ? 'Saving...' : 'Save record'}
        </button>
      </form>

      {recordLoading ? (
        <p className="hint">Loading records...</p>
      ) : records.length === 0 ? (
        <EmptyState
          title="No records created yet"
          description="Complete consultations to document patient summaries."
          action={
            onNavigateToAppointments ? (
              <button type="button" className="primary" onClick={onNavigateToAppointments}>
                View appointments
              </button>
            ) : null
          }
        />
      ) : (
        <div className="records__list">
          {records.map((record) => (
            <div key={record.id} className="records__item">
              <div>
                <h4>Appointment {record.appointment?.slice(-6)}</h4>
                <p>{record.summary}</p>
                {record.diagnosis && (
                  <p className="records__meta">Diagnosis: {record.diagnosis}</p>
                )}
                <span className="records__meta">
                  {new Date(record.createdAt).toLocaleString()}
                </span>
              </div>
              <span className="pill">Record</span>
            </div>
          ))}
        </div>
      )}
    </section>

    <section className="panel">
      <div className="section__header">
        <div>
          <h2>Consultation notes</h2>
          <p>Capture clinical notes for each appointment.</p>
        </div>
      </div>

      {noteStatus.type !== 'idle' && (
        <div className={`alert alert--${noteStatus.type}`} role="status">
          {noteStatus.message}
        </div>
      )}

      <form className="form form--grid" onSubmit={handleNoteSubmit}>
        <label className="field">
          Appointment
          <select
            name="appointmentId"
            value={noteForm.appointmentId}
            onChange={handleNoteChange}
            required
          >
            <option value="">Select appointment</option>
            {appointments.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {new Date(appointment.scheduledAt).toLocaleString()} ·{' '}
                {appointment.id.slice(-6)}
              </option>
            ))}
          </select>
        </label>
        <label className="field form--span">
          Note
          <textarea
            name="note"
            rows="4"
            value={noteForm.note}
            onChange={handleNoteChange}
            required
          />
        </label>
        <button type="submit" className="primary form--span" disabled={noteSaving}>
          {noteSaving ? 'Saving...' : 'Save note'}
        </button>
      </form>

      {noteLoading ? (
        <p className="hint">Loading notes...</p>
      ) : notes.length === 0 ? (
        <EmptyState
          title="No consultation notes yet"
          description="Capture clinical notes after completing consultations."
          action={
            onNavigateToAppointments ? (
              <button type="button" className="primary" onClick={onNavigateToAppointments}>
                View appointments
              </button>
            ) : null
          }
        />
      ) : (
        <div className="records__list">
          {notes.map((note) => (
            <div key={note.id} className="records__item">
              <div>
                <h4>Appointment {note.appointment?.slice(-6)}</h4>
                <p>{note.note}</p>
                <span className="records__meta">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
              <span className="pill">Note</span>
            </div>
          ))}
        </div>
      )}
    </section>

    <section className="panel">
      <div className="section__header">
        <div>
          <h2>Prescriptions</h2>
          <p>Issue medications and patient instructions.</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="ghost ghost--compact"
            onClick={onExportPrescriptions}
            disabled={prescriptions.length === 0}
          >
            Export PDF
          </button>
        </div>
      </div>

      {prescriptionStatus.type !== 'idle' && (
        <div className={`alert alert--${prescriptionStatus.type}`} role="status">
          {prescriptionStatus.message}
        </div>
      )}

      <form className="form form--grid" onSubmit={handlePrescriptionSubmit}>
        <label className="field">
          Appointment
          <select
            name="appointmentId"
            value={prescriptionForm.appointmentId}
            onChange={handlePrescriptionChange}
            required
          >
            <option value="">Select appointment</option>
            {appointments.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {new Date(appointment.scheduledAt).toLocaleString()} ·{' '}
                {appointment.id.slice(-6)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Medication name
          <input
            type="text"
            name="medicationName"
            value={prescriptionForm.medicationName}
            onChange={handlePrescriptionChange}
            required
          />
        </label>
        <label className="field">
          Dosage
          <input
            type="text"
            name="dosage"
            value={prescriptionForm.dosage}
            onChange={handlePrescriptionChange}
          />
        </label>
        <label className="field">
          Frequency
          <input
            type="text"
            name="frequency"
            value={prescriptionForm.frequency}
            onChange={handlePrescriptionChange}
          />
        </label>
        <label className="field form--span">
          Notes (optional)
          <textarea
            name="notes"
            rows="3"
            value={prescriptionForm.notes}
            onChange={handlePrescriptionChange}
          />
        </label>
        <button type="submit" className="primary form--span" disabled={prescriptionSaving}>
          {prescriptionSaving ? 'Saving...' : 'Save prescription'}
        </button>
      </form>

      {prescriptionLoading ? (
        <p className="hint">Loading prescriptions...</p>
      ) : prescriptions.length === 0 ? (
        <EmptyState
          title="No prescriptions yet"
          description="Issue medications and instructions after completing consultations."
          action={
            onNavigateToAppointments ? (
              <button type="button" className="primary" onClick={onNavigateToAppointments}>
                View appointments
              </button>
            ) : null
          }
        />
      ) : (
        <div className="records__list">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="records__item">
              <div>
                <h4>Appointment {prescription.appointment?.slice(-6)}</h4>
                {prescription.medications.map((med, index) => (
                  <p key={`${prescription.id}-med-${index}`}>
                    {med.name}
                    {med.dosage ? ` · ${med.dosage}` : ''}
                    {med.frequency ? ` · ${med.frequency}` : ''}
                  </p>
                ))}
                {prescription.notes && (
                  <p className="records__meta">Notes: {prescription.notes}</p>
                )}
                <span className="records__meta">
                  {new Date(prescription.createdAt).toLocaleString()}
                </span>
              </div>
              <span className="pill">Rx</span>
            </div>
          ))}
        </div>
      )}
    </section>
  </>
);

export default DoctorClinicalPanel;
