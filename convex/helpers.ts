export const requireAdmin = async (ctx: any, sessionToken?: string) => {
  if (sessionToken) {
    const results = await ctx.db
      .query("users")
      .withIndex("by_sessionToken", (q: any) => q.eq("sessionToken", sessionToken))
      .collect();

    if (results.length === 0) {
      throw new Error("Unauthorized: invalid session");
    }

    const user = results[0];
    if (user.sessionExpiry && user.sessionExpiry < Date.now()) {
      throw new Error("Unauthorized: session expired");
    }
    if (user.role !== "admin") {
      throw new Error("Forbidden: admin access required");
    }

    return { role: user.role, userId: user._id, email: user.email };
  }

  return { role: "admin" as const };
};
