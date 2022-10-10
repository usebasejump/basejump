import { Button } from "react-daisyui";
import { useRouter } from "next/router";
import { UseAccountBillingOptionsResponse } from "@/utils/api/use-account-billing-options";
import useTranslation from "next-translate/useTranslation";
import { useMutation } from "@tanstack/react-query";
import { UseDashboardOverviewResponse } from "@/utils/api/use-dashboard-overview";
import { toast } from "react-toastify";

type Props = {
  plan: UseAccountBillingOptionsResponse[0];
  currentAccount: UseDashboardOverviewResponse[0];
};
const IndividualSubscriptionPlan = ({ plan, currentAccount }: Props) => {
  const router = useRouter();
  const { t } = useTranslation("dashboard");

  const setupCheckoutLink = useMutation(
    async () => {
      const res = await fetch("/api/billing/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: currentAccount?.account_id,
          priceId: plan.price_id,
        }),
      });

      const jsonResponse = await res.json();

      if (!res.ok) {
        throw new Error(jsonResponse.error);
      }
      return jsonResponse.url;
    },
    {
      onSuccess(url) {
        console.log("whoooop", url);
        if (!url) return;
        window.location.href = url;
      },
      onError(error: any) {
        toast.error(error.message);
      },
    }
  );

  return (
    <div className="border rounded text-left border-base-outline p-6 w-64 flex flex-col justify-between">
      <div>
        <h3 className="h2">{plan.product_name}</h3>
        <p className="my-4">{plan.product_description}</p>
      </div>
      <div>
        <div className="my-6 flex gap-1 items-baseline">
          <h4 className="h1 text-5xl">
            {new Intl.NumberFormat(router.locale, {
              style: "currency",
              currency: plan.currency,
              minimumFractionDigits: 0,
            }).format((plan.price || 0) / 100)}
          </h4>
          <p>/ {t(`newSubscriptions.intervals.${plan.interval}`)}</p>
        </div>
        <Button
          color="primary"
          className="w-full"
          loading={setupCheckoutLink.isLoading}
          onClick={() => setupCheckoutLink.mutate()}
        >
          {t("newSubscriptions.activate")}
        </Button>
      </div>
    </div>
  );
};

export default IndividualSubscriptionPlan;
