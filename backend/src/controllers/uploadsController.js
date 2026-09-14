import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

import * as db from '../db/index.js';

export const uploadDir = "/app/uploads";

const uploadRecipeImage = async (req, res) => {
    const { id } = req.params;

    const authorization_result = await db.query(`
        SELECT (a.role = 10) AS is_authorized
        FROM access_permissions a
        WHERE a.recipe_id = $1 AND a.key_id = $2;
        `,
        [id, req.session.apiKeyId]
    );

    if (!authorization_result.rows[0]?.is_authorized) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const files = req.files ?? [];
    const slots = Array.isArray(req.body.slots)
        ? req.body.slots
        : [req.body.slots];

    if (!(slots.length === files.length)) {
        return res.status(400).json({ message: 'Bad request' });
    }

    for (let i = 0; i < files.length; i++) {
        const type = await fileTypeFromBuffer(files[i].buffer);

        if (!type) {
            return res.status(400).json({ message: 'Unknown file' });
        }

        if (!["image/png", "image/jpeg", "image/webp"].includes(type.mime)) {
            return res.status(400).json({ message: 'Wrong file type' });
        }

        const image = await sharp(files[i].buffer)
            .resize({
                width: 1080,
                height: 1080,
                fit: "inside",
                withoutEnlargement: true
            })
            .webp()
            .toBuffer();

        await fs.mkdir(`${uploadDir}/images/recipe-${id}`, { recursive: true });
        await fs.writeFile(`${uploadDir}/images/recipe-${id}/${slots[i]}.webp`, image);
    }

    res.status(200).json({ message: 'Upload successfull' });
}

const recipeImageGet = async (req, res) => {
    const { recipe_id, image_name } = req.params;

    const authorization_result = await db.query(`
        SELECT (a.role >= 0) AS is_authorized
        FROM access_permissions a
        WHERE a.recipe_id = $1 AND a.key_id = $2;
        `,
        [recipe_id, req.session.apiKeyId]
    );

    if (!authorization_result.rows[0]?.is_authorized) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const file = `${uploadDir}/images/recipe-${recipe_id}/${image_name}`;

    res.sendFile(file, err => {
        if (err) {
            return res.status(404).json({ message: 'Image not found' });
        }
    });
}

const themeFileGet = async (req, res) => {
    const { theme_slug, file_name } = req.params;

    const file = `${uploadDir}/themes/${theme_slug}/${file_name}`;

    res.sendFile(
        file,
        {
            headers: {
                "Cache-Control": "public, max-age=31536000, immutable"
            }
        },
        err => {
            if (err) {
                return res.status(404).json({ message: 'File not found' });
            }
        });
}

export default {uploadRecipeImage, recipeImageGet, themeFileGet}