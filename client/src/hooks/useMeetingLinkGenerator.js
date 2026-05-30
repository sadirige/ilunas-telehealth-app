import { useState } from 'react';

const buildJitsiRoomName = (appointmentId) => {
  const safeId = String(appointmentId || 'session').replace(/[^a-zA-Z0-9-_]/g, '');
  const suffix = Date.now().toString(36);
  return `ilunas-${safeId}-${suffix}`;
};

const useMeetingLinkGenerator = () => {
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const generateLink = (provider, appointmentId) => {
    setStatus({ type: 'idle', message: '' });

    if (provider === 'jitsi') {
      const roomName = buildJitsiRoomName(appointmentId);
      return `https://meet.jit.si/${encodeURIComponent(roomName)}`;
    }

    setStatus({
      type: 'info',
      message: 'Auto-generation is currently supported only for Jitsi.'
    });
    return '';
  };

  return {
    status,
    generateLink
  };
};

export default useMeetingLinkGenerator;
