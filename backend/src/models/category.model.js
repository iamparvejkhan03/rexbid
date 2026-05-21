import { model, Schema } from "mongoose";

// Field definition schema for dynamic category fields
const fieldOptionSchema = new Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const categoryFieldSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true 
  },
  label: { 
    type: String, 
    required: true 
  },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'number', 'select', 'textarea', 'date', 'boolean', 'file'],
    default: 'text'
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  defaultValue: {
    type: Schema.Types.Mixed
  },
  options: [fieldOptionSchema], // For select fields
  validation: {
    min: Number,
    max: Number,
    minLength: Number,
    maxLength: Number,
    pattern: String,
    message: String
  },
  unit: {
    type: String, // e.g., 'kg', 'm', 'L', 'HP'
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  group: {
    type: String,
    default: 'General'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },
    level: {
      type: Number,
      default: 0, // 0: parent, 1: child (max 2 levels)
      min: 0,
      max: 1
    },
    icon: {
      url: String,
      publicId: String,
      filename: String,
    },
    image: {
      url: String,
      publicId: String,
      filename: String,
    },
    fields: [categoryFieldSchema],
    inheritedFields: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    auctionCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving
categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
  next();
});

categorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
  next();
});

// Set level based on parentCategory
categorySchema.pre("save", async function (next) {
  if (this.parentCategory) {
    const parent = await this.model("Category").findById(this.parentCategory);
    if (parent) {
      if (parent.level === 0) {
        this.level = 1; // Child category
      } else {
        // Prevent creating subcategories of subcategories
        throw new Error("Cannot create subcategory under another subcategory. Maximum 2 levels allowed.");
      }
    }
  } else {
    this.level = 0; // Parent category
  }
  next();
});

// Get fields including inherited from parent
categorySchema.methods.getEffectiveFields = async function () {
  let fields = [...this.fields];
  
  if (this.inheritedFields && this.parentCategory) {
    const parent = await this.model("Category").findById(this.parentCategory);
    if (parent) {
      const parentFields = parent.fields.map(field => ({
        ...field.toObject(),
        inherited: true
      }));
      fields = [...parentFields, ...fields];
    }
  }
  
  // Sort by order
  return fields.sort((a, b) => a.order - b.order);
};

// Indexes for better performance
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// Method to update auction count
categorySchema.methods.updateAuctionCount = async function () {
  const Auction = model("Auction");
  const count = await Auction.countDocuments({
    category: this._id,
    status: { $ne: "draft" },
  });
  this.auctionCount = count;
  return this.save();
};

// Get category tree with fields
categorySchema.statics.getCategoryTree = async function () {
  const categories = await this.find({ isActive: true })
    .populate('parentCategory', 'name slug')
    .sort({ order: 1, name: 1 })
    .lean();

  const categoryMap = {};
  const roots = [];

  categories.forEach((category) => {
    category.children = [];
    categoryMap[category._id] = category;
  });

  categories.forEach((category) => {
    if (category.parentCategory) {
      const parentId = category.parentCategory._id || category.parentCategory;
      const parent = categoryMap[parentId];
      if (parent) {
        parent.children.push(category);
      }
    } else {
      roots.push(category);
    }
  });

  return roots;
};

// Get categories by level
categorySchema.statics.getByLevel = function (level) {
  return this.find({ level, isActive: true })
    .sort({ order: 1, name: 1 })
    .populate('parentCategory', 'name slug');
};

const Category = model("Category", categorySchema);
export default Category;