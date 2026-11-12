import { metatag } from "@/lib/metatag";
import { SignInView } from "./view";

export default function Page() {
  return <SignInView />;
}

export const generateMetadata = () => {
  return metatag({
    title: "Sign In",
    description: "Authenticate to access the admin studio and portfolio dashboard.",
    robots: "noindex, nofollow",
  });
};
