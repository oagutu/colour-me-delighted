import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { createPost } from '../core/post';

export const menu = new Hono();

menu.post('/daily-image-create', async (c) => {
// date(key), image_url, palette(opt), challenge_desc(opt)
  return c.json<UiResponse>({
    showForm: {
      name: 'dailyImageForm',
      form: {
        title: 'Daily Image Form',
        fields: [
          {
            type: 'image',
            name: 'image',
            label: 'Upload Challenge Image',
            required: true,
          },
          {
            type: 'string',
            name: 'challengDate',
            label: 'Enter Challenge date',
            required: false,
          },
          {
            type: 'paragraph',
            name: 'palette',
            label: 'Enter Comma Separated Color Palette',
            required: false,
          },
          {
            type: 'paragraph',
            name: 'challengeDescription',
            label: 'Enter Coloring Challenge/Constraint Description',
            required: false,
          },
        ],
        acceptLabel: 'Submit',
        cancelLabel: 'Cancel',
      },
    },
  });
});


menu.post('/post-create', async (c) => {
  try {
    const body = await c.req.json();
    console.log(body);
    const post = await createPost();

    return c.json<UiResponse>(
      {
        // navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
        navigateTo: `https://reddit.com/r/${context.subredditName}`,

      },
      200
    );
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<UiResponse>(
      {
        showToast: 'Failed to create post',
      },
      400
    );
  }
});
