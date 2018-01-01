const jsonPredicate = require('json-predicate');

const DEFAULT_PERCENTAGE_PATH = '/id';

let featuresById = {};
let reloadFeatures;
let reloadIntervalFn;

function configure({features, reloadInterval}) {
  if (typeof features === 'function') {
    reloadFeatures = features;
    return reloadFeatures().then(configureFeatures).then(() => configureReload(reloadInterval));
  }

  return new Promise((resolve) => {
    reloadFeatures = null;
    configureFeatures(features);
    return resolve();
  });
}

function configureFeatures(features) {
  featuresById = features.reduce((result, feature) => {
    result[feature.id] = feature;
    return result;
  }, {});
}

function configureReload(reloadInterval) {
  clearInterval(reloadIntervalFn);
  if (reloadFeatures && reloadInterval > 0) {
    reloadIntervalFn = setInterval(reload, reloadInterval);
  }
}

function reload() {
  if (!reloadFeatures) {
    return Promise.resolve();
  }
  return reloadFeatures().then(configureFeatures);
}

function getFeatures(context) {
  return Object.keys(featuresById).reduce((result, featureId) => {
    result[featureId] = isFeatureEnabled(featureId, context);
    return result;
  }, {});
}

function isFeatureEnabled(featureId, context) {
  const feature = featuresById[featureId];

  if (!feature) {
    return false;
  }

  // Return false if feature is explicity disabled
  if (feature.enabled === false) {
    return false;
  }

  // Return true if feature enabled but neither criteria nor percentage set
  if (feature.enabled && !feature.criteria && typeof feature.percentage !== 'number') {
    return true;
  }

  // Evaluate criteria (and percentage) if set
  if (feature.criteria && typeof feature.criteria === 'object') {
    return isFeatureEnabledForCriteria(feature, context);
  }

  // Evaluate percentage if set
  if (typeof feature.percentage === 'number') {
    return isFeatureEnabledForPercentage(feature, context);
  }

  return false;
}

function isFeatureEnabledForCriteria(feature, context) {
  const isCriteriaSatisfied = jsonPredicate.test(context, feature.criteria);

  if (isCriteriaSatisfied && typeof feature.percentage === 'number') {
    return isFeatureEnabledForPercentage(feature, context);
  }

  return isCriteriaSatisfied;
}

function isFeatureEnabledForPercentage(feature, context) {
  const keyPath = feature.percentagePath || DEFAULT_PERCENTAGE_PATH;
  const keyValue = jsonPredicate.dataAtPath(context, keyPath);
  return djb2(String(keyValue)) % 100 < (feature.percentage * 100);
}

function djb2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; // hash * 33 + char
  }
  return hash;
}

module.exports = {
  configure,
  getFeatures,
  isFeatureEnabled,
  reload
};
