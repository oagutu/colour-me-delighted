import { useState } from "react";
import { ImageContainer } from "../../shared/client";

export const useDailyImage = () => {
  const [dailyImage] = useState<ImageContainer|null>({
    imageRegionsUrl: "https://res.cloudinary.com/dr5li7c0i/image/upload/v1783434538/bunny-regions_fzlqgk.png",
    imageUrl: "https://res.cloudinary.com/dr5li7c0i/image/upload/v1783434539/bunny_dnmx9o.png"
  });

  return {
    dailyImage
  }

};
