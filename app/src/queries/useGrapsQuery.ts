import { GraphResponse } from "@src/shared/models";
import { UseQueryOptions, useQuery } from "react-query";
import { queryKeys } from "./queryKeys";

async function getGraphSnaphot(snapshot: string): Promise<GraphResponse> {
  const res = await fetch(`/api/getSnapshot/${snapshot}`);

  if (!res.ok) {
    throw new Error("Error when fetching graph snapshot");
  }

  const data = await res.json();
  return data;
}

export function useGraphSnapshot<TData = GraphResponse>(snapshot: string, options?: UseQueryOptions<GraphResponse, Error, TData>) {
  return useQuery(queryKeys.graphs(snapshot), () => getGraphSnaphot(snapshot), options)
}