import { Button, Navbar } from "react-daisyui";
import Link from "next/link";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Logo from "@/components/basejump-default-content/logo";

const ContentHeader = () => {
  const { user } = useUser();
  const router = useRouter();

  return (
    <Navbar className="flex justify-between items-center md:px-8 py-4 max-w-screen-lg mx-auto">
      <div className="flex gap-2">
        {router.asPath !== "/" && (
          <Link href="/" passHref>
            <button className="mr-4">
              <Logo size="sm" />
            </button>
          </Link>
        )}
        <Link href="/docs" passHref>
          <Button color="ghost">Docs</Button>
        </Link>
        <Link href="/blog" passHref>
          <Button color="ghost">Blog</Button>
        </Link>
      </div>
      <div>
        {!!user ? (
          <Link href="/dashboard" passHref>
            <Button color="ghost">Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link href="/login" passHref>
              <Button color="ghost">Login</Button>
            </Link>
            <Link href="/login" passHref>
              <Button color="ghost">Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </Navbar>
  );
};

export default ContentHeader;
