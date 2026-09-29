import { authorizeApi } from "@/services/auth.service";

export async function GET() {
  const authorization = await authorizeApi();
  if (authorization.response) return authorization.response;
  const { user, roles, permissions } = authorization.context!;
  return Response.json({ user, roles, permissions });
}
