import { Pool as MySQLConnectionPool } from "mysql";
import { DatabaseAccessor } from "./database-accessor";
import { DatabaseRowObject } from "./database-row-object";



export class User extends DatabaseAccessor implements DatabaseRowObject {

	protected id: number;
	
	public constructor(connection: MySQLConnectionPool, id: number) {
		
		super(connection);
		
		this.id = id;
		
	}
	
	public getUserID(): number {
		
		return this.id;
		
	}
	
	public getUsername(): Promise<string> {
		
		
		
	}
	
	public getCreatedAtTimestamp(): Promise<Date> {
		
		return Promise.resolve(undefined as any);
		
	}
	
	public getModifiedAtTimestamp(): Promise<Date> {
		
		return Promise.resolve(undefined as any);
		
	}
	
}
