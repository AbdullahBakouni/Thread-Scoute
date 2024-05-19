import { authMiddleware } from "@clerk/nextjs";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
    publicRoutes :["/api/webhook/clerk","/api/uploadthing"], //public pages that is not needed to authinticate
    ignoredRoutes :["/" ,"/api/webhook/clerk"],//private pages that is neded to authenticate
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};