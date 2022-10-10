import Logo from "@/components/basejump-default-content/logo";

const BasejumpHomepage = () => (
  <div className="max-w-screen-lg mx-auto bg-base-100">
    <div className="py-36">
      <Logo size="lg" className="mx-auto" />
      <h2 className="h2 text-center my-2">
        An opinionated shortcut for launching{" "}
        <span className="text-accent">Supabase</span> apps with{" "}
        <span className="text-accent">NextJS</span>
      </h2>
    </div>
    <div className="grid grid-cols-1 gap-y-16">
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
        <ul className="my-4 mx-4 list-disc">
          <li>
            <a
              href="https://www.flaticon.com/free-icons/parachuting"
              title="parachuting icons"
            >
              Basejump logo was created by monkik
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default BasejumpHomepage;
