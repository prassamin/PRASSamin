import { metatag } from "@/lib/metatag";
import AdminMediaView from "./view";

export const generateMetadata = () => {
  return metatag({
    title: "Storage | Admin",
    robots: "noindex, nofollow",
  });
};

const AdminMediaPage = () => {
  return <AdminMediaView />;
};

export default AdminMediaPage;
