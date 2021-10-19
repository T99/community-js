/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 11:02 AM -- October 19th, 2021
 * Project: community-js
 */
 
import { DatabaseRowObject } from "./database-row-object";

export type Permission<AdditionalFields extends {} = {}> = {
	
	userID: string,
	
	permission: string
	
} & DatabaseRowObject & AdditionalFields;
