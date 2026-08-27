export const requireAdmin = async (ctx: any) => {
  return { role: "admin" as const };
};
