import { useEffect, useState } from "react";
import { ImageContainer } from "../../shared/client";

export const useDailyImage = () => {
  const [ dailyImage, setDailyImage ] = useState<ImageContainer|null>({
    imageUrl: "https://i.redd.it/fs6v8on430dh1.png",
  });

  useEffect(() => {
    const getImage = async () => {
      try {
        const res = await fetch('/api/daily-image');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ImageContainer = await res.json();
        setDailyImage(data)
      } catch (err) {
        console.error('Failed to fetch image of the day', err);
      }
    };
    void getImage();
  }, [])

  

  return {
    dailyImage
  }

};
