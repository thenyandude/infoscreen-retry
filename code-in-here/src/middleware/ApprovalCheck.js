// approvalCheck.js
const DbUser = require('../models/DbUser');

const approvalCheck = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).send('User not authenticated');
    }

    try {
        const user = await DbUser.findById(req.user.id);

        if (!user || !user.isApproved) {
            return res.status(403).send('Access denied. User account not approved.');
        }

        next();
    } catch (error) {
        res.status(500).send('Server error');
    }
};

module.exports = approvalCheck;
