import { metatag } from "@/lib/metatag";
import { AdminBody } from "@/app/admin/components/admin-body";
import { McpConnectView } from "./view";
import { getOrigin } from "@/lib/url";

export const generateMetadata = () => {
  return metatag({
    title: "Connect MCP Agents | Admin",
    robots: "noindex, nofollow",
  });
};

const AdminMcpConnectPage = async () => {
  const origin = await getOrigin();
  return (
    <AdminBody>
      <McpConnectView origin={origin} />
    </AdminBody>
  );
};

export default AdminMcpConnectPage;
