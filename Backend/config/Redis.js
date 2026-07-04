
const { createClient } = require('redis') ;

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_URL,
    socket: {
        host: 'retrofine-limeish-rainstorm-85956.db.redis.io',
        port: 17419
    }
});


redisClient.on('error', err => console.log('Redis Client Error', err));

module.exports = redisClient;

