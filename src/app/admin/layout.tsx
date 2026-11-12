import { AUTH_PUBLIC_KEY } from "@/constants/env";
import { AdminLayout } from "./components/admin-layout";
import { SESSION_COOKIE_NAME } from "@/constants";
import { cookies } from "next/headers";
import { UserType } from "@/types";
import jwt from "jsonwebtoken";

const AdminRoot = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  let user: UserType | null;
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    user = null;
  } else {
    user = jwt.verify(token, AUTH_PUBLIC_KEY) as UserType;
  }

  return <AdminLayout user={user}>{children}</AdminLayout>;
};

export default AdminRoot;
