import ContentHeader from "./content-header";
import ContentFooter from "./content-footer";
import { Drawer } from "react-daisyui";
import { useToggle } from "react-use";
import ContentHeaderMobile from "@/components/content-pages/content-header-mobile";
import { useRouter } from "next/router";
import { useEffect } from "react";

const ContentLayout = ({ children }) => {
  const [isSidebarOpen, toggleSidebar] = useToggle(false);
  const router = useRouter();

  useEffect(() => {
    toggleSidebar(false);
  }, [router.asPath, toggleSidebar]);
  return (
    <Drawer
      side={<ContentHeaderMobile onClose={toggleSidebar} />}
      open={isSidebarOpen}
      onClickOverlay={toggleSidebar}
    >
      <ContentHeader toggleSidebar={toggleSidebar} />
      <div className="min-h-screen px-4 lg:px-0">{children}</div>
      <ContentFooter />
    </Drawer>
  );
};

export default ContentLayout;
