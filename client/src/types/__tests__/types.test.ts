import { describe, it, expect } from 'vitest';
import { MOOD_EMOJIS, RANT_TYPE_NAMES } from '../index';

describe('Type constants', () => {
  it('MOOD_EMOJIS has all 6 mood types', () => {
    expect(Object.keys(MOOD_EMOJIS)).toHaveLength(6);
    expect(MOOD_EMOJIS.happy).toBe('😊');
    expect(MOOD_EMOJIS.love).toBe('🥰');
    expect(MOOD_EMOJIS.sad).toBe('😢');
    expect(MOOD_EMOJIS.angry).toBe('😠');
    expect(MOOD_EMOJIS.thinking).toBe('🤔');
    expect(MOOD_EMOJIS.sleepy).toBe('😴');
  });

  it('RANT_TYPE_NAMES has all 3 types', () => {
    expect(Object.keys(RANT_TYPE_NAMES)).toHaveLength(3);
    expect(RANT_TYPE_NAMES.rant).toBe('吐槽');
    expect(RANT_TYPE_NAMES.scold).toBe('骂人');
    expect(RANT_TYPE_NAMES.complain).toBe('抱怨');
  });
});
