import { ObjectId } from "mongodb";
import { Activity, ImgData, Member } from "../_lib/api";
import { HeaderLine } from "../_lib/HeaderLine";

export interface AdminsDoc {
    _id: 'admins';
    admins: string[];
}

export interface GroupDoc {
    _id: string;
    logo: ImgData | null;
    line1: HeaderLine;
    margin: string;
    line2: HeaderLine;
    docTitle: string | null;
    admins: string[];
    members: Member[];
    activities: (Activity|null)[];
}

export interface ArchivedActivityDoc {
    groupId: string;
    activity: Activity;
}

