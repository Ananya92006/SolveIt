const {createClient}=require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-19516.crce281.ap-south-1-3.ec2.cloud.redislabs.com',
        port: 19516
    }
});
module.exports=redisClient;