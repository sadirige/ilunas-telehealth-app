import { useEffect, useMemo, useState } from 'react';
import {
  createPatientProfile,
  getPatientProfile,
  updatePatientProfile,
  uploadProfileImage
} from '../api/client';

const emptyForm = {
  name: '',
  birthday: '',
  weight: '',
  height: '',
  profilePictureUrl: '',
  phone: '',
  address: '',
  emergencyContact: '',
  medicalHistory: ''
};

const normalizeDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

const mapProfileToForm = (profile) => ({
  name: profile.name || '',
  birthday: normalizeDate(profile.birthday),
  weight: profile.weight || '',
  height: profile.height || '',
  profilePictureUrl: profile.profilePictureUrl || '',
  phone: profile.contactDetails?.phone || '',
  address: profile.contactDetails?.address || '',
  emergencyContact: profile.contactDetails?.emergencyContact || '',
  medicalHistory: profile.medicalHistory || ''
});

const mapFormToPayload = (form) => ({
  name: form.name,
  birthday: form.birthday,
  weight: Number(form.weight),
  height: Number(form.height),
  profilePictureUrl: form.profilePictureUrl,
  contactDetails: {
    phone: form.phone,
    address: form.address,
    emergencyContact: form.emergencyContact
  },
  medicalHistory: form.medicalHistory
});

const buildFormFromDom = (formElement) => {
  const formData = new FormData(formElement);

  return {
    name: formData.get('name')?.toString().trim() || '',
    birthday: formData.get('birthday')?.toString().trim() || '',
    weight: formData.get('weight')?.toString().trim() || '',
    height: formData.get('height')?.toString().trim() || '',
    profilePictureUrl: formData.get('profilePictureUrl')?.toString().trim() || '',
    phone: formData.get('phone')?.toString().trim() || '',
    address: formData.get('address')?.toString().trim() || '',
    emergencyContact: formData.get('emergencyContact')?.toString().trim() || '',
    medicalHistory: formData.get('medicalHistory')?.toString().trim() || ''
  };
};

const usePatientProfileForm = (initialName = '') => {
  const [form, setForm] = useState(() => ({ ...emptyForm, name: initialName }));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const hasProfile = useMemo(() => Boolean(profile), [profile]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getPatientProfile();
        if (isMounted) {
          setProfile(data.profile);
          setForm(mapProfileToForm(data.profile));
          setPreviewUrl(data.profile.profilePictureUrl || '');
        }
      } catch (error) {
        if (isMounted && error.message !== 'Profile not found') {
          setStatus({ type: 'error', message: error.message });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!form.profilePictureUrl) {
      return;
    }

    setPreviewUrl(form.profilePictureUrl);
  }, [form.profilePictureUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const latestForm = buildFormFromDom(event.currentTarget);
      const payload = mapFormToPayload({ ...form, ...latestForm });
      const data = hasProfile
        ? await updatePatientProfile(payload)
        : await createPatientProfile(payload);
      setProfile(data.profile);
      setForm(mapProfileToForm(data.profile));
      setStatus({ type: 'success', message: 'Profile saved successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const uploadedUrl = await uploadProfileImage(file);
      setForm((prev) => ({ ...prev, profilePictureUrl: uploadedUrl }));
      setStatus({ type: 'success', message: 'Photo uploaded. Save to apply it.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return {
    form,
    setForm,
    profile,
    hasProfile,
    loading,
    saving,
    uploading,
    previewUrl,
    status,
    handleChange,
    handleSubmit,
    handleUpload
  };
};

export default usePatientProfileForm;
