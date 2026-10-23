import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "./api.ts";
import type { BusinessSummary, User } from "./types.ts";

export const meQuery = queryOptions({
  queryKey: ["me"],
  queryFn: () => api<{ user: User | null }>("/auth/me").then((r) => r.user),
  staleTime: 60_000,
});

export const businessesQuery = queryOptions({
  queryKey: ["businesses"],
  queryFn: () =>
    api<{ businesses: BusinessSummary[] }>("/console/businesses").then((r) => r.businesses),
});

export function useMe() {
  return useQuery(meQuery);
}

export function useBusinesses() {
  return useQuery(businessesQuery);
}

export function useBusiness(bid: string) {
  const { data } = useBusinesses();
  return data?.find((b) => b.id === bid);
}
