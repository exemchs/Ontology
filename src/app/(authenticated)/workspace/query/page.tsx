import type { Metadata } from "next";
import { QueryConsole } from "@/components/query/QueryConsole";

export const metadata: Metadata = {
  title: "Query Console | eXemble Ontology Platform",
  description: "Execute GraphQL and DQL queries against the Dgraph cluster",
};

export default function QueryPage() {
  return <QueryConsole />;
}
