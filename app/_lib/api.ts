import { ObjectId } from "mongodb";
import { HeaderLine } from "./HeaderLine";

export type Acceptance = 'accepted' | 'rejected' | 'undecided'
export interface Participation {
    phoneNr: string;
    accept: Acceptance;
    date: number;
}

export interface Activity {
    name: string;
    date: number | null;
    capacity: number | null;
    participations: Participation[];
    creationDate: number;
}

export interface Member {
    phoneNr: string;
    prename: string;
    surname: string;
    token: string;
}

export interface Logo {
    src: string;
    alt: string;
    width: number;
    height: number;
}

export interface GroupCreateReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    name: string;
    logo: Logo | null;
    line1: HeaderLine;
    margin: string;
    line2: HeaderLine;
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
    phoneNr: string;
    prename: string;
    surname: string;
}

export type GroupMemberAddResp = {
    type: 'authFailed'
} | {
    type: 'success'
    invitationUrl: string;
} | {
    type: 'groupNotFound'
} | {
    type: 'phoneNrContained'
}

export interface GroupActivityAddReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    group: string;
    activity: string;
    date: number | null;
    capacity: number | null;
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
    group: string;
    /**
     * user sending the request
     */
    phoneNr: string;
    token: string;
}

export type MemberDataResp = {
    type: 'authFailed'
} | {
    type: 'success';
    prename: string;
    surname: string;
    logo: Logo | null;
    line1: HeaderLine;
    margin: string;
    line2: HeaderLine;
    activities: Activity[];
    members: Member[];
}

export interface ActivityAcceptReq {
    /**
     * user sending the request
     */
    phoneNr: string;
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
    phoneNr: string;
    token: string;
    group: string;
}

export type MembersResp = {
    type: 'authFailed' // if token is invalid or user is no member of group
} | {
    type: 'success';
    members: Member[];
}

export interface GroupAdminGroupsReq {
     /**
     * user sending the request
     */
     user: string;
     token: string;
}

export type GroupAdminGroupsResp = {
    type: 'authFailed' // if token is invalid
} | {
    type: 'success'
    groupIds: string[];
}

export interface GroupAdminGroupReq {
     /**
     * user sending the request
     */
     user: string;
     token: string;
    groupId: string;
}

export type GroupAdminGroupResp = {
    type: 'authFailed'
} | {
    type: 'success'
    members: Member[]
}