import clientPromise from "../_lib/user-management-server/mongodb";
import { AdminsDoc } from "./documents";

export async function checkAdmin(user: string): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db('pr-groups');
    const adminsCol = db.collection<AdminsDoc>('admins');

    const doc = await adminsCol.findOne();
    if (doc == null) return false;
    return doc.admins.includes(user);
}

