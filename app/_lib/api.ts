import { ObjectId } from "mongodb";
import { HeaderLine } from "./HeaderLine";
import { deprecate } from "util";

export type Acceptance = 'accepted' | 'rejected' | 'undecided'
export interface Participation {
    phoneNr: string;
    accept: Acceptance;
    date: number;
}

export interface Activity {
    /**
     * creationDate is also the key for an Activity among all activities in a group.
     */
    creationDate: number;
    name: string;
    date: number | null;
    capacity: number | null;
    participations: Participation[];
}

export interface EditedActivity {
    /**
     * creationDate is also the key for an Activity among all activities in a group.
     * is here null for new activities
     */
    creationDate: number | null;
    name: string;
    date: number | null;
    capacity: number | null;
    // no participations here because participations can only be changed by members
}

export interface Member {
    phoneNr: string;
    prename: string;
    surname: string;
    token: string;
}

export interface ImgData {
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
    logo: ImgData | null;
    line1: HeaderLine;
    margin: string;
    line2: HeaderLine;
    docTitle: string;
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
    getList?: boolean;
}

export type GroupAdminAddResp = {
    type: 'authFailed'
} | {
    type: 'success'
    admins?: string[]
} | {
    type: 'groupNotFound'
} | {
    type: 'userNotFound'
} | {
    type: 'wasGroupAdmin'
}

export interface GroupAdminDeleteReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    group: string;
    groupAdminUser: string;
    getList?: boolean;
}

export type GroupAdminDeleteResp = {
    type: 'authFailed'
} | {
    type: 'success'
    admins?: string[]
} | {
    type: 'groupNotFound'
} | {
    type: 'wasNotGroupAdmin'
}

export interface GroupAdminAllGroupsActivitiesReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
}

export interface ActivitiesInGroup {
    group: string;
    groupTitle: string | null;
    members: Member[];
    activities: Activity[];
}

export type GroupAdminAllGroupsActivitiesResp = {
    type: 'authFailed'
} | {
    type: 'success';
    activitiesInGroups: ActivitiesInGroup[]
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

export interface GroupActivityDeleteReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    group: string;
    /**
     * for safety check in case of several modifications at the same time
     */
    activityCreationDate: number;
}

export type GroupActivityDeleteResp = {
    type: 'authFailed'
} | {
    type: 'success',
    activities: Activity[]
} | {
    type: 'groupNotFound'
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
    logo: ImgData | null;
    line1: HeaderLine;
    margin: string;
    line2: HeaderLine;
    activities: Activity[];
    members: Member[];
    docTitle: string | null;
}

export interface ActivityAcceptReq {
    /**
     * user sending the request
     */
    phoneNr: string;
    token: string;
    group: string;
    activityCreationDate: number;
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

/**
 * @deprecated
 */
export interface ActivityDetailsReq {
    /**
     * user sending the request
     */
    user: string;
    token: string;
    group: string;
    activityCreationDate: number;
}

/**
 * @deprecated
 */
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
    logo: ImgData | null;
    line1: HeaderLine;
    margin: string;
    line2: HeaderLine;
    docTitle: string | null
    admins: string[]
    members: Member[]
    activities: Activity[]
}

export interface GroupAdminGroupUpdateReq {
    /**
    * user sending the request
    */
    user: string;
    token: string;
    groupId: string;
    logo: ImgData | null;
    line1: HeaderLine;
    margin: string;
    line2: HeaderLine;
    docTitle: string | null;
    admins: string[];
    members: Member[];
    activities: EditedActivity[];
    activityIdxToArchive: number[];
}

export type GroupAdminGroupUpdateResp = {
    type: 'authFailed'
} | {
    type: 'success'
}

export interface GroupAdminMemberUpdateReq {
    /**
    * user sending the request
    */
    user: string;
    token: string;
    groupId: string;
    member: Member;
}

export type GroupAdminMemberUpdateResp = {
    type: 'authFailed'
} | {
    type: 'notFound'
} | {
    type: 'success'
    members: Member[]
}

export interface GroupAdminMemberDeleteReq {
    /**
    * user sending the request
    */
    user: string;
    token: string;
    groupId: string;
    /**
     * phoneNr of member to delete
     */
    phoneNr: string;
}

export type GroupAdminMemberDeleteResp = {
    type: 'authFailed'
} | {
    type: 'success'
    members: Member[]
}

export interface GroupAdminMemberAddReq {
    /**
    * user sending the request
    */
    user: string;
    token: string;
    groupId: string;
    phoneNr: string;
    prename: string;
    surname: string;
}

export type GroupAdminMemberAddResp = {
    type: 'authFailed'
} | {
    type: 'success'
    members: Member[]
} | {
    type: 'groupNotFound'
} | {
    type: 'phoneNrContained'
}

export interface GroupAdminActivityUpdateReq {
    /**
    * user sending the request
    */
    user: string;
    token: string;
    groupId: string;
    /**
     * to be checked
     */
    creationDate: number;
    /**
     * to be updated
     */
    activityData: {
        name: string;
        date: number | null;
        capacity: number | null;
    }
}

export type GroupAdminActivityUpdateResp = {
    type: 'authFailed'
} | {
    type: 'notFound'
} | {
    type: 'success'
    activities: Activity[]
}

export interface MemberDeleteMeReq {
    group: string;
    /**
     * user sending the request
     */
    phoneNr: string;
    token: string;
}

export type MemberDeleteMeResp = {
    type: 'authFailed'
} | {
    type: 'success'
}

export interface HandleDeletedUsersReq {
    /**
     * user must have admin privileges
     */
    user: string;
    token: string;
}

export type HandleDeletedUsersResp = {
    type: 'authFailed'
} | {
    type: 'success'
}
