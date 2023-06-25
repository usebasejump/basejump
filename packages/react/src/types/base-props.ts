import {SupabaseClient} from "@supabase/supabase-js";
import {I18nVariables} from "@usebasejump/shared";
import {Appearance} from "./appearance";

export type BasePropsWithClient = {
    appearance?: Appearance;
    theme?: string;
    supabaseClient: SupabaseClient<any>;
    localization?: {
        variables?: I18nVariables
    };
}

export type BasePropsWithoutClient = {
    appearance?: Appearance;
    theme?: string;
    localization?: {
        variables?: I18nVariables
    }
}