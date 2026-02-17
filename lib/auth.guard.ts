// import { auth } from "@/auth";
// import { redirect } from "next/navigation";

// export async function requireAdmin() {
//     const session = await auth();

//     if (session?.user?.role !== 'admin') {
//         redirect('/unauthorized')
//     }

//     return session;
// }


import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return session;
}
