import bcrypt from 'bcrypt';

import * as db from '../db/index.js';

const login = async (req, res) => {
    const { username, password } = req.body;

    if (req.session.userId) {
        req.session.destroy();
    }

    const result = await db.query(`
        SELECT u.id, u.name, u.role, u.password_hash, a.id AS key_id
        FROM users u
        JOIN api_keys_inner a ON u.id = a.user_id
        WHERE u.name = $1;
        `,
        [username]
    );

    if (!result.rows[0]) {
        return res.status(400).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valid) {
        return res.status(400).json({ error: 'Wrong password' });
    }

    req.session.userId = result.rows[0].id;
    req.session.userName = result.rows[0].name;
    req.session.apiKeyId = result.rows[0].key_id;
    req.session.role = result.rows[0].role;

    res.status(200).json({ message: 'Logged in successfully' });
}

const logout = async (req, res) => {
    if (req.session.userId) {
        req.session.destroy(() => {
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } else {
        res.status(200).json({ message: 'Wasn\'t logged in before, won\'t be logged in afterwards' });
    }
}

export default {login, logout}