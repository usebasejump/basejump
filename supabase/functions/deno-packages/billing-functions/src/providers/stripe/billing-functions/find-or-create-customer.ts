import {stripeCustomerToBasejumpCustomer} from "./stripe-utils.ts";
import {BASEJUMP_BILLING_DATA_UPSERT} from "../../../../lib/upsert-data.ts";

export async function findOrCreateCustomer(
    stripeClient,
    {customerId, billingEmail, accountId}
): Promise<BASEJUMP_BILLING_DATA_UPSERT["customer"]> {
    // if we have a customer ID, lookup the customer and return newest data
    if (customerId) {
        const customer = await stripeClient.customers.retrieve(customerId);
        if (customer) {
            return stripeCustomerToBasejumpCustomer(accountId, customer);
        }
    }

    // search for the customer using the billingEmail, then verify metadata account_id
    if (billingEmail) {
        const customer = await stripeClient.customers.list({
            email: billingEmail,
        });
        if (customer.data.length > 0) {
            const matchingCustomer = customer.data.find(
                (customer) => customer.metadata?.basejump_account_id === accountId
            );
            if (matchingCustomer) {
                return stripeCustomerToBasejumpCustomer(accountId, matchingCustomer);
            }
        }
    }

    // search stripe for a customer with accountId in the metadata
    const customer = await stripeClient.customers.search({
        query: `metadata["basejump_account_id"]:"${accountId}"`,
        limit: 1,
    });
    
    if (customer.data.length > 0) {
        return stripeCustomerToBasejumpCustomer(accountId, customer.data[0]);
    }

    const customerData: { metadata: { basejump_account_id: string }; email?: string } = {
        metadata: {
            basejump_account_id: accountId,
        },
    };

    if (billingEmail) {
        customerData.email = billingEmail;
    }

    const createdCustomer = await stripeClient.customers.create(customerData);

    return stripeCustomerToBasejumpCustomer(accountId, createdCustomer);
}
