import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';

import type { DailyImageForm } from '../../shared/client';

export const forms = new Hono();

forms.post('/daily-image-submit', async (c) => {
  const data = await c.req.json<DailyImageForm>();
  console.log('data: ', data);

  return c.json<UiResponse>(
    {
      showToast: 'Form submitted with no message',
    },
    200
  );
});
