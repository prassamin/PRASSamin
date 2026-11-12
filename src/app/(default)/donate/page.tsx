import { metatag } from "@/lib/metatag";
import DonatePageView from "./view";

export const generateMetadata = () => {
  return metatag({
    title: "Support My Work",
    robots: "index, follow",
  });
};

export default function DonatePage() {
  return <DonatePageView />;
}
