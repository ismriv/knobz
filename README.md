# knobz

[![npm version](https://badge.fury.io/js/knobz.svg)](https://badge.fury.io/js/knobz)
[![Build Status](https://travis-ci.org/ismriv/knobz.svg?branch=master)](https://travis-ci.org/ismriv/knobz)
[![Dependency Status](https://gemnasium.com/badges/github.com/ismriv/knobz.svg)](https://gemnasium.com/github.com/ismriv/knobz)

knobz lets you declare and manage feature flags in your JavaScript/Node.js application using [JSON Predicates](https://tools.ietf.org/id/draft-snell-json-test-01.html) to declarative configure whether features should be enabled.

## Quick Start

Install the module using npm:

```shell
npm install knobz --save
```

Usage example in Node.js:

```js
const knobz = require('knobz');

knobz.configure({
  features: [{
    id: 'user_account_lockout',
    description: 'Failed sign-in attempts will cause a user account to be locked.',
    owner: 'Ismael Rivera <me@ismaelrivera.es>',
    enabled: true
  }]
});

if (knobz.isFeatureEnabled('user_account_lockout')) {
  // user account should be locked
}
```

### Phased rollouts

If you're rolling out a new feature, you might want to verify the feature as expected by slowly enabling it for a percentage of your users.

```js
knobz.configure({
  features: [{
    id: 'one_click_checkout_beta',
    description: 'Phased rollout of feature that allows to make online purchases with a single click.',
    owner: 'Ismael Rivera <me@ismaelrivera.es>',
    percentage: 0.2, // 20%
    percentagePath: '/email'
  }]
});
```

The algorithm for determining whether the feature is enabled for a given context is as follows:

```js
djb2(String(valueAtPath)) % 100 < (feature.percentage * 100);
```

### Define feature criteria using JSON Predicate

Features may be enabled only if a given context satisfies its `criteria`, defined as a [JSON Predicate](https://tools.ietf.org/id/draft-snell-json-test-01.html).

The following example enables the feature to a subset of users based on their job title:

```js
knobz.configure({
  features: [{
    id: 'cool_new_email_for_managers',
    criteria: {
      op: 'contains',
      path: '/jobTitle',
      value: 'Manager',
      ignore_case: true
    }
  }]
});
```

## API

### configure(options)

Configure knobz using any of the following options:

- `features`: can be either an array of features or a function to load features dynamically. If a function is passed, it must return a Promise that resolves to an array of features.
- `reloadInterval`: interval in ms used by knobz to reload features when configured with a function to load features dynamically.

### getFeatures(context)

Return object with all features IDs as properties, and true/false as values, indicating whether they are enabled for a given context.

### isFeatureEnabled(featureId, context)

Return true/false if a feature is enabled for a given context.

### reload()

Force a reload by calling the configured function to load features dynamically.

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```shell
npm install
npm test
```

## License

[MIT](LICENSE)
