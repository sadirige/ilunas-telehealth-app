// Gmail-style avatar color generator
// Generates consistent colors based on a string (name or ID)

const AVATAR_COLORS = [
  '#EA4335', // Red
  '#FBBC05', // Yellow
  '#34A853', // Green
  '#4285F4', // Blue
  '#AB47BC', // Purple
  '#F57C00', // Orange
  '#0097A7', // Teal
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#E91E63', // Pink
  '#00BCD4', // Cyan
  '#8BC34A', // Light Green
  '#FF9800', // Orange
  '#9C27B0', // Deep Purple
  '#2196F3', // Light Blue
  '#FFEB3B', // Light Yellow
];

const getAvatarColor = (str) => {
  if (!str) return '#607D8B'; // Default color (Blue Grey)
  
  // Create a hash from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use the absolute value of the hash to select a color
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
};

export { getAvatarColor };
