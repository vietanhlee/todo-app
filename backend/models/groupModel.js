import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

// Generate a unique 9-char code (A-Z0-9)
function genCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 9; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    avatar: { type: String, default: "" },
    code: { type: String, unique: true, uppercase: true, trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [memberSchema],
  },
  { timestamps: true },
);

// helper – is a userId in this group?
groupSchema.methods.hasMember = function (userId) {
  return this.members.some((m) => m.userId.toString() === userId.toString());
};

// auto-generate unique code before save
groupSchema.pre("save", async function (next) {
  if (this.code) return next();
  let code, exists;
  do {
    code = genCode();
    exists = await mongoose.model("Group").findOne({ code });
  } while (exists);
  this.code = code;
  next();
});

const Group = mongoose.model("Group", groupSchema);
export default Group;
