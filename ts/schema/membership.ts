/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 11:00 AM -- October 19th, 2021
 * Project: community-js
 */
 
import { DatabaseRowObject } from "./database-row-object";

export type Membership<AdditionalFields extends {} = {}> = {
	
	userID: number,
	
	groupID: number
	
} & DatabaseRowObject & AdditionalFields;
