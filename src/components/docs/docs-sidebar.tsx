import Link from "next/link";
import { Menu } from "react-daisyui";
import { GetDocsNavigationResponse } from "@/utils/content/content-helpers";
import { Fragment } from "react";
import { useRouter } from "next/router";
import cx from "classnames";

type Props = {
  navigation: GetDocsNavigationResponse;
};

const DocsSidebar = ({ navigation }: Props) => {
  const router = useRouter();
  return (
    <Menu>
      {navigation.rootPaths.map((rootPath) => (
        <Menu.Item
          key={rootPath.fullPath}
          className={cx({ bordered: router.asPath === rootPath.fullPath })}
        >
          <Link href={rootPath.fullPath} passHref>
            <a>{rootPath.title}</a>
          </Link>
        </Menu.Item>
      ))}
      {Object.keys(navigation.categories).map((category) => (
        <Fragment key={`category-${category}`}>
          <Menu.Title className="mt-4">
            <span className="text-lg">{category}</span>
          </Menu.Title>
          {navigation.categories[category].map((categoryPath) => (
            <Menu.Item
              key={categoryPath.fullPath}
              className={cx({
                bordered: router.asPath === categoryPath.fullPath,
              })}
            >
              <Link href={categoryPath.fullPath} passHref>
                <a>{categoryPath.title}</a>
              </Link>
            </Menu.Item>
          ))}
        </Fragment>
      ))}
    </Menu>
  );
};

export default DocsSidebar;
