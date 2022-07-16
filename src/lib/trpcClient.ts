import { browser } from '$app/env';
import * as trpc from '@trpc/client';
import pubEnv from '$lib/env/pubEnv';
import transformer from 'trpc-transformer';
import type { Router } from '$lib/server/trpcServer';
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server';

const url = browser ? '/trpc' : `${pubEnv.baseUrl}/trpc`;

export default (loadFetch?: typeof fetch) =>
    trpc.createTRPCClient<Router>({
        url: loadFetch ? '/trpc' : url,
        transformer,
        ...(loadFetch && { fetch: loadFetch })
    });

type Query = keyof Router['_def']['queries'];
type Mutation = keyof Router['_def']['mutations'];

export type InferQueryInput<RouteKey extends Query> = inferProcedureInput<Router['_def']['queries'][RouteKey]>;
export type InferQueryOutput<RouteKey extends Query> = inferProcedureOutput<Router['_def']['queries'][RouteKey]>;
export type InferMutationInput<RouteKey extends Mutation> = inferProcedureInput<Router['_def']['mutations'][RouteKey]>;
export type InferMutationOutput<RouteKey extends Mutation> = inferProcedureOutput<
    Router['_def']['mutations'][RouteKey]
>;
