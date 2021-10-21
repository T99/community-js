/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 11:02 AM -- October 19th, 2021
 * Project: community-js
 */
 
import { DatabaseTimestampable } from "./database-timestampable";

export type Permission<AdditionalFields extends {} = {}> = {
	
	userID: string,
	
	permission: string
	
} & DatabaseTimestampable & AdditionalFields;
