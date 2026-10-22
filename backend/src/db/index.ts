import { DatabaseError, Pool } from 'pg';
import fs from "node:fs";

export const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
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