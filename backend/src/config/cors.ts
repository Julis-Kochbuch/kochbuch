import { type CorsOptions } from 'cors';

import allowedOrigins from './allowedOrigins.js';

export const corsConfig = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
} satisfies CorsOptions

export default corsConfig;