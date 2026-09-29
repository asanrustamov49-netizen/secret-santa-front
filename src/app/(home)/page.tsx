import type { Metadata, ResolvingMetadata } from "next";
import Main from "@/components/pages/main/Main";

// The home page is what gets shared most: its preview names its own address (og:url).
// Only here — in the root layout every page (invite links too) would claim the home URL.
// Everything else in the preview comes from the root layout, resolved against metadataBase.
export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const { openGraph } = await parent;
  return {
    openGraph: {
      type: "website",
      siteName: openGraph?.siteName,
      title: openGraph?.title?.absolute,
      description: openGraph?.description,
      locale: openGraph?.locale,
      alternateLocale: openGraph?.alternateLocale,
      images: openGraph?.images,
      url: "/",
    },
  };
}

const page = () => {
  return <Main />;
};

export default page;
