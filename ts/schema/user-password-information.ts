/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 1:14 PM -- October 19th, 2021
 * Project: community-js
 */

export type UserPasswordInformation = {
	
	passwordHash: string,
	
	passwordSalt: string,
	
	passwordIterations: number
	
};
