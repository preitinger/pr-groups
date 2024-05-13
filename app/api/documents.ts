import { ObjectId } from "mongodb";
import { Activity } from "../_lib/api";

export interface AdminsDoc {
    _id: 'admins';
    admins: string[];
}

export interface GroupDoc {
    _id: string;
    admins: string[];
    members: string[];
    activities: Activity[];
}

export interface ClosedActivityDoc {
    groupId: string;
    activity: Activity;
}