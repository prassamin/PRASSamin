import { FontIcons, FontIconsData } from "@/constants/icons";

export const getFontIcon = (q: string): FontIconsData | null => {
  return (
    FontIcons.find(
      (icon) =>
        icon.name === q || icon.unicode === q || icon.code === parseInt(q)
    ) || null
  );
};

export const getFontIconByName = (q: string): FontIconsData | null => {
  return (
    FontIcons.find((icon) => icon.name.toLowerCase() === q.toLowerCase()) ||
    null
  );
};
