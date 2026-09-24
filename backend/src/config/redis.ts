import { createClient } from "redis";
import { RedisStore } from "connect-redis";

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://session-store:6379"
});

redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});

await redisClient.connect();

const store = new RedisStore({
    client: redisClient,
    prefix: "kochbuch:"
});

export default store;