const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin'], // Enum to restrict the role to either 'user' or 'admin'
        default: 'user'
    }
});

module.exports = mongoose.model('User', userSchema);
