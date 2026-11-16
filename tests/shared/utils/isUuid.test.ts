import { isUuid } from '../../../src/shared/utils/isUuid';

const UUID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

describe('isUuid', () => {
  it.each([UUID, UUID.toUpperCase()])('%s es un uuid', (value) => {
    expect(isUuid(value)).toBe(true);
  });

  it.each(['rosaceae', '', UUID.replaceAll('-', ''), `${UUID}0`])(
    '%j no es un uuid',
    (value) => {
      expect(isUuid(value)).toBe(false);
    }
  );
});
