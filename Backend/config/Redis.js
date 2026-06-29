const redis= require ('redis');
require('dotenv').config();

const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'love-triumphant-persistent-88134.db.redis.io',
        port: 11751
    }
});

module.exports = redisClient;