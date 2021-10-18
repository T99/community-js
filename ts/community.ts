import { CommunitySettings, SQLFieldDescriptor } from "./community-settings";
import { DatabaseAccessor, MySQLQueryResults } from "./database-accessor";

type TableInfo = {
	
	id: string,
	
	fields: SQLFieldDescriptor
	
};

export class Community extends DatabaseAccessor {
	
	protected schema: string;
	
	protected tableIDs: {
		
		users: string,
		
		groups?: string;
		
		permissions?: string;
		
	}
	
	protected usersTableID: string;
	
	protected groupsTableID: string;

	private constructor(settings: CommunitySettings) {
		
		super(settings.connection);
		
		this.schema = settings.schema;
		
	}
	
	public static async gather(settings: CommunitySettings): Promise<Community> {
		
		let community: Community = new Community(settings);
		
		let additionalUserFields: string = (settings.users.additionalFields ?? []).map(
			(additionalField: SQLFieldDescriptor): string => community.formulateColumnDefinition(additionalField)
		).join(",\n");
		
		let userTableCreationResult: MySQLQueryResults = await community.query(`
			CREATE TABLE IF NOT EXISTS ${community.tableIDs.users} (
                \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`username\` VARCHAR(256) NOT NULL UNIQUE,
                ${additionalUserFields}
            )
		`);
		
	}
	
	protected initializeUsersTable(): Promise<void> {
		
		
		
	}
	
	
	
}
