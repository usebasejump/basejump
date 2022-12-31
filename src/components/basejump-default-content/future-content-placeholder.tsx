/* istanbul ignore file */
import Image from "next/image";

type Props = {
  filePath: string;
  title?: string;
};
const FutureContentPlaceholder = ({
  title = "Here's where you bring the awesome!",
  filePath,
}: Props) => {
  return (
    <div className="max-w-xl mx-auto pt-10 px-6">
      <Image
        src="/images/placeholder-image.svg"
        alt="Basejump"
        width={500}
        height={400}
      />
      <h1 className="h1 text-center mb-8 px-12">{title}</h1>
      {!!filePath && (
        <div className="text-center">
          <p className="mb-3">To edit this page, check it out at:</p>
          <pre className="bg-base-200 text-base-content rounded-lg p-1">
            {filePath}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FutureContentPlaceholder;
