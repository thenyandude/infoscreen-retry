const bcrypt = require('bcryptjs');

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
        fs.writeFileSync(
            path.join(__dirname, 'private/', username + '.json'), 
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