import express from 'express';
import rateLimit from 'express-rate-limit'
import rateLimitConfig from './config/rateLimit.js';
import cors from 'cors';
import corsConfig from './config/cors.js';
import session from 'express-session';
import waitPort from 'wait-port';
import fs from "node:fs";

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import uploadsRoutes from './routes/uploadsRoutes.js';

import { checkThemes } from './utils/checkThemes.js';

const sessionSecret = fs
    .readFileSync("/run/secrets/session_secret", "utf8")
    .trim();

console.log("Server starting...");

const app = express();

app.set("trust proxy", 1);

app.use(rateLimit(rateLimitConfig));

app.use(cors(corsConfig));

app.use(express.json());

app.use(
    session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.MODE === "prod",
            sameSite: 'lax'
        }
    })
);

app.use('/auth', authRoutes);

app.use('/user', userRoutes);

app.use('/recipe', recipeRoutes);

app.use('/uploads', uploadsRoutes);



await waitPort({
    host: process.env.DATABASE_HOST!,
    port: 5432,
    timeout: 10000,
    waitForDns: true,
});

checkThemes();



app.listen(process.env.PORT!, () => {
    console.log(`Server running on port ${process.env.PORT!}`);
});