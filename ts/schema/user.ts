/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 10:55 AM -- October 19th, 2021
 * Project: community-js
 */

import { DatabaseRowObject } from "./database-row-object";
import { UserPasswordInformation } from "./user-password-information";

export type User<AdditionalFields extends {} = {}> = {
	
	id: number,
	
	username: string,
	
	firstName: string,
	
	lastName: string,
	
	phone: string,
	
	email: string
	
} & UserPasswordInformation & DatabaseRowObject & AdditionalFields;
