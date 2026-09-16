import { type Options } from 'express-rate-limit'

const rateLimitConfig: Partial<Options> = {
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
};

export default rateLimitConfig;