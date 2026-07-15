export type DailyImageForm = {
  imageUrl: string;
  palette?: string | null;
  challengeDate?: string | null;
  challengeDescription?: string | null;
};

export type ImageContainer = {
  imageUrl: string;
  palette?: string[];
  challengeDescription?: string | null;
};
