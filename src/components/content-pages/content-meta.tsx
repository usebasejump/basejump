import Head from "next/head";

type Props = {
  title: string;
  description: string;
  socialDescription?: string;
  socialImage?: string;
};

const ContentMeta = ({
  title,
  description,
  socialDescription,
  socialImage,
}: Props) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} key="desc" />
      <meta property="og:title" content={title} />
      <meta
        property="og:description"
        content={socialDescription || description}
      />
      {!!socialImage && <meta property="og:image" content={socialImage} />}
    </Head>
  );
};
export default ContentMeta;
