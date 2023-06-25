import {useEffect, useRef, useState} from "react";
import {PostgrestResponse, PostgrestSingleResponse, SupabaseClient} from "@supabase/supabase-js";

type USE_API_RESPONSE<T> = {
    error: string | null;
    loading: boolean;
    data: T | null;
    refetch: () => void;
}

type ApiRequest = <T extends unknown>() => Promise<PostgrestSingleResponse<any> | PostgrestResponse<any>>;

type Props = {
    supabaseClient?: SupabaseClient<any> | null;
    apiRequest: ApiRequest;
}

export const useApiRequest = <T extends unknown>({supabaseClient, apiRequest}: Props): USE_API_RESPONSE<T> => {
    const isMounted = useRef<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<T | null>(null);

    async function refetch() {
        if (loading || !isMounted.current || !supabaseClient) return;
        setLoading(true);

        try {
            const {data: responseData, error} = await apiRequest<T>();

            if (error) {
                setError(error.message);
                return;
            }

            setData(responseData);
        } catch (error: any) {
            setError(error?.message);
            return;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        isMounted.current = true
        refetch();
        return () => {
            isMounted.current = false;
        }
    }, []);

    return {
        error,
        loading,
        data,
        refetch
    }
}