import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";

const AnalyticsProvider = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <GoogleAnalytics gaId="G-MKRHWX6XVR" />
      <VercelAnalytics />
      {children}
    </>
  );
};

export { AnalyticsProvider };
