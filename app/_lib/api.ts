import { ObjectId } from "mongodb";

export type Acceptance = 'accepted' | 'rejected' | 'undecided'
export interface Participation {
    user: string;
    accept: Acceptance;
    date: Date;
}

export interface Activity {
    name: string;
    creationDate: Date;
    participations: Participation[];
}

export interface GroupCreateReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    name: string;
}

export type GroupCreateResp = {
    type: 'authFailed'
} | {
    type: 'success'
} | {
    type: 'duplicate'
}

export interface GroupAdminAddReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    group: string;
    groupAdminUser: string;
}

export type GroupAdminAddResp = {
    type: 'authFailed'
} | {
    type: 'success'
} | {
    type: 'groupNotFound'
} | {
    type: 'userNotFound'
} | {
    type: 'wasGroupAdmin'
}

export interface GroupMemberAddReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    group: string;
    member: string;
}

export type GroupMemberAddResp = {
    type: 'authFailed'
} | {
    type: 'success'
} | {
    type: 'groupNotFound'
} | {
    type: 'userNotFound'
} | {
    type: 'wasMember'
}

export interface GroupActivityAddReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    group: string;
    activity: string;
}

export type GroupActivityAddResp = {
    type: 'authFailed'
} | {
    type: 'success'
} | {
    type: 'groupNotFound'
} | {
    type: 'wasActivity'
}

export interface MemberDataReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    /**
     * if nullish, the first group whose field members contains user
     */
    curGroup: string | null;
}

export type MemberDataResp = {
    type: 'authFailed'
} | {
    type: 'success';
    curGroup: string | null;
    activities: Activity[];
}

export interface ActivityAcceptReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    group: string;
    activityIdx: number;
    accept: Acceptance;
}

export type ActivityAcceptResp = {
    type: 'authFailed'
} | {
    type: 'groupNotFound'
} | {
    type: 'success';
    activities: Activity[];
}

export interface ActivityDetailsReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    group: string;
    activityIdx: number;
}

export type ActivityDetailsResp = {
    type: 'authFailed'
} | {
    type: 'groupNotFound'
} | {
    type: 'success';
    name: string;
    accept: string[];
    reject: string[];
}

export interface MembersReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    group: string;
}

export type MembersResp = {
    type: 'authFailed' // if token is invalid or user is no member of group
} | {
    type: 'success';
    members: string[];
}
