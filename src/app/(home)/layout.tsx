import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import WinterBackdrop from "@/components/ui/winterBackdrop/WinterBackdrop";
import scss from "./home.module.scss";

// Marketing shell: dark header over the hero + footer.
// The future app pages (dashboard, events…) get their own light shell.
export default function HomeLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={scss.home}>
      <WinterBackdrop />
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
