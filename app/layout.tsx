import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { FramerHeadStyles } from "./framer-nodes";

const title = "Dharmesh Nayak - Product Designer";
const description =
  "Dharmesh Nayak is a Senior Product Designer in India. Currently at Zomato, building a 0 to 1 AI product, consumer experiences and design systems.";
const ogImage = "https://framerusercontent.com/images/7weGmjhAsfu44Vd1SsArzYYIAQ.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://dharmeshnayak.com"),
  title,
  description,
  generator: "Framer 9801af1",
  robots: { "max-image-preview": "large" },
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "https://framerusercontent.com/images/jysioVs7s1jZCwiyjbUBTqAB4xk.svg", media: "(prefers-color-scheme: light)" },
      { url: "https://framerusercontent.com/images/jysioVs7s1jZCwiyjbUBTqAB4xk.svg", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "https://framerusercontent.com/images/IkGpgnZ59Rcmsv0JWSMaZSoE6c.png",
  },
  openGraph: { type: "website", title, description, url: "https://dharmeshnayak.com/", images: [ogImage] },
  twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  other: {
    "framer-search-index": "https://framerusercontent.com/sites/1CUEc2eQymqbKBrKCLFbQs/searchIndex-NMvP5in0pkGV.json",
    "framer-search-index-fallback": "https://framerusercontent.com/sites/1CUEc2eQymqbKBrKCLFbQs/searchIndex-OMQ8hWOataGv.json",
  },
};

export const viewport: Viewport = { width: "device-width" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link href="https://fonts.gstatic.com/" rel="preconnect" crossOrigin="" />
        <FramerHeadStyles />
      </head>
      <body className="framer-cursor-none" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
