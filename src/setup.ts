import { connectLogger } from "@reatom/core";

if (process.env.NODE_ENV !== "production") {
  connectLogger();
}
