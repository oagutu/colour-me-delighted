export type DailyImageForm = {
  imageUrl: string;
  palette?: string | null;
  challengeDate?: string | null;
  challengeDescription?: string | null;
};

export type ImageContainer = {
  imageUrl: string;
  imageRegionsUrl: string;
  palette?: string[];
};

