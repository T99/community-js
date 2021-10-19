/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 10:58 AM -- October 19th, 2021
 * Project: community-js
 */
 

import { DatabaseRowObject } from "./database-row-object";

export type Group<AdditionalFields extends {} = {}> = {
	
	id: number,
	
	name: string,
	
} & DatabaseRowObject & AdditionalFields;
