import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Dashboard } from "@/components/dashboard";
import { AuthScreen } from "@/components/auth-screen";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    const userCount = await db.user.count();
    return <AuthScreen hasUser={userCount > 0} />;
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return <AuthScreen hasUser={false} />;
  }

  return <Dashboard user={{ id: user.id, name: user.name, email: user.email }} />;
}
