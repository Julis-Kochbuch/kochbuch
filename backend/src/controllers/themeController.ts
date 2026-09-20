import { type Request, type Response, type NextFunction } from 'express';
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { pipeline } from "node:stream/promises";
import unzipper from "unzipper";

import * as db from '../db/index.js';
import type { Theme, ThemeUpdate } from '@kochbuch/common';
import uploadDir from '../config/uploadDir.js';

async function downloadAndExtractTheme(zipUrl: string, themeSlug: string) {
    const tempDir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), "theme-")
    );

    try {
        const response = await fetch(zipUrl);

        if (!response.ok) {
            throw new Error(
                "Failed to download ZIP"
            );
        }

        if (!response.body) {
            throw new Error("Download returned no body");
        }

        const zipPath = path.join(tempDir, "theme.zip");

        await pipeline(
            response.body,
            fs.createWriteStream(zipPath)
        );

        const extractDir = path.join(tempDir, "extracted");
        await fs.promises.mkdir(extractDir);

        await fs
            .createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: extractDir }))
            .promise();

        const files = await findFiles(extractDir);

        await fs.promises.rm(`${uploadDir}/themes/${themeSlug}`, { recursive: true, force: true });

        await fs.promises.mkdir(`${uploadDir}/themes/${themeSlug}`, { recursive: true });

        for (const file of files) {
            const relativePath = path.relative(extractDir, file);
            const outputPath = path.join(`${uploadDir}/themes`, relativePath);

            await fs.promises.mkdir(path.dirname(outputPath), {
                recursive: true,
            });

            await fs.promises.copyFile(file, outputPath);
        }

        return files.map(file => path.relative(extractDir, file));
    } catch (err: any) {
        throw err
    } finally {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
    }
}

async function findFiles(dir: string) {
    const result: string[] = [];

    async function walk(currentDir: string) {
        const entries = await fs.promises.readdir(currentDir, {
            withFileTypes: true,
        });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                await walk(fullPath);
                continue;
            }

            if (
                entry.isFile() &&
                (
                    entry.name.toLowerCase().endsWith(".css") ||
                    entry.name.toLowerCase() === "theme.json"
                )
            ) {
                result.push(fullPath);
            }
        }
    }

    await walk(dir);
    return result;
}

const themesListGet = async (req: Request, res: Response<Partial<Theme>[]>) => {
    const result = await db.query(`
        SELECT t.slug
        FROM themes t;
        `
    );

    res.status(200).json(result.rows as Partial<Theme>[]);
}

const themePost = async (req: Request<{ slug: string }>, res: Response<{ message: string }>) => {
    const { slug } = req.params;

    try {
        const currentThemeFile = fs.readFileSync(`${uploadDir}/themes/${slug}/theme.json`, "utf-8");
        const currentThemeData: Theme = JSON.parse(currentThemeFile) as Theme;

        if (!(currentThemeData.version && currentThemeData.update_url)) {
            return res.status(500).json({ message: `theme.json is missing crucial properties` });
        }

        const dataResponse = await fetch(`${currentThemeData.update_url}`, {
            method: "GET",
        });

        const data: any = await dataResponse.json();

        if (!dataResponse.ok) {
            return res.status(500).json({ message: `Update data could not be found` });
        }

        const updatedThemeData = data as ThemeUpdate;

        if (currentThemeData.version === updatedThemeData.version) {
            return res.status(400).json({ message: `Already up to date` });
        }

        downloadAndExtractTheme(updatedThemeData.download_url, slug);

    } catch (err: any) {
        console.log(err.message);
        return res.status(400).json({ message: `Updating ${slug} theme failed` });
    }

    res.status(200).json({ message: `${slug} theme updated` });
}

export default { themesListGet, themePost }