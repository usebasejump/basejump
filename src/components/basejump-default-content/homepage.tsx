/* istanbul ignore file */
import Logo from "@/components/basejump-default-content/logo";
import ContentMeta from "@/components/content-pages/content-meta";

const BasejumpHomepage = () => (
  <div className="max-w-screen-lg mx-auto bg-base-100">
    <ContentMeta
      title="Basejump - SaaS starter kit for Supabase and NextJS"
      description="An opinionated short cut for launching Supabase apps using NextJS"
      socialImage={`/api/og?title=Basejump`}
    />
    <div className="pt-8 pb-24 md:pt-36 md:pb-48">
      <Logo size="lg" className="mx-auto" />
      <h2 className="h2 text-center my-2">
        An opinionated shortcut for launching{" "}
        <span className="text-accent">Supabase</span> apps with{" "}
        <span className="text-accent">NextJS</span>
      </h2>
    </div>
    <div className="grid grid-cols-1 gap-y-8 lg:gap-y-16">
      <div>
        <h1 className="h1 text-center mb-8">Features</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col bg-base-200 rounded-lg p-6">
            <h3 className="h3 mb-2">Teams & Accounts</h3>
            <p>
              Billing and permissions for both personal and team accounts. Both
              are optional, allowing you to fine-tune your experience
            </p>
          </div>
          <div className="flex flex-col bg-base-200 rounded-lg p-6">
            <h3 className="h3 mb-2">Stripe Subscriptions</h3>
            <p>
              Supports complicated workflows such as trial periods, free plans,
              forced payment plans and more
            </p>
          </div>
          <div className="flex flex-col bg-base-200 rounded-lg p-6">
            <h3 className="h3 mb-2">Easy Permissions</h3>
            <p>
              Support for members and owners, easy database functions for
              extending permissions as needed
            </p>
          </div>
          <div className="flex flex-col bg-base-200 rounded-lg p-6">
            <h3 className="h3 mb-2">Account Management & Dashboard</h3>
            <p>
              Profiles, billing, team invitations and more. All the basics so
              you can focus on your app
            </p>
          </div>
          <div className="flex flex-col bg-base-200 rounded-lg p-6">
            <h3 className="h3 mb-2">Full Component Library</h3>
            <p>
              Basejump leverages DaisyUI and TailwindCSS for an easy development
              experience
            </p>
          </div>
          <div className="flex flex-col bg-base-200 rounded-lg p-6">
            <h3 className="h3 mb-2">Internationalization (I18n)</h3>
            <p>
              Support for translations and internationalization using
              next-translate
            </p>
          </div>
          <div className="flex flex-col bg-base-200 rounded-lg p-6">
            <h3 className="h3 mb-2">Authentication</h3>
            <p>
              Magic links, Phone SMS Auth, Email/Password and Social Logins all
              provided by Supabase
            </p>
          </div>
          <div className="flex flex-col bg-base-200 rounded-lg p-6">
            <h3 className="h3 mb-2">Fully Customizable</h3>
            <p>
              Basejump is a batteries-included starting point for your
              application. Customize it to your hearts content
            </p>
          </div>
          <div className="flex flex-col bg-base-200 rounded-lg p-6">
            <h3 className="h3 mb-2">Themeable</h3>
            <p>
              Light & Dark mode included. Create your own themes using DaisyUI
            </p>
          </div>
          <div className="flex flex-col bg-base-200 rounded-lg p-6 md:col-span-3">
            <h3 className="h3 mb-2">Open Source</h3>
            <p>
              Basejump is open source, contributions are both awesome and
              encouraged!
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-screen-md mx-auto">
        <h1 className="h1 text-center mb-8">
          Sensible Defaults & Special Thanks
        </h1>
        <p>
          Basejump is built using some really awesome open source libraries and
          graphics. Here are some of them
        </p>
        <h4 className="h4 mt-4">Libraries and tools</h4>
        <ul className="my-4 mx-4 list-disc grid gap-y-3">
          <li>
            <a
              href="https://supabase.com/"
              title="Supabase"
              target="_blank"
              rel="noreferrer"
            >
              <span className="font-bold">Supabase</span>
              <p>
                Supabase bills itself as &quot;an open source Firebase
                alternative,&quot; but it&apos;s so much more. It also serves as
                the primary force behind Basejump
              </p>
            </a>
          </li>
          <li>
            <a
              href="https://nextjs.org/"
              title="NextJS"
              target="_blank"
              rel="noreferrer"
            >
              <span className="font-bold">NextJS</span>
              <p>
                NextJS needs no introduction. You either love it or you hate it.
                We love it.
              </p>
            </a>
          </li>
          <li>
            <a
              href="https://tailwindcss.com/"
              title="TailwindCSS"
              target="_blank"
              rel="noreferrer"
            >
              <span className="font-bold">Tailwind</span>
              <p>
                Tailwind is a utility-first CSS library that forms the base of
                all the styling for Basejump
              </p>
            </a>
          </li>
          <li>
            <a
              href="https://daisyui.com/"
              title="DaisyUI"
              target="_blank"
              rel="noreferrer"
            >
              <span className="font-bold">DaisyUI</span>
              <p>
                Built on top of Tailwind, DaisyUI provides some solid reusable
                components.
              </p>
            </a>
          </li>
          <li>
            <a
              href="https://tanstack.com/query/v4"
              title="React-Query"
              target="_blank"
              rel="noreferrer"
            >
              <span className="font-bold">
                Tanstack Query (formerly React-Query)
              </span>
              <p>
                Asynchronous state management - react-query drives most api
                interactions behind the scenes
              </p>
            </a>
          </li>
          <li>
            <a
              href="https://react-hook-form.com/"
              title="React Hook Form"
              target="_blank"
              rel="noreferrer"
            >
              <span className="font-bold">React Hook Form</span>
              <p>
                Form validations, submissions and error handling. If you click
                submit and it does a thing, you probably have this to thank
              </p>
            </a>
          </li>
        </ul>
        <h4 className="h4">Graphics</h4>
        <ul className="my-4 mx-4 list-disc grid gap-y-1">
          <li>
            <a
              href="https://lukaszadam.com/"
              title="Empty space credit"
              target="_blank"
              rel="noopener noreferrer"
            >
              Empty space illustration created by the very generous Lukaszadam
            </a>
          </li>
          <li>
            <a
              href="https://www.flaticon.com/free-icons/parachuting"
              title="Basejump dude credit"
              target="_blank"
              rel="noopener noreferrer"
            >
              Our awesome basejumper dude was created by monkik
            </a>
          </li>
          <li>
            <a
              href="https://heroicons.com/"
              title="Heroicons"
              target="_blank"
              rel="noopener noreferrer"
            >
              Heroicons drives all of our in-app and homepage icons
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default BasejumpHomepage;
