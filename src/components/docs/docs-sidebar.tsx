import Link from "next/link";
import { Menu } from "react-daisyui";

const DocsSidebar = ({ navigation }) => {
  return (
    <Menu>
      {navigation.rootPaths.map((rootPath) => (
        <Link key={rootPath.slug} href={rootPath.slug} passHref>
          <Menu.Item>
            <a>{rootPath.title}</a>
          </Menu.Item>
        </Link>
      ))}
      {Object.keys(navigation.categories).map((category) => (
        <>
          <Menu.Title>
            <span className="text-lg">{category}</span>
          </Menu.Title>
          {navigation.categories[category].map((categoryPath) => (
            <Link key={categoryPath.slug} href={categoryPath.slug} passHref>
              <Menu.Item>
                <a>{categoryPath.title}</a>
              </Menu.Item>
            </Link>
          ))}
        </>
      ))}
    </Menu>
  );
};

export default DocsSidebar;
