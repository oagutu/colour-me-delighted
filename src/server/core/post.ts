import { Post, reddit } from '@devvit/web/server';

export const createPost = async (title?: string) => {
  title = (title ?? 'colour-me-delighted') + `(${new Date().toLocaleDateString('en-GB', { timeZone: 'UTC' })})`;
  const post: Post =  await reddit.submitCustomPost({
    title: title,
  });

  return post;
};
