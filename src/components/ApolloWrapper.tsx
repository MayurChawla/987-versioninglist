"use client";

import { ReactNode, useState } from "react";
import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "@/lib/graphql/client";

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const [client] = useState(() => createApolloClient());
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
