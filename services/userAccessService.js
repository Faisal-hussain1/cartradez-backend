const {UsersModel} = require('../models');

const ACCOUNT_STATUS_CACHE_TTL_MS = 30 * 1000;
const ACCOUNT_STATUS_CACHE_MAX_ENTRIES = 5000;
const accountStatusCache = new Map();

const normalizeStatus = (user = {}) => ({
  exists: Boolean(user?._id),
  isBlocked: Boolean(user?.isBlocked),
  blockReason: user?.blockReason || null,
});

const writeCache = ({cacheKey, status}) => {
  if (accountStatusCache.size >= ACCOUNT_STATUS_CACHE_MAX_ENTRIES) {
    const now = Date.now();

    for (const [key, value] of accountStatusCache) {
      if (value.expiresAt <= now) accountStatusCache.delete(key);
    }

    while (accountStatusCache.size >= ACCOUNT_STATUS_CACHE_MAX_ENTRIES) {
      const oldestKey = accountStatusCache.keys().next().value;
      if (!oldestKey) break;
      accountStatusCache.delete(oldestKey);
    }
  }

  accountStatusCache.delete(cacheKey);
  accountStatusCache.set(cacheKey, {
    expiresAt: Date.now() + ACCOUNT_STATUS_CACHE_TTL_MS,
    status,
  });
};

const setAccountStatus = ({userId, isBlocked, blockReason = null}) => {
  if (!userId) return;

  writeCache({
    cacheKey: String(userId),
    status: {
      exists: true,
      isBlocked: Boolean(isBlocked),
      blockReason: blockReason || null,
    },
  });
};

const getAccountStatus = async ({userId, force = false}) => {
  if (!userId) return {exists: false, isBlocked: false, blockReason: null};

  const cacheKey = String(userId);
  const cached = accountStatusCache.get(cacheKey);
  if (!force && cached?.expiresAt > Date.now()) return cached.status;

  const user = await UsersModel.findById(userId)
    .select('_id isBlocked blockReason')
    .lean();
  const status = normalizeStatus(user);

  writeCache({
    cacheKey,
    status,
  });

  return status;
};

module.exports = {
  getAccountStatus,
  setAccountStatus,
};
