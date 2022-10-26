import Link from "next/link";
import { Menu } from "react-daisyui";
import { GetDocsNavigationResponse } from "@/utils/content/content-helpers";
import { Fragment } from "react";
import { useRouter } from "next/router";
import cx from "classnames";
import useTranslation from "next-translate/useTranslation";
import { XIcon } from "@heroicons/react/outline";

type Props = {
  navigation: GetDocsNavigationResponse;
  onClose?: () => void;
};

const DocsSidebar = ({ navigation, onClose }: Props) => {
  const router = useRouter();
  const { t } = useTranslation("content");
  return (
    <div className="bg-base-100">
      <div className="lg:hidden mb-4">
        <a
          onClick={onClose}
          className="font-bold flex items-center gap-x-2 cursor-pointer"
        >
          <XIcon className="h-4 w-4" />
          {t("closeDocsMenu")}
        </a>
      </div>
      <Menu>
        {navigation.rootPaths.map((rootPath) => (
          <Menu.Item
            key={rootPath.fullPath}
            className={cx({ bordered: router.asPath === rootPath.fullPath })}
          >
            <Link href={rootPath.fullPath} passHref>
              {rootPath.title}
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
                  {categoryPath.title}
                </Link>
              </Menu.Item>
            ))}
          </Fragment>
        ))}
      </Menu>
    </div>
  );
};

export default DocsSidebar;
