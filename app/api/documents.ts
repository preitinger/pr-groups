import { ObjectId } from "mongodb";
import { Activity, Logo, Member } from "../_lib/api";
import { HeaderLine } from "../_lib/HeaderLine";

export interface AdminsDoc {
    _id: 'admins';
    admins: string[];
}

export interface GroupDoc {
    _id: string;
    admins: string[];
    members: Member[];
    logo: Logo | null;
    line1: HeaderLine;
    margin: string;
    line2: HeaderLine;
    activities: Activity[];
}

export interface ClosedActivityDoc {
    groupId: string;
    activity: Activity;
}