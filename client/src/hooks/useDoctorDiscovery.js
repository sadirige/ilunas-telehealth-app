import { useEffect, useState } from 'react';
import { getDoctorAvailability, getDoctors } from '../api/client';

const useDoctorDiscovery = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctorQuery, setDoctorQuery] = useState('');
  const [specializationQuery, setSpecializationQuery] = useState('');
  const [doctorStatus, setDoctorStatus] = useState({ type: 'idle', message: '' });
  const [availabilityMap, setAvailabilityMap] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadDoctors = async () => {
      try {
        const data = await getDoctors();
        if (isMounted) {
          setDoctors(data.results || []);
        }
      } catch (error) {
        if (isMounted) {
          setDoctorStatus({ type: 'error', message: error.message });
        }
      }
    };

    loadDoctors();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDoctorSearch = async (event) => {
    event.preventDefault();
    setDoctorStatus({ type: 'idle', message: '' });

    try {
      const data = await getDoctors({
        q: doctorQuery || undefined,
        specialization: specializationQuery || undefined
      });
      setDoctors(data.results || []);
    } catch (error) {
      setDoctorStatus({ type: 'error', message: error.message });
    }
  };

  const handleLoadAvailability = async (doctorId) => {
    setAvailabilityMap((prev) => ({
      ...prev,
      [doctorId]: { status: 'loading', slots: [] }
    }));

    try {
      const data = await getDoctorAvailability(doctorId);
      setAvailabilityMap((prev) => ({
        ...prev,
        [doctorId]: { status: 'ready', slots: data.results || [] }
      }));
    } catch (error) {
      setAvailabilityMap((prev) => ({
        ...prev,
        [doctorId]: { status: 'error', slots: [], message: error.message }
      }));
    }
  };

  return {
    doctors,
    doctorQuery,
    specializationQuery,
    doctorStatus,
    availabilityMap,
    setDoctorQuery,
    setSpecializationQuery,
    handleDoctorSearch,
    handleLoadAvailability
  };
};

export default useDoctorDiscovery;
