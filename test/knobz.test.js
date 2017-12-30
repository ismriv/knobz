const knobz = require('../lib');

const config = {
  features: [{
    id: 'only_id'
  }, {
    id: 'with_criteria',
    criteria: {
      op: 'contains',
      path: '/category',
      value: ['toys']
    }
  }, {
    id: 'with_criteria_and_enabled_false',
    enabled: false,
    criteria: {
      op: 'test',
      path: '/category',
      value: 'fruit'
    }
  }, {
    id: 'with_criteria_and_enabled_true',
    enabled: true,
    criteria: {
      op: 'test',
      path: '/category',
      value: 'jeans'
    }
  }, {
    id: 'no_criteria_and_enabled_true',
    enabled: true
  }, {
    id: 'with_percentage',
    percentage: 20
  }, {
    id: 'with_percentage_and_percentage_path',
    percentage: 30,
    percentagePath: 'category'
  }, {
    id: 'with_percentage_and_criteria',
    percentage: 60,
    percentagePath: '/nested/key',
    criteria: {
      op: 'test',
      path: '/nested/key',
      value: 'sixty'
    }
  }]
};

const contextOne = {
  id: 'uyuta7d',
  category: 'fruit'
};
const contextTwo = {
  id: '2i23uia',
  category: 'jeans'
};
const contextThree = {
  id: 'masdjk1',
  nested: {
    key: 'sixty'
  }
};

describe('knobz', () => {
  beforeAll(() => {
    return knobz.configure(config);
  });

  describe('#getFeatures', () => {
    it('should return an object of features for a given context', () => {
      const actual = knobz.getFeatures(contextThree);
      const expected = {
        no_criteria_and_enabled_true: true,
        only_id: false,
        with_criteria: false,
        with_criteria_and_enabled_false: false,
        with_criteria_and_enabled_true: false,
        with_percentage: true,
        with_percentage_and_criteria: true,
        with_percentage_and_percentage_path: true
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('#isFeatureEnabled', () => {
    describe('when feature does not exist', () => {
      it('should return false', () => {
        expect(knobz.isFeatureEnabled('feature_404')).toBe(false);
      });
    });

    describe('when neither criteria set nor percentage set', () => {
      it('should return false', () => {
        expect(knobz.isFeatureEnabled('only_id')).toBe(false);
      });

      it('should return true if enabled is set to true', () => {
        expect(knobz.isFeatureEnabled('no_criteria_and_enabled_true')).toBe(true);
      });
    });

    describe('when criteria is satisfied', () => {
      it('should return false if enabled is set to false ignoring criteria', () => {
        expect(knobz.isFeatureEnabled('with_criteria_and_enabled_false', contextOne)).toBe(false);
      });

      it('should return true if enabled is set to true', () => {
        expect(knobz.isFeatureEnabled('with_criteria_and_enabled_true', contextTwo)).toBe(true);
      });
    });

    describe('when percentage is set', () => {
      it('should true if satisfied use value from context if percentagePath not set', () => {
        expect(knobz.isFeatureEnabled('with_percentage', contextThree)).toBe(true);
      });

      it('should true if satisfied using specified percentagePath', () => {
        expect(knobz.isFeatureEnabled('with_percentage_and_percentage_path', contextTwo)).toBe(true);
      });
    });

    describe('when both percentage & criteria are set', () => {
      it('should return true if both satisfied', () => {
        expect(knobz.isFeatureEnabled('with_percentage_and_criteria', contextThree)).toBe(true);
      });
    });
  });
});
