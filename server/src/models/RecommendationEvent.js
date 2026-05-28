const mongoose = require('mongoose');

// Stores recommendation analytics for reporting and tuning.
const recommendationEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    query: {
      type: String,
      trim: true,
      required: true,
      maxlength: 1000
    },
    matchedSpecializations: {
      type: [String],
      default: []
    },
    recommendedSpecializations: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

recommendationEventSchema.index({ createdAt: -1 });
recommendationEventSchema.index({ matchedSpecializations: 1 });
recommendationEventSchema.index({ recommendedSpecializations: 1 });

const RecommendationEvent = mongoose.model('RecommendationEvent', recommendationEventSchema);

module.exports = { RecommendationEvent };
