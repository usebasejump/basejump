import DocsSidebar from "@/components/docs/docs-sidebar";
import { ReactNode, useEffect } from "react";
import { useToggle } from "react-use";
import { Drawer } from "react-daisyui";
import useTranslation from "next-translate/useTranslation";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

type Props = {
  navigation: any;
  children: ReactNode;
};

const DocsLayout = ({ navigation, children }) => {
  const [isSidebarOpen, toggleSidebar] = useToggle(false);
  const { t } = useTranslation("content");
  const router = useRouter();

  useEffect(() => {
    toggleSidebar(false);
  }, [router.asPath, toggleSidebar]);

  return (
    <Drawer
      side={<DocsSidebar navigation={navigation} onClose={toggleSidebar} />}
      open={isSidebarOpen}
      onClickOverlay={toggleSidebar}
    >
      <div className="lg:flex gap-x-4 max-w-screen-lg mx-auto lg:mt-8">
        <div className="flex-none w-72 hidden lg:block">
          <DocsSidebar navigation={navigation} />
        </div>
        <div className="lg:hidden mb-4">
          <a
            onClick={toggleSidebar}
            className="font-bold flex items-center gap-x-2 cursor-pointer"
          >
            <ChevronRightIcon className="h-4 w-4" />
            {t("docsMenu")}
          </a>
        </div>
        <div className="lg:w-3/4">{children}</div>
      </div>
    </Drawer>
  );
};

export default DocsLayout;
