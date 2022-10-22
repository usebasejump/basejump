import useTranslation from "next-translate/useTranslation";

export default function useHeaderNavigation() {
  const { t } = useTranslation("content");
  return [
    {
      title: t("docs"),
      href: "/docs",
    },
    {
      title: t("blog"),
      href: "/blog",
    },
  ];
}
