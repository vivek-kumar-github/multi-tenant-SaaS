const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

(async () => {
  await redisClient.connect();
  console.log('Redis connected');
})();

const tenantKey = (tenantId) => `tenant:${tenantId}:config`;

const getConfig = async (tenantId) => {
  const raw = await redisClient.get(tenantKey(tenantId));
  return raw ? JSON.parse(raw) : null;
};

const setConfig = async (tenantId, data) => {
  await redisClient.set(tenantKey(tenantId), JSON.stringify(data), { EX: 60 * 5 });
};

const deleteConfig = async (tenantId) => {
  await redisClient.del(tenantKey(tenantId));
};

module.exports = { getConfig, setConfig, deleteConfig };