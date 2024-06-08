import { RegisterReq, RegisterResp } from "./user-management-common/register";
import { ApiResp } from "./user-management-common/apiRoutesCommon";
import clientPromise from "./mongodb";
import { transformPasswd } from "./hash";
import { LoginReq, LoginResp } from "./user-management-common/login";
import { randomBytes } from "crypto";
import { LogoutReq, LogoutResp } from "./user-management-common/logout";
import { DeleteReq, DeleteResp } from "./user-management-common/delete";

interface UserDoc {
    /**
     * user name as id
     */
    _id: string;
    /**
     * transformed (hashed) password
     */
    passwd: string;
    /**
     * session token if and only if the user is currently logged in.
     */
    token: string | null;
}

const dbName = 'user';

export async function executeRegister(req: RegisterReq): Promise<ApiResp<RegisterResp>> {
    if (req.user == null || req.user === '') {
        return {
            type: 'error',
            error: 'user missing or empty'
        }
    }
    if (req.passwd == null) {
        return {
            type: 'error',
            error: 'Password missing'
        }
    }
    const client = await clientPromise;
    try {
        return await client.db(dbName).collection<UserDoc>('users').insertOne({
            _id: req.user,
            passwd: transformPasswd(req.user, req.passwd),
            token: null
        }).then(res => {
            if (!res.acknowledged) {
                return {
                    type: 'error',
                    error: 'not acknowledged'
                }
            }

            return {
                type: 'success'
            }
        })

    } catch (reason: any) {
        if (reason.code === 11000) {
            return {
                type: 'nameNotAvailable'
            }
        }
        return {
            type: 'error',
            error: 'Caught: ' + JSON.stringify(reason)
        }
    }
}


function createRandomToken(): string {
    return randomBytes(32).toString('hex');
}

export async function executeLogin(req: LoginReq): Promise<ApiResp<LoginResp>> {
    const client = await clientPromise;
    const token = createRandomToken();
    try {
        const updateRes = await client.db(dbName).collection<UserDoc>('users').updateOne({
            _id: req.user,
            passwd: transformPasswd(req.user, req.passwd)
        }, {
            $set: {
                token: token
            }
        })
        if (!(updateRes.acknowledged && updateRes.modifiedCount === 1)) {
            return {
                type: 'wrongUserOrPasswd'
            }
        }
        return {
            type: 'success',
            token: token
        };
    } catch (reason) {
        console.error(reason);
        return {
            type: 'error',
            error: JSON.stringify(reason)
        }
    }
}

export async function executeLogout(req: LogoutReq): Promise<ApiResp<LogoutResp>> {
    try {
        const updateRes = await (await clientPromise).db(dbName).collection<UserDoc>('users').updateOne({
            _id: req.user,
            token: req.token
        }, {
            $set: {
                token: null
            }
        });

        if (!(updateRes.acknowledged && updateRes.modifiedCount === 1)) {
            return {
                type: 'wrongUserOrToken'
            }
        }
        return {
            type: 'success',
        };
    } catch (reason) {
        console.error(reason);
        return {
            type: 'error',
            error: JSON.stringify(reason)
        }
    }
}

export async function executeDelete(req: DeleteReq): Promise<ApiResp<DeleteResp>> {

    const client = await clientPromise;
    const db = client.db(dbName);
    const col = db.collection<UserDoc>('users');
    const res = await col.deleteOne({
        _id: req.user,
        token: req.token
    })
    if (!res.acknowledged) {
        return {
            type: 'error',
            error: 'deleteOne not acknowledged?!'
        }
    }
    if (res.deletedCount === 0) {
        return {
            type: 'authFailed'
        }
    }
    if (res.deletedCount === 1) {
        return {
            type: 'success'
        }
    }
    return {
        type: 'error',
        error: `deletedCount = ${res.deletedCount} ?!`
    }
}

export async function checkToken(user: string, token: string): Promise<boolean> {
    const res = await (await clientPromise).db(dbName).collection<UserDoc>('users').findOne({
        _id: user,
        token: token
    }, {
        projection: {
            token: 1
        }
    });
    return res != null && token === res.token;
}

export async function checkUser(user: string): Promise<boolean> {
    const res = await (await clientPromise).db(dbName).collection<UserDoc>('users').findOne({
        _id: user,
    }, {
        projection: {
            _id: 1,
            token: 0
        }
    });
    return res != null;

}

export async function findUsers(users: string[]) {
    const client = await clientPromise
    const db = client.db(dbName)
    console.log('findUsers: users', users);
    const found = await db.collection<UserDoc>('users').find({
        _id: {
            $in: users
        }
    // }, {
    //     projection: {
    //         _id: 1
    //     }
    }).toArray();
    console.log('findUsers found', found);
    const res = found.map(x => x._id)
    console.log('result of findUsers', res);
    return res;
}