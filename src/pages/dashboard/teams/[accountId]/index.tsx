import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { LOGIN_PATH } from "@/types/auth";
import FutureContentPlaceholder from "@/components/basejump-default-content/future-content-placeholder";

const DashboardTeamIndex = () => {
  return (
    <FutureContentPlaceholder filePath="/src/pages/dashboard/teams/[accountId]/index.mdx" />
  );
};

export default DashboardTeamIndex;

export const getServerSideProps = withPageAuth({ redirectTo: LOGIN_PATH });
