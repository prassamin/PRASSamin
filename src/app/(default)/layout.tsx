import "../globals.css";
import NavigationBar from "@/components/navigation-bar";
import Footer from "@/components/footer";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar />
      <main className="z-20 relative">{children}</main>
      <Footer />
    </>
  );
}
