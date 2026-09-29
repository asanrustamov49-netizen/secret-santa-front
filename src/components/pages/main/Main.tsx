import Hero from "@/components/widgets/mainPageWidgets/hero/Hero";
import TrustStrip from "@/components/widgets/mainPageWidgets/trustStrip/TrustStrip";
import HowItWorks from "@/components/widgets/mainPageWidgets/howItWorks/HowItWorks";
import Features from "@/components/widgets/mainPageWidgets/features/Features";
import RecipientPreview from "@/components/widgets/mainPageWidgets/recipientPreview/RecipientPreview";
import GiftIdeas from "@/components/widgets/mainPageWidgets/giftIdeas/GiftIdeas";
import About from "@/components/widgets/mainPageWidgets/about/About";
import FinalCta from "@/components/widgets/mainPageWidgets/finalCta/FinalCta";

const Main = () => {
  return (
    <>
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <Features />
      <RecipientPreview />
      <GiftIdeas />
      <About />
      <FinalCta />
    </>
  );
};

export default Main;
