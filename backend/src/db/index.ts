import { DatabaseError, Pool } from 'pg';
import fs from "node:fs";

const pgPassword = fs
    .readFileSync("/run/secrets/pg_pw_admin", "utf8")
    .trim();

export const pool = new Pool({
    user: process.env.DATABASE_USER,
    password: pgPassword,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_DB,
});

export const query = async <T,>(text: string, params?: any[]) => {
    try {
        return await pool.query(text, params);
    } catch (err) {
        if (err instanceof DatabaseError) {
            console.error('DB ERROR:', {
                text,
                params,
                code: err.code,
                message: err.message,
            });
        } else {
            console.error('UNKNOWN ERROR:', {
                text,
                params,
                err,
            });
        }
        throw err;
    }
}