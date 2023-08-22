import { GET_BILLING_PLANS_RESPONSE, I18nVariables } from "@usebasejump/shared";
import { css } from "@stitches/core";
import { Container } from "../ui/container.tsx";
import { Text } from "../ui/typography.tsx";
import { Button } from "../ui/button.tsx";
import { BasePropsWithClient } from "../../types/base-props.ts";
import { useState } from "react";

type Props = BasePropsWithClient & {
  plan: GET_BILLING_PLANS_RESPONSE[0];
  labels: I18nVariables["subscription_plans"];
};

const individualPlanDefaultStyles = css({
  background: "$dialogContentBackground",
  color: "$dialogContentText",
  zIndex: 50,
  minWidth: "18rem",
  borderRadius: "$dropdownContentRadius",
  borderWidth: "1px",
  padding: "40px 20px 20px 20px",
  outline: "2px solid transparent",
  outlineOffset: "2px",
  textAlign: "center",
  h2: {
    fontWeight: "bold",
  },
  h4: {
    fontSize: "2rem",
  },
});

export const IndividualPlan = ({
  accountId,
  plan,
  labels,
  supabaseClient,
}: Props) => {
  const [loading, setLoading] = useState(false);

  async function handleSelectPlan() {
    setLoading(true);
    const { data, error } = await supabaseClient.functions.invoke(
      "billing-functions",
      {
        body: {
          action: "get_new_subscription_url",
          args: {
            account_id: accountId,
            plan_id: plan.id,
            return_url: window.location.href,
          },
        },
      }
    );

    setLoading(false);

    if (data.url) {
      window.location = data.url;
    }
  }
  return (
    <div className={individualPlanDefaultStyles()}>
      <Container direction="vertical" gap="large" position="center">
        <div>
          <h2>{plan.product_name}</h2>
          <Text>{plan.product_description}</Text>
        </div>
        <div>
          <h4>
            {new Intl.NumberFormat("en", {
              style: "currency",
              currency: plan.currency,
              minimumFractionDigits: 0,
            }).format((plan.price || 0) / 100)}
          </h4>
          <Text>{labels?.intervals?.[plan.interval]}</Text>
        </div>
        <div>
          <Button color="primary" loading={loading} onClick={handleSelectPlan}>
            {labels?.select_plan}
          </Button>
        </div>
      </Container>
    </div>
  );
};
