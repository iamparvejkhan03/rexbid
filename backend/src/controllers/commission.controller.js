import Commission from '../models/commission.model.js';

// Get commission settings
export const getCommissions = async (req, res) => {
    try {
        let commission = await Commission.findOne();
        
        // If no commission exists, create default
        if (!commission) {
            commission = await Commission.create({
                commissionType: 'percentage',
                commissionValue: 5,
                updatedBy: req.user?._id
            });
        }

        res.status(200).json({
            success: true,
            data: { commission }
        });

    } catch (error) {
        console.error('Get commission error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching commission settings'
        });
    }
};

// Update commission settings
export const updateCommission = async (req, res) => {
    try {
        const { commissionType, commissionValue } = req.body;

        if (!commissionType || !['fixed', 'percentage'].includes(commissionType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid commission type. Must be either "fixed" or "percentage"'
            });
        }

        if (commissionValue === undefined || commissionValue < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid commission value is required'
            });
        }

        if (commissionType === 'percentage' && commissionValue > 100) {
            return res.status(400).json({
                success: false,
                message: 'Percentage commission cannot exceed 100%'
            });
        }

        // Find and update the commission (should be only one)
        let commission = await Commission.findOne();
        
        if (commission) {
            commission.commissionType = commissionType;
            commission.commissionValue = commissionValue;
            commission.updatedBy = req.user._id;
            await commission.save();
        } else {
            commission = await Commission.create({
                commissionType,
                commissionValue,
                updatedBy: req.user._id
            });
        }

        res.status(200).json({
            success: true,
            message: 'Commission settings updated successfully',
            data: { commission }
        });

    } catch (error) {
        console.error('Update commission error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating commission settings'
        });
    }
};