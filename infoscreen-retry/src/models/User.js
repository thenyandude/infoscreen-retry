const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

class User {
    constructor(username, password, role = 'user') {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    async setPassword(password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(password, salt);
    }

    async validatePassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    static async save(username, passwordHash, role = 'user') {
        const userData = { username, password: passwordHash, role };

        // New code to ensure the directory exists
        const dirPath = path.join(__dirname, '../private/');
        if (!fs.existsSync(dirPath)){
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(
            path.join(dirPath, username + '.json'), 
            JSON.stringify(userData)
        );
    }

    static load(username) {
        const filePath = path.join(__dirname, 'private/', username + '.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath);
            return JSON.parse(data);
        }
        return null;
    }


}

module.exports = User;