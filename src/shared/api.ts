export type CommentResponse = {
  id: string | null;
  url: string | null;
  success: boolean;
  userPoints: number;
}

export type UserProfile = {
  points: number;
};
