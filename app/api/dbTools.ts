import assert from "assert";
import clientPromise from "../_lib/user-management-server/mongodb";
import { findUsers } from "../_lib/user-management-server/userManagementServer";
import { AdminsDoc, GroupDoc } from "./documents";

export async function checkAdmin(user: string): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db('pr-groups');
    const adminsCol = db.collection<AdminsDoc>('admins');

    const doc = await adminsCol.findOne();
    if (doc == null) return false;
    return doc.admins.includes(user);
}

export async function deleteUserRoles(users: string[]): Promise<void> {
    const client = await clientPromise;
    const db = client.db('pr-groups');

    // in this app, the only user role is group admin
    const col = db.collection<GroupDoc>('groups');
    const res = await col.updateMany({
    }, {
        $pullAll: {
            admins: users
        }
    })

    if (!res.acknowledged) {
        throw new Error('pull of group admins not acknowledged');
    }
}

// // Beispiel pipelines:
// async function example() {
//     const client = await clientPromise;
//     const aggDB = client.db('agg');
//     const productsColl = aggDB.collection("products");
//     const ordersColl = aggDB.collection("orders");
//     await productsColl.deleteMany({});

//     const productsData = [
//         {
//             name: "Asus Laptop",
//             variation: "Ultra HD",
//             category: "ELECTRONICS",
//             description: "Great for watching movies",
//         },
//         {
//             name: "Asus Laptop",
//             variation: "Standard Display",
//             category: "ELECTRONICS",
//             description: "Good value laptop for students",
//         },
//         {
//             name: "The Day Of The Triffids",
//             variation: "1st Edition",
//             category: "BOOKS",
//             description: "Classic post-apocalyptic novel",
//         },
//         {
//             name: "The Day Of The Triffids",
//             variation: "2nd Edition",
//             category: "BOOKS",
//             description: "Classic post-apocalyptic novel",
//         },
//         {
//             name: "Morphy Richards Food Mixer",
//             variation: "Deluxe",
//             category: "KITCHENWARE",
//             description: "Luxury mixer turning good cakes into great",
//         },
//     ];

//     await productsColl.insertMany(productsData);

//     await ordersColl.deleteMany({});

//     const orderData = [
//         {
//             customer_id: "elise_smith@myemail.com",
//             orderdate: new Date("2020-05-30T08:35:52Z"),
//             product_name: "Asus Laptop",
//             product_variation: "Standard Display",
//             value: 431.43,
//         },
//         {
//             customer_id: "tj@wheresmyemail.com",
//             orderdate: new Date("2019-05-28T19:13:32Z"),
//             product_name: "The Day Of The Triffids",
//             product_variation: "2nd Edition",
//             value: 5.01,
//         },
//         {
//             customer_id: "oranieri@warmmail.com",
//             orderdate: new Date("2020-01-01T08:25:37Z"),
//             product_name: "Morphy Richards Food Mixer",
//             product_variation: "Deluxe",
//             value: 63.13,
//         },
//         {
//             customer_id: "jjones@tepidmail.com",
//             orderdate: new Date("2020-12-26T08:55:46Z"),
//             product_name: "Asus Laptop",
//             product_variation: "Standard Display",
//             value: 429.65,
//         },
//     ];

//     await ordersColl.insertMany(orderData);

//     productsColl.aggregate([
//         {
//             $lookup: {
//                 from: "orders",
//                 let: {
//                     prdname: "$name",
//                     prdvartn: "$variation",
//                 },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $and: [
//                                     { $eq: ["$product_name", "$$prdname"] },
//                                     { $eq: ["$product_variation", "$$prdvartn"] },
//                                 ],
//                             },
//                         },
//                     },
//                     {
//                         $match: {
//                             orderdate: {
//                                 $gte: new Date("2020-01-01T00:00:00Z"),
//                                 $lt: new Date("2021-01-01T00:00:00Z"),
//                             },
//                         },
//                     }, {
//                         $unset: ["_id", "product_name", "product_variation"],
//                     }
//                 ],
//                 as: "orders",
//             },
//         }, {
//             $match: {
//                 orders: { $ne: [] },
//             },
//         }, {
//             $unset: ["_id", "description"],
//         }
//     ]).


// }
/*

await productsColl.aggregate(pipeline)
await productsColl.aggregate([
    {
  $lookup: {
    from: "orders",
    let: {
      prdname: "$name",
      prdvartn: "$variation",
    },
    pipeline: embedded_pl,
    as: "orders",
  },
}])


*/

function addUnique<T>(dest: T[], toAdd: T[]) {
    for (const x of toAdd) {
        if (!dest.includes(x)) dest.push(x)
    }
}

export async function handleDeletedUsers(): Promise<void> {

    const client = await clientPromise;
    const db = client.db('pr-groups');

    const col = db.collection<GroupDoc>('groups');

    const cursor = col.find<{admins: string[];}>({}, {
        projection: {
            admins: 1
        }
    })
    
    let row: {admins: string[]} | null = null;

    const allGroupAdmins: string[] = [];

    while ((row = await cursor.next()) != null) {
        console.log('row.admins', row.admins);
        addUnique(allGroupAdmins, row.admins);
    }

    allGroupAdmins.sort();
    console.log('allGroupAdmins', allGroupAdmins)
    const found = await findUsers(allGroupAdmins);
    found.sort();
    let i, j: number;
    const li = allGroupAdmins.length;
    const lj = found.length;
    console.log('li', li, 'lj', lj);
    const toDelete: string[] = [];
    for (i = 0, j = 0; i < li || j < lj; ) {
        if (j >= lj) {
            assert(i < li); // otherwise for would have terminated
            const ui = allGroupAdmins[i];
            toDelete.push(ui)
            ++i;
        } else if (i >= li) {
            const uj = found[j];
            throw new Error('findUsers did not work as expected because the following user was found which is no group admin: ' + uj)
        } else {
            const ui = allGroupAdmins[i];
            const uj = found[j];
            console.log('i', i, 'j', j, 'ui', ui, 'uj', uj);
    
            if (ui < uj) {
                // ui ist Gruppen-Admin aber kein User mehr
                toDelete.push(ui);
                ++i;
            } else if (ui === uj) {
                ++i;
                ++j;
            } else {
                assert(ui > uj);
                throw new Error('findUsers did not work as expected because the following user was found which is no group admin: ' + uj)
            }
        }
    }

    console.log('would delete user roles for', toDelete);
    await deleteUserRoles(toDelete);
    // console.warn('deleteUserRoles commented out');
}