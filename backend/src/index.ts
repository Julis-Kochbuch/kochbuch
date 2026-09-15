import express from 'express';
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

const app = express();

app.use(cors(corsConfig));

app.use(express.json());

app.use(
    session({
        secret: 'super-secret-key', // SPÄTER ÄNDERN => beim Containerbau env file generieren lassen
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // SPÄTER AUF TRUE SETZEN
            sameSite: 'lax' // SPÄTER ÄNDERN
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
}).then(() => {
    console.log(`Connected to database`)
});

checkThemes();



app.listen(process.env.PORT!, () => {
    console.log(`Server running on port ${process.env.PORT!}`);
});