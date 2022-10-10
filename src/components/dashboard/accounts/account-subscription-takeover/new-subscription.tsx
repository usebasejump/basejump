import { useMemo, useState } from "react";
import useAccountBillingOptions from "@/utils/api/use-account-billing-options";
import { Button, ButtonGroup } from "react-daisyui";
import useTranslation from "next-translate/useTranslation";
import IndividualSubscriptionPlan from "@/components/dashboard/accounts/account-subscription-takeover/individual-subscription-plan";

const NewSubscription = ({ currentAccount }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [tabs, setTabs] = useState([]);
  const { t } = useTranslation("dashboard");

  const { data } = useAccountBillingOptions(currentAccount?.account_id, {
    onSuccess(data) {
      const options = new Set(data?.map((option) => option.interval));
      setTabs(Array.from(options));
      if (!activeTab || !options.has(activeTab)) {
        setActiveTab(Array.from(options)[0]);
      }
    },
  });

  const currentOptions = useMemo(() => {
    return data?.filter((option) => option.interval === activeTab) || [];
  }, [data, activeTab]);

  return (
    <div className="text-center">
      <ButtonGroup>
        {tabs.map((tab) => (
          <Button
            key={`subscription-group-${tab}`}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {t(`newSubscriptions.tabs.${tab}`)}
          </Button>
        ))}
      </ButtonGroup>
      <div className="flex gap-6 justify-center my-12">
        {currentOptions.map((option) => (
          <IndividualSubscriptionPlan
            key={`subscription-option-${option.price_id}`}
            plan={option}
            currentAccount={currentAccount}
          />
        ))}
      </div>
    </div>
  );
};

export default NewSubscription;
