/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 11:02 AM -- October 19th, 2021
 * Project: community-js
 */
 
import { DatabaseTimestampable } from "./database-timestampable";
import { SemiPartial } from "../util/semipartial";

export type PermissionBase = {
	
	userID: string,
	
	permission: string
	
} & DatabaseTimestampable;

export type PermissionDescriptor<CustomPermission = {}> = SemiPartial<PermissionBase> | SemiPartial<CustomPermission>;
