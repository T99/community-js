/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 8:30 AM -- October 19th, 2021
 * Project: community-js
 */
 

export type DatabaseCredentials = {
	
	host: string,
	
	user: string,
	
	password: string,
	
	database?: string
	
};

export const credentials: DatabaseCredentials = {
	
	host: "localhost",
	
	user: "root",
	
	password: "@Xnp0V@9N%VyD3!U9Rb%h0qS!Pbs@LCS",
	
	database: "sandbox"
	
}
