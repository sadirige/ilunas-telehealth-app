import EmptyState from '../ui/EmptyState';

const PatientRecordsPanel = ({
  records,
  notes,
  prescriptions,
  recordStatus,
  noteStatus,
  prescriptionStatus,
  recordLoading,
  noteLoading,
  prescriptionLoading,
  onExportRecords,
  onExportPrescriptions,
  onNavigateToDoctors
}) => (
  <>
    <section className="panel">
      <div className="section__header">
        <div>
          <h2>Medical records</h2>
          <p>Review summaries from your recent consultations.</p>
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

      {recordStatus.type === 'error' && (
        <div className="alert alert--error" role="status">
          {recordStatus.message}
        </div>
      )}

      {recordLoading ? (
        <p className="hint">Loading medical records...</p>
      ) : records.length === 0 ? (
        <EmptyState
          title="No medical records yet"
          description="Records will appear here after your consultations."
          action={
            onNavigateToDoctors ? (
              <button type="button" className="primary" onClick={onNavigateToDoctors}>
                Book a consultation
              </button>
            ) : null
          }
        />
      ) : (
        <div className="records__list">
          {records.map((record) => (
            <div key={record.id} className="records__item">
              <div>
                <h4>Visit summary</h4>
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
          <p>Notes shared by your clinician after visits.</p>
        </div>
      </div>

      {noteStatus.type === 'error' && (
        <div className="alert alert--error" role="status">
          {noteStatus.message}
        </div>
      )}

      {noteLoading ? (
        <p className="hint">Loading consultation notes...</p>
      ) : notes.length === 0 ? (
        <EmptyState
          title="No consultation notes yet"
          description="Notes shared by your clinician will appear here after visits."
          action={
            onNavigateToDoctors ? (
              <button type="button" className="primary" onClick={onNavigateToDoctors}>
                Book a consultation
              </button>
            ) : null
          }
        />
      ) : (
        <div className="records__list">
          {notes.map((note) => (
            <div key={note.id} className="records__item">
              <div>
                <h4>Consultation note</h4>
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
          <p>Medication instructions provided by your doctor.</p>
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

      {prescriptionStatus.type === 'error' && (
        <div className="alert alert--error" role="status">
          {prescriptionStatus.message}
        </div>
      )}

      {prescriptionLoading ? (
        <p className="hint">Loading prescriptions...</p>
      ) : prescriptions.length === 0 ? (
        <EmptyState
          title="No prescriptions yet"
          description="Medication instructions provided by your doctor will appear here after consultations."
          action={
            onNavigateToDoctors ? (
              <button type="button" className="primary" onClick={onNavigateToDoctors}>
                Book a consultation
              </button>
            ) : null
          }
        />
      ) : (
        <div className="records__list">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="records__item">
              <div>
                <h4>Prescription</h4>
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

export default PatientRecordsPanel;
