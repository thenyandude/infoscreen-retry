const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const dbUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin', 'otherRoles']
    }
});

// Pre-save middleware for password hashing
dbUserSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare passwords
dbUserSchema.methods.validatePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const DbUser = mongoose.model('DbUser', dbUserSchema);

module.exports = DbUser;