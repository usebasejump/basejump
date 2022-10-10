import ContentHeader from "./content-header";
import ContentFooter from "./content-footer";

const ContentLayout = ({ children }) => {
  return (
    <div>
      <ContentHeader />
      {children}
      <ContentFooter />
    </div>
  );
};

export default ContentLayout;
