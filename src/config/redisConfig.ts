import Redis from "ioredis";
import Redlock from "redlock";
import { serverConfig } from ".";


// export const redisClient = new Redis(serverConfig.REDIS_SERVER_URL);

function connectToRedis() {
    try {

        let redisConnection: Redis;

        return () => {
            if(!redisConnection) {
                redisConnection = new Redis(serverConfig.REDIS_SERVER_URL);
            }
            return redisConnection;
        };

    } catch (error) {
        console.log("redis connection failed: ", error);
        throw error;
    }
}


export const getredisConnectionObj = connectToRedis();

export const redLock = new Redlock([getredisConnectionObj()], {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 200,
    retryJitter: 200
})