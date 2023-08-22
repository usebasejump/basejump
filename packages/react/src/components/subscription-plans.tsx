import { useBillingPlans } from "../api/use-billing-plans.ts";
import { useMemo, useState } from "react";
import { BasePropsWithClient } from "../types/base-props.ts";
import { en, I18nVariables } from "@usebasejump/shared";
import { merge } from "@supabase/auth-ui-shared";
import { css } from "@stitches/core";
import { Container } from "./ui/container.tsx";
import { Button } from "./ui/button.tsx";
import { IndividualPlan } from "./subscription-plans/individual-plan.tsx";

type Props = BasePropsWithClient & {
  accountId?: string;
};

const containerStyle = css({
  display: "flex",
  alignItems: "start",
  justifyContent: "center",
  gap: "1rem",
  flexDirection: "column",
  "@media (min-width: 640px)": {
    flexDirection: "row",
  },
});

const tabStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
});

export const SubscriptionPlans = ({
  supabaseClient,
  accountId,
  localization = { variables: {} },
}: Props) => {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.subscription_plans;

  const [activeTab, setActiveTab] = useState(null);
  const [tabs, setTabs] = useState<string>([]);
  const { data } = useBillingPlans({
    supabaseClient,
    accountId,
    options: {
      onSuccess(data) {
        const options = new Set(data?.map((option) => option.interval));
        setTabs(Array.from(options));
        if (!activeTab || !options.has(activeTab)) {
          setActiveTab(Array.from(options)[0]);
        }
      },
    },
  });
  const currentOptions = useMemo(() => {
    return data?.filter((option) => option.interval === activeTab) || [];
  }, [data, activeTab]);

  return (
    <div>
      <Container gap="xlarge" direction="vertical">
        <div className={tabStyle()}>
          {tabs.map((tab) => (
            <Button
              color={activeTab === tab ? "primary" : "default"}
              key={`subscription-group-${tab}`}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              width="auto"
            >
              {labels?.[tab]}
            </Button>
          ))}
        </div>
        <div className={containerStyle()}>
          {currentOptions.map((option) => (
            <IndividualPlan
              key={option.id}
              plan={option}
              labels={labels}
              accountId={accountId}
              supabaseClient={supabaseClient}
            />
          ))}
        </div>
      </Container>
    </div>
  );
};
