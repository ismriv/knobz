const knobz = require('../lib');

const features = [{
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
}];
const enabledFeature = {
  id: 'enabled_feature',
  enabled: true
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

const delay = (time) => (result) => new Promise(resolve => setTimeout(() => resolve(result), time));

describe('knobz', () => {
  describe('#configure', () => {
    it('should invoke function to fetch features', () => {
      const fetchFeaturesMock = jest.fn()
        .mockReturnValue(Promise.resolve([enabledFeature]));

      return knobz.configure({
        features: fetchFeaturesMock
      }).then(() => {
        expect(fetchFeaturesMock).toHaveBeenCalledTimes(1);
      });
    });

    it('should invoke function to reload features every given interval', () => {
      const fetchFeaturesMock = jest.fn()
        .mockReturnValue(Promise.resolve([enabledFeature]));

      return knobz.configure({
        features: fetchFeaturesMock,
        reloadInterval: 20
      }).then(delay(70)).then(() => {
        expect(fetchFeaturesMock).toHaveBeenCalledTimes(4);
      });
    });

    it('should configure features returned from function', () => {
      const fetchFeaturesMock = jest.fn()
        .mockReturnValue(Promise.resolve([enabledFeature]));

      return knobz.configure({
        features: fetchFeaturesMock
      }).then(() => {
        expect(knobz.isFeatureEnabled(enabledFeature.id)).toBe(true);
      });
    });
  });

  describe('#reload', () => {
    it('should keep existing features if no function to reload features is set', () => {
      return knobz.configure({
        features: [enabledFeature]
      }).then(() => {
        return knobz.reload();
      }).then(() => {
        expect(knobz.isFeatureEnabled(enabledFeature.id)).toBe(true);
      });
    });

    it('should reload features using fetch function set', () => {
      const fetchFeaturesMock = jest.fn()
        .mockReturnValueOnce(Promise.resolve([]))
        .mockReturnValue(Promise.resolve([enabledFeature]));

      return knobz.configure({
        features: fetchFeaturesMock
      }).then(() => {
        expect(knobz.isFeatureEnabled(enabledFeature.id)).toBe(false);
      }).then(() => {
        return knobz.reload();
      }).then(() => {
        expect(fetchFeaturesMock).toHaveBeenCalledTimes(2);
        expect(knobz.isFeatureEnabled(enabledFeature.id)).toBe(true);
      });
    });
  });

  describe('#getFeatures', () => {
    beforeAll(() => {
      return knobz.configure({features});
    });

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
    beforeAll(() => {
      return knobz.configure({features});
    });

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

  describe('#on(check)', () => {
    it('should call event listener whenever #isFeaturedEnabled is called', () => {
      const mockCallback = jest.fn();

      return knobz.configure({
        features: []
      }).then(() => {
        knobz.on('check', mockCallback);
        knobz.isFeatureEnabled('abc');
        expect(mockCallback).toHaveBeenCalledTimes(1);
      });
    });

    it('should call event listener with enabled, featureId and context', () => {
      const mockCallback = jest.fn();

      return knobz.configure({
        features: []
      }).then(() => {
        knobz.on('check', mockCallback);
        knobz.isFeatureEnabled('abc', {name: 'John'});
        expect(mockCallback).toBeCalledWith({
          enabled: false,
          featureId: 'abc',
          context: {
            name: 'John'
          }
        });
      });
    });
  });

  describe('#on(reload)', () => {
    it('should call event listener whenever features are reloaded', () => {
      const mockCallback = jest.fn();
      const fetchFeaturesMock = jest.fn()
        .mockReturnValue(Promise.resolve([enabledFeature]));

      knobz.on('reload', mockCallback);

      return knobz.configure({
        features: fetchFeaturesMock,
        reloadInterval: 20
      }).then(delay(70)).then(() => {
        expect(mockCallback).toHaveBeenCalledTimes(3);
        expect(mockCallback).toBeCalledWith({
          features: [enabledFeature]
        });
      });
    });

    it('should call event listener with features dynamically fetched', () => {
      const mockCallback = jest.fn();
      const fetchFeaturesMock = jest.fn()
        .mockReturnValue(Promise.resolve([enabledFeature]));

      knobz.on('reload', mockCallback);

      return knobz.configure({
        features: fetchFeaturesMock
      }).then(() => {
        return knobz.reload();
      }).then(() => {
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toBeCalledWith({
          features: [enabledFeature]
        });
      });
    });
  });
});
