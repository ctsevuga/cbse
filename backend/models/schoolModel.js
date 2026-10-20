import mongoose from "mongoose";

const schoolSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Unique tenant identifier
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // URL-friendly tenant identifier
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    // Geographic information for filtering
    state: {
      type: String,
      trim: true,
      index: true,
    },

    city: {
      type: String,
      trim: true,
      index: true,
    },

    contactDetails: {
      phone: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        lowercase: true,
        trim: true,
      },

      website: {
        type: String,
        trim: true,
      },

      contactPerson: {
        type: String,
        trim: true,
      },
    },

    configuration: {
      logo: {
        type: String,
        trim: true,
      },

      academicSession: {
        type: String,
        trim: true,
      },

      timezone: {
        type: String,
        default: "Asia/Kolkata",
        trim: true,
      },

      currency: {
        type: String,
        default: "INR",
        trim: true,
      },

      language: {
        type: String,
        default: "en",
        trim: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Unique tenant code
schoolSchema.index(
  { code: 1 },
  { unique: true },
);

// Unique tenant slug
schoolSchema.index(
  { slug: 1 },
  { unique: true },
);

schoolSchema.index({ name: 1 });
schoolSchema.index({ isActive: 1 });
schoolSchema.index({ createdBy: 1 });

// Efficient combined filtering by location
schoolSchema.index({ state: 1, city: 1 });

const School = mongoose.model("School", schoolSchema);

export default School;