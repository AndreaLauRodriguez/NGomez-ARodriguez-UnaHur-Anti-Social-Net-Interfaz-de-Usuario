const NodeCache = require("node-cache");

const postCache = new NodeCache({
  stdTTL: 30,
  checkperiod: 10,
  useClones: true,
});

module.exports = postCache;
