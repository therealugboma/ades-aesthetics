import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const requireAdmin = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
};
