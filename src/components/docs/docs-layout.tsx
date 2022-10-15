import DocsSidebar from "@/components/docs/docs-sidebar";
import { ReactNode } from "react";

type Props = {
  navigation: any;
  children: ReactNode;
};

const DocsLayout = ({ navigation, children }) => {
  return (
    <div className="flex gap-x-4 max-w-screen-lg mx-auto mt-8">
      <div className="flex-none w-72">
        <DocsSidebar navigation={navigation} />
      </div>
      <div className="md:w-3/4">{children}</div>
    </div>
  );
};

export default DocsLayout;
