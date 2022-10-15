import ContentHeader from "./content-header";
import ContentFooter from "./content-footer";

const ContentLayout = ({ children }) => {
  return (
    <div>
      <ContentHeader />
      <div className="min-h-screen">{children}</div>
      <ContentFooter />
    </div>
  );
};

export default ContentLayout;
