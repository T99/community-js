import { Pool as MySQLConnectionPool } from "mysql";
import { PasswordConformityFunction } from "./authentication-agent";

export type SQLFieldDescriptor = {
	
	name: string,
	
	type: string,
	
	nullable?: boolean,
	
	default?: string,
	
	unique?: boolean,
	
	comment?: string
	
};

export type TableSettings = {
	
	tableName?: string,
	
	additionalFields?: Array<SQLFieldDescriptor>
	
}

export type CommunitySettings = {
	
	connection: MySQLConnectionPool,
	
	schema?: string,
	
	users?: TableSettings,
	
	groups?: TableSettings,
	
	membership?: TableSettings,
	
	permissions?: TableSettings,
	
	authentication: {
		
		pepper: string,
		
		hashingIterations: number,
		
		passwordConformityFunction: PasswordConformityFunction
		
	}
	
};
