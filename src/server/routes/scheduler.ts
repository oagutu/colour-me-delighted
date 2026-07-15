import { redis, type Post, type TaskResponse } from "@devvit/web/server";
import { Hono } from "hono";
import { createPost } from "../core/post";

export const schedulers = new Hono();

schedulers.post("/create-post-task", async (c) => {

  console.log(`task:create-post-task running`);
  try{
    const post: Post = await createPost();
    const dateKey: string = new Date().toLocaleDateString('en-GB', { timeZone: 'UTC' });
    const dailyImageStr = await redis.hGet("daily_images", dateKey);
    if (dailyImageStr) {
      await redis.hSet(
        'posts', 
        {[post.id]: JSON.stringify({"image": await JSON.parse(dailyImageStr)})}
      )
    }
    
    console.log(`task:create-post-task completed. postId:${post.id}`);
  } catch (error) {
    console.error(`task:create-post-task:e01: Error creating post: ${error}`);
  }
  
  return c.json<TaskResponse>({ status: "ok" }, 200);
});
