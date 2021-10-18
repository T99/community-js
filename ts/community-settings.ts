import { Pool as MySQLConnectionPool } from "mysql";

export type SQLFieldDescriptor = {
	
	name: string,
	
	type: string,
	
	nullable?: boolean,
	
	default?: string,
	
	unique?: boolean,
	
	comment?: string
	
}

export type CommunitySettings = {
	
	connection: MySQLConnectionPool,
	
	schema: string,
	
	users: {
		
		additionalFields?: Array<SQLFieldDescriptor>
		
	}
	
	groups?: {
		
		additionalFields?: Array<SQLFieldDescriptor>
		
	},
	
	permissions?: {
		
		additionalFields?: Array<SQLFieldDescriptor>
		
	}
	
};
