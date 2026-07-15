export type CommentResponse = {
  id: string | null;
  url: string | null;
  success: boolean;
  userPoints: number;
}

export type UserProfile = {
  points: number;
};

export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};
