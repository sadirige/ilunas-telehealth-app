import { useEffect, useMemo, useState } from 'react';
import {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  uploadProfileImage
} from '../api/client';

const emptyForm = {
  name: '',
  bio: '',
  specialization: '',
  credentials: '',
  consultationFee: '',
  profilePictureUrl: ''
};

const mapProfileToForm = (profile) => ({
  name: profile.name || '',
  bio: profile.bio || '',
  specialization: profile.specialization || '',
  credentials: profile.credentials || '',
  consultationFee: profile.consultationFee ?? '',
  profilePictureUrl: profile.profilePictureUrl || ''
});

const mapFormToPayload = (form) => ({
  name: form.name,
  bio: form.bio,
  specialization: form.specialization,
  credentials: form.credentials,
  consultationFee: Number(form.consultationFee),
  profilePictureUrl: form.profilePictureUrl
});

const buildFormFromDom = (formElement) => {
  const formData = new FormData(formElement);

  return {
    name: formData.get('name')?.toString().trim() || '',
    bio: formData.get('bio')?.toString().trim() || '',
    specialization: formData.get('specialization')?.toString().trim() || '',
    credentials: formData.get('credentials')?.toString().trim() || '',
    consultationFee: formData.get('consultationFee')?.toString().trim() || '',
    profilePictureUrl: formData.get('profilePictureUrl')?.toString().trim() || ''
  };
};

const useDoctorProfileForm = (initialName = '') => {
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
        const data = await getDoctorProfile();
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
        ? await updateDoctorProfile(payload)
        : await createDoctorProfile(payload);
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

export default useDoctorProfileForm;
