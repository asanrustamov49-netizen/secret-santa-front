import Hero from "@/components/widgets/mainPageWidgets/hero/Hero";
import TrustStrip from "@/components/widgets/mainPageWidgets/trustStrip/TrustStrip";
import HowItWorks from "@/components/widgets/mainPageWidgets/howItWorks/HowItWorks";
import TryDraw from "@/components/widgets/mainPageWidgets/tryDraw/TryDraw";
import Features from "@/components/widgets/mainPageWidgets/features/Features";
import RecipientPreview from "@/components/widgets/mainPageWidgets/recipientPreview/RecipientPreview";
import GiftIdeas from "@/components/widgets/mainPageWidgets/giftIdeas/GiftIdeas";
import About from "@/components/widgets/mainPageWidgets/about/About";
import Faq from "@/components/widgets/mainPageWidgets/faq/Faq";
import FinalCta from "@/components/widgets/mainPageWidgets/finalCta/FinalCta";

const Main = () => {
  return (
    <>
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <TryDraw />
      <Features />
      <RecipientPreview />
      <GiftIdeas />
      <About />
      <Faq />
      <FinalCta />
    </>
  );
};

export default Main;
