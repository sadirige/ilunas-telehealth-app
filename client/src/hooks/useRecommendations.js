import { useState } from 'react';
import { getRecommendations } from '../api/client';

const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationQuery, setRecommendationQuery] = useState('');
  const [recommendationStatus, setRecommendationStatus] = useState({ type: 'idle', message: '' });

  const handleRecommendation = async (event) => {
    event.preventDefault();
    setRecommendationStatus({ type: 'idle', message: '' });

    try {
      const data = await getRecommendations({ symptoms: recommendationQuery, limit: 5 });
      setRecommendations(data.recommendations || []);
    } catch (error) {
      setRecommendationStatus({ type: 'error', message: error.message });
    }
  };

  return {
    recommendations,
    recommendationQuery,
    recommendationStatus,
    setRecommendationQuery,
    handleRecommendation
  };
};

export default useRecommendations;
