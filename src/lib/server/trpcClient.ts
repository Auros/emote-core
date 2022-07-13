import * as trpc from "@trpc/client";
import transformer from "trpc-transformer";
import type { Router } from "./trpcServer";
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server";

export default trpc.createTRPCClient<Router>({
    url: '/trpc',
    transformer
});

type Query = keyof Router['_def']['queries'];
type Mutation = keyof Router['_def']['mutations'];

export type InferQueryInput<RouteKey extends Query> = inferProcedureInput<Router['_def']['queries'][RouteKey]>;
export type InferQueryOutput<RouteKey extends Query> = inferProcedureOutput<Router['_def']['queries'][RouteKey]>;
export type InferMutationInput<RouteKey extends Mutation> = inferProcedureInput<Router['_def']['mutations'][RouteKey]>;
export type InferMutationOutput<RouteKey extends Mutation> = inferProcedureOutput<Router['_def']['mutations'][RouteKey]>;
