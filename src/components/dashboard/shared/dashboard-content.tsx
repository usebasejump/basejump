/**
 * Only used for formatting downstream, makes it clear that the
 * children are the content of the dashboard content
 * @param children
 * @constructor
 */
const DashboardContent = ({ children }) => {
  return <div>{children}</div>;
};

/**
 * Sets up the title for the dashboard content
 * @param children
 * @constructor
 */
function Title({ children }) {
  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-8 text-2xl md:h1">
      {children}
    </div>
  );
}

/**
 * Sets up the container for the dashboard content
 * Handles max-width and top border primarily
 * @param children
 * @constructor
 */
function Content({ children }) {
  return (
    <div className="border-t-2 border-base-300">
      <div className="p-6 max-w-screen-xl mx-auto">{children}</div>
    </div>
  );
}

function Tabs({ children }) {
  return (
    <div className="-mt-3 -mb-0.5">
      <div className="max-w-screen-xl mx-auto">{children}</div>
    </div>
  );
}

DashboardContent.Tabs = Tabs;
DashboardContent.Title = Title;
DashboardContent.Content = Content;
export default DashboardContent;
