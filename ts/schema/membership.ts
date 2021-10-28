/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 11:00 AM -- October 19th, 2021
 * Project: community-js
 */
 
import { DatabaseTimestampable } from "./database-timestampable";
import { SemiPartial } from "../util/semipartial";

export type MembershipBase = {
	
	userID: number,
	
	groupID: number
	
} & DatabaseTimestampable;

export type MembershipDescriptor<CustomMembership = {}> = SemiPartial<MembershipBase> | SemiPartial<CustomMembership>;
