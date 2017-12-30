# knobz
knobz lets you declare and manage feature flags in your JavaScript/Node.js application using [JSON Predicates](https://tools.ietf.org/id/draft-snell-json-test-01.html) to declarative configure whether features should be enabled.

[![Build Status](https://travis-ci.org/ismriv/knobz.svg?branch=master)](https://travis-ci.org/ismriv/knobz)
[![Dependency Status](https://gemnasium.com/badges/github.com/ismriv/knobz.svg)](https://gemnasium.com/github.com/ismriv/knobz)

## Quick Start

Install the module using npm:

```bash
$ npm install knobz --save
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

Do phased rollouts to percentages of your users to verify that the feature behaves as expected:

```js
knobz.configure({
  features: [{
    id: 'one_click_checkout_beta',
    description: 'Phased rollout of feature that allows to make online purchases with a single click.',
    owner: 'Ismael Rivera <me@ismaelrivera.es>',
    percentage: 10,
    percentagePath: '/email'
  }]
});

if (knobz.isFeatureEnabled('one_click_checkout_beta'), user) {
  // display one-click checkout button
}
```

Restrict feature to a subset of users based on their job title:

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

if (knobz.isFeatureEnabled('cool_new_email_for_managers'), user) {
  // send new email only to managers
}
```

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## License

[MIT](LICENSE)
