import * as trpc from "@trpc/client";
import type { Router } from "$lib/trpcServer";

export default trpc.createTRPCClient<Router>({ url: '/trpc' });