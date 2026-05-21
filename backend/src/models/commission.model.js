import { Schema, model } from 'mongoose';

const commissionSchema = new Schema({
    commissionType: {
        type: String,
        enum: ['fixed', 'percentage'],
        required: true,
        default: 'percentage'
    },
    commissionValue: { 
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        default: 'Global commission rate'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Ensure only one commission document exists
commissionSchema.pre('save', async function(next) {
    const count = await this.constructor.countDocuments();
    if (count > 0 && this.isNew) {
        throw new Error('Only one commission setting can exist');
    }
    next();
});

const Commission = model('Commission', commissionSchema);

export default Commission;