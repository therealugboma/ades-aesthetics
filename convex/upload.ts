import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const generateUploadUrl = action({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.auth.verifySession, {
      sessionToken: args.sessionToken,
    });
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});

export const getStorageUrl = action({
  args: { sessionToken: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.auth.verifySession, {
      sessionToken: args.sessionToken,
    });
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    const url = await ctx.storage.getUrl(args.storageId);
    return url ?? "";
  },
});
