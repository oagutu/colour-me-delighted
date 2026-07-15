import { Hono } from 'hono';
import { context, redis, reddit, media, RichTextBuilder, Post } from '@devvit/web/server';
import type { CommentResponse } from '../../shared/api';
import { DailyImageForm, ImageContainer } from '../../shared/client';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

api.post('/share', async (c) => {
  const { image, commentText } = await c.req.json();

  const uploaded = await media.upload({
    url: image,
    type: 'image',
  });

  const commentRichtext = new RichTextBuilder()
    .paragraph((p) => {
      p.text({ text: commentText ?? 'Check out my result!' });
    })
    .paragraph((p) => {
      p.image({ mediaUrl: uploaded.mediaUrl });
    });

  // Submit the comment under the current post
  const comment = await reddit.submitComment({
    id: context.postId!,
    richtext: commentRichtext,
    runAs: 'USER',
  });

  // add user to users record: username, points
  const username = await reddit.getCurrentUsername();
  let points = 0;
  if (username) {
    if (await !redis.exists("user_points")) {
      points = 1
      await redis.hSet("user_points", {username: "1"});
    } else {
      points = await redis.hIncrBy("user_points", username, 1);
    }
  }

  return c.json<CommentResponse>({ id: comment.id, url: comment.url, userPoints: points, success: true });
});

api.get('/daily-image', async (c) => {
  const { postId } = context;
  
  if (!postId) {
    console.error('API Init Error: postId not found in devvit context');
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required but missing from context',
      },
      400
    );
  }

  const dailyImageStr = await redis.hGet("posts", postId);

  let dailyImage: DailyImageForm = {
    imageUrl: "https://i.redd.it/fs6v8on430dh1.png",
  }
  if (dailyImageStr) {
    dailyImage = await JSON.parse(dailyImageStr);
  }
  return c.json<ImageContainer>({
    imageUrl: dailyImage.imageUrl,
    palette: dailyImage.palette?.split(","),
    challengeDescription: dailyImage.challengeDescription
  });
});
