import bcrypt from 'bcrypt';

import * as db from '../db/index.js';

const allUsersGet = async (req, res) => {
    const result = await db.query(`
        SELECT u.id, u.name, u.role
        FROM users u
        ORDER BY LOWER(u.name) ASC;
        `
    );

    res.status(200).json(result.rows);
}

const innerApiKeysGet = async (req, res) => {
    const result = await db.query(`
        SELECT a.id AS key_id, a.name as foreign_user_name, u.name as local_user_name
        FROM api_keys_inner a
        LEFT JOIN users u ON u.id = a.user_id
        WHERE u.id <> $1
        ORDER BY LOWER(u.name) NULLS LAST, LOWER(a.name) ASC;
        `,
        [req.session.userId]
    );

    const innerApiKeys_parsed = {
        local: result.rows.filter((entry) => entry.local_user_name).map(key_set => ({
            "name": key_set.local_user_name,
            "key_id": key_set.key_id
        })) ?? [],
        foreign: result.rows.filter((entry) => !entry.local_user_name).map(key_set => ({
            "name": key_set.foreign_user_name,
            "key_id": key_set.key_id
        })) ?? []
    }

    res.status(200).json(innerApiKeys_parsed);
}

const meGet = async (req, res) => {
    const result = await db.query(`
        SELECT u.id, u.name, u.role, u.setting_theme_slug, u.setting_advanced_options
        FROM users u
        WHERE u.id = $1;
        `,
        [req.session.userId]
    );

    const user_parsed = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        role: result.rows[0].role,
        setting_theme_slug: result.rows[0].setting_theme_slug,
        setting_advanced_options: result.rows[0].setting_advanced_options,
    }

    res.status(200).json(user_parsed);
}

const mePost = async (req, res) => {
    const { username, new_password, current_password } = req.body;

    const password = await db.query(`
        SELECT u.password_hash
        FROM users u
        WHERE u.id = $1;
        `,
        [req.session.userId]
    );

    const valid = await bcrypt.compare(current_password, password.rows[0].password_hash);
    if (!valid) {
        return res.status(400).json({ error: 'Wrong password' });
    }

    const client = await db.pool.connect();
    
    try {
        await client.query(`BEGIN`);

        if (username && new_password) {
            const hashedPassword = await bcrypt.hash(new_password, 10);

            await client.query(`
                UPDATE users
                SET
                    name = $2,
                    password_hash = $3
                WHERE id = $1;
                `, [req.session.userId, username, hashedPassword]);
        } else if (username) {
            await client.query(`
                UPDATE users
                SET
                    name = $2
                WHERE id = $1;
                `, [req.session.userId, username]);
        } else if (new_password) {
            const hashedPassword = await bcrypt.hash(new_password, 10);

            await client.query(`
                UPDATE users
                SET
                    password_hash = $2
                WHERE id = $1;
                `, [req.session.userId, hashedPassword]);
        }

        await client.query('COMMIT');

        req.session.userName = username;

        res.status(201).json({ message: 'User modified successfully' });
    } catch (err) {
        await client.query('ROLLBACK');

        if (err.code === '22001') {
            return res.status(400).json({ message: 'Too long string submitted' });
        }

        if (err.code === '23502') {
            return res.status(400).json({ message: 'Username must not be empty' });
        }

        if (err.code === '23505') {
            return res.status(400).json({ message: 'Username already taken' });
        }

        console.error(err);

        res.status(500).json({
            message: 'Modifying user failed'
        });

    } finally {
        client.release();
    }
}

const newUserPost = async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(`
        INSERT INTO users (name, password_hash, role, setting_theme_slug)
            VALUES ($1, $2, 0, $3)
            RETURNING id;
        `, [username, hashedPassword, "default"])
        .catch(err => {
            if (err.code === '22001') {
                return res.status(400).json({ message: 'Too long string submitted' });
            }
            
            if (err.code === '23502') {
                return res.status(400).json({ message: 'Username must not be empty' });
            }

            if (err.code === '23505') {
                return res.status(400).json({ message: 'Username already taken' });
            }
            
            return res.status(400).json({ message: 'Bad Request' });
        });

    res.status(201).json({ message: 'User created successfully', id: result.rows[0].id });
}

const themesListGet = async (req, res) => {
    const result = await db.query(`
        SELECT t.slug
        FROM themes t;
        `
    );

    const user_parsed = {
        themes: result.rows,
    }

    res.status(200).json(user_parsed);
}

const themePost = async (req, res) => {
    const { slug } = req.body;

    await db.query(`
        UPDATE users
        SET
            setting_theme_slug = $2
        WHERE id = $1;
        `, [req.session.userId, slug]);

    res.status(200).json({ message: 'Theme updated successfully' });
}

const userDelete = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Wrong password' });
    }

    const password_check = await db.query(`
        SELECT u.password_hash
        FROM users u
        WHERE u.id = $1;
        `,
        [req.session.userId]
    );

    const valid = await bcrypt.compare(password, password_check.rows[0].password_hash);
    if (!valid) {
        return res.status(400).json({ error: 'Wrong password' });
    }

    await db.query(`
        DELETE FROM users
        WHERE id = $1;
        `, [id]);
    
    res.status(200).json({ message: 'User deleted' });
}


const userPost = async (req, res) => {
    const { id } = req.params;
    const { username, role, new_password, admin_password } = req.body;

    const client = await db.pool.connect();

    try {
        await client.query(`BEGIN`);

        if (username && role) {
            await client.query(`
                UPDATE users
                SET
                    name = $2,
                    role = $3
                WHERE id = $1;
                `, [id, username, role]);
        } else if (new_password && admin_password) {
            const password_check = await db.query(`
                SELECT u.password_hash
                FROM users u
                WHERE u.id = $1;
                `,
                [req.session.userId]
            );

            const valid = await bcrypt.compare(admin_password, password_check.rows[0].password_hash);
            if (!valid) {
                return res.status(400).json({ error: 'Wrong password' });
            }
            
            const hashedPassword = await bcrypt.hash(new_password, 10);

            await client.query(`
                UPDATE users
                SET
                    password_hash = $2
                WHERE id = $1;
                `, [id, hashedPassword]);
        }

        await client.query('COMMIT');

        res.status(201).json({ message: 'User modified successfully' });
    } catch (err) {
        await client.query('ROLLBACK');

        if (err.code === '22001') {
            return res.status(400).json({ message: 'Too long string submitted' });
        }

        if (err.code === '23502') {
            return res.status(400).json({ message: 'Username must not be empty' });
        }

        if (err.code === '23505') {
            return res.status(400).json({ message: 'Username already taken' });
        }

        console.error(err);

        res.status(500).json({
            message: 'Modifying user failed'
        });

    } finally {
        client.release();
    }
}

export default {allUsersGet, innerApiKeysGet, meGet, mePost, newUserPost, themesListGet, themePost, userDelete, userPost}