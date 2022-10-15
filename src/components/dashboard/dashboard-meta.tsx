import Head from "next/head";

type Props = {
  title: string;
};

const DashboardMeta = ({ title }: Props) => {
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};
export default DashboardMeta;
