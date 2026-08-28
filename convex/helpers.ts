export const requireAdmin = async (ctx: any, sessionToken: string) => {
  if (!sessionToken) {
    throw new Error("Unauthorized: session required");
  }

  const sessions = await ctx.db
    .query("adminSessions")
    .withIndex("by_sessionToken", (q: any) => q.eq("sessionToken", sessionToken))
    .collect();

  if (sessions.length > 0) {
    const session = sessions[0];
    if (session.expiresAt < Date.now()) {
      throw new Error("Unauthorized: session expired");
    }
    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("Unauthorized: invalid session");
    }
    if (user.role !== "admin") {
      throw new Error("Forbidden: admin access required");
    }
    return { role: user.role, userId: user._id, email: user.email };
  }

  // Backward-compatible fallback for sessions created before the
  // multi-device session table was deployed.
  const legacyUsers = await ctx.db
    .query("users")
    .withIndex("by_sessionToken", (q: any) => q.eq("sessionToken", sessionToken))
    .collect();

  if (legacyUsers.length === 0) {
    throw new Error("Unauthorized: invalid session");
  }

  const user = legacyUsers[0];
  if (!user.sessionExpiry || user.sessionExpiry < Date.now()) {
    throw new Error("Unauthorized: session expired");
  }
  if (user.role !== "admin") {
    throw new Error("Forbidden: admin access required");
  }

  return { role: user.role, userId: user._id, email: user.email };
};
