export const isAdminPageRoute = (pathname: string) => {
  return pathname === "/admin" || pathname.startsWith("/admin/");
};

export const isAdminApiRoute = (pathname: string) => pathname.startsWith("/api/admin/");
