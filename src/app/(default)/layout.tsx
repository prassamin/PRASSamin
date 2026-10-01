import "../globals.css";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";

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
