import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';

import type { DailyImageForm } from '../../shared/client';
import { redis } from '@devvit/web/server';
import { getDate } from '../core/util';

export const forms = new Hono();

forms.post('/daily-image-submit', async (c) => {
  const data = await c.req.json<DailyImageForm>();

  let dateKey: string = new Date().toLocaleDateString('en-GB', { timeZone: 'UTC' })
  if (!data.challengeDate) {
    const dateKeys: string[] = await redis.hKeys("daily_images");
    if (dateKeys) {
      const date: Date | null = getDate(dateKeys[dateKeys.length-1]);
      if (date) {
        dateKey = date.toLocaleDateString('en-GB', { timeZone: 'UTC' })
      }
    }
  } else {
    const date: Date | null = getDate(data.challengeDate)
    dateKey = date && date >= new Date() ? date.toLocaleDateString('en-GB', { timeZone: 'UTC' }) : dateKey
  }
  
  if (data.palette) {
    const hexRegex = /^(#|FF|ff)?(?:[0-9A-Fa-f]{6})(?:\s*,\s*(#|FF|ff)?[0-9A-Fa-f]{6})*$/;
    if (!hexRegex.test(data.palette)) {
      data.palette = null;
    }
  }

  await redis.hSet('daily_images', {[dateKey]: JSON.stringify(data)})

  return c.json<UiResponse>(
    {
      showToast: `Image successfully submitted for date ${dateKey}`,
    },
    200
  );
});
