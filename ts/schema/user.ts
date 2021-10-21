/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 10:55 AM -- October 19th, 2021
 * Project: community-js
 */

import { DatabaseIdentifiable } from "./database-identifiable";

export type UserPasswordInformation = {
	
	passwordHash: string,
	
	passwordSalt: string,
	
	passwordIterations: number
	
};

export type User<AdditionalFields extends {} = {}> = DatabaseIdentifiable & UserPasswordInformation & AdditionalFields;
