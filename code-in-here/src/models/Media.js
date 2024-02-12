const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['image', 'video', 'text'] // Add more types if needed
    },
    path: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // Duration in milliseconds
        default: 0
    },
    order: {
        type: Number,
        default: 0
    },
    text: {
        type: String,
        default: ''
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;
