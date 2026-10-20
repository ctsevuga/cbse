import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "SCHOOL_ADMIN",
        "HM",
        "TEACHER",
        "STUDENT",
        "PARENT",
      ],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Phone number must be unique within each school.
// The same phone number may exist in different schools.
userSchema.index(
  {
    school: 1,
    phone: 1,
  },
  {
    unique: true,
  },
);

// Compare entered password with the hashed password.
userSchema.methods.matchPassword = async function (
  enteredPassword,
) {
  return bcrypt.compare(
    enteredPassword,
    this.password,
  );
};

// Hash password only when it is modified.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt,
  );
});

const User = mongoose.model("User", userSchema);

export default User;