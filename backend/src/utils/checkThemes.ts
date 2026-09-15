import fs from "fs/promises";
import type { PathLike } from 'fs';

import * as db from '../db/index.js';

export async function checkThemes() {
    const themes_dir = "/app/uploads/themes";

    await fs.mkdir(`${themes_dir}`, { recursive: true });

    const getFileNames = async (path: PathLike) => {
        try {
            return await fs.readdir(path);
        } catch (err) {
            if (err instanceof Error && "code" in err && err.code === "ENOENT") {
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