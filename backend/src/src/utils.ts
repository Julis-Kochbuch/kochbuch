import bcrypt from 'bcrypt';
import fs from "fs/promises";

import * as db from '../db/index.js';
import type { PathLike } from 'fs';

export async function createFirstUser() {
    const result = await db.query(`
        SELECT (COUNT(*) > 0) AS users_exists
        FROM users;
        `
    );

    if (result.rows[0].users_exists) return;

    const hashedPassword = await bcrypt.hash(`1234`, 10);

    return new Promise((acc, rej) => {
        db.query(`
            INSERT INTO users (name, password_hash, role)
            VALUES
                ($1, $2, $3)
            ON CONFLICT (name) DO NOTHING;
            `, [`admin`, hashedPassword, 10],
            (err) => {
                if (err) return rej(err);

                console.log(`Created admin`);
                acc();
            },
        );
    });
}



export async function checkThemes() {
    const themes_dir = "/app/uploads/themes";

    await fs.mkdir(`${themes_dir}`, { recursive: true });

    const getFileNames = async (path: PathLike) => {
        try {
            return await fs.readdir(path);
        } catch (err) {
            if (err.code === "ENOENT") {
                return [];
            }
            throw err;
        }
    }

    const themes = await getFileNames(themes_dir)

    if (themes.length === 0) return;

    await db.query(`
        DELETE FROM themes
        WHERE slug <> ALL($1::VARCHAR(32)[]);
        `, [themes]);

    await Promise.all(
        themes.map(theme =>
            db.query(`
            INSERT INTO themes (slug)
            VALUES ($1)
            ON CONFLICT DO NOTHING;
        `, [theme]))
    );
}



export function requireAuth(minRole: number) {
    return function (req, res, next) {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userRole = req.session.role ?? 0;

        if (userRole < minRole) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    };
}