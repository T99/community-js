import { CommunitySettings, SQLFieldDescriptor } from "./community-settings";
import { DatabaseAccessor, MySQLQueryResults } from "./database-accessor";
import { User } from "./schema/user";
import { Group } from "./schema/group";
import { Membership } from "./schema/membership";
import { Permission } from "./schema/permission";
import { AuthenticationAgent } from "./authentication-agent";

/**
 * A type akin to the builtin 'Partial' type, but requiring that at least one property from the specified type be set.
 * 
 * <a href="https://stackoverflow.com/a/48244432">Credit to jcalz on StackOverflow</a>
 */
export type SemiPartial<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

export class Community<
	U extends User = User,
	G extends Group = Group,
	M extends Membership = Membership,
	P extends Permission = Permission> extends DatabaseAccessor {
	
	protected tableIDs: {
		
		users: string,
		
		groups: string,
		
		membership: string
		
		permissions: string
		
	};
	
	protected settings: CommunitySettings;
	
	protected authenticationAgent: AuthenticationAgent;

	private constructor(settings: CommunitySettings) {
		
		super(settings.connection);
		
		this.settings = settings;
		
		this.tableIDs = {
			
			users: this.buildTableID(settings.users?.tableName ?? "users", settings.schema),
			
			groups: this.buildTableID(settings.groups?.tableName ?? "groups", settings.schema),
			
			membership: this.buildTableID(settings.membership?.tableName ?? "membership", settings.schema),
			
			permissions: this.buildTableID(settings.permissions?.tableName ?? "permissions", settings.schema)
			
		};
		
		this.authenticationAgent = new AuthenticationAgent(
			settings.authentication.pepper,
			settings.authentication.hashingIterations,
			settings.authentication.passwordConformityFunction
		);
		
	}
	
	public static async gather(settings: CommunitySettings): Promise<Community> {
		
		let community: Community = new Community(settings);
		
		await community.initializeUsersTable();
		await community.initializeGroupsTable();
		await community.initializeMembershipTable();
		await community.initializePermissionsTable();
		
		return community;
		
	}
	
	/**
	 * Initializes the table responsible for holding user information, returning a Promise that resolves once the table
	 * has been verified to exist.
	 * 
	 * @returns {Promise<void>} A Promise that resolves once the table has been verified to exist.
	 */
	protected async initializeUsersTable(): Promise<void> {
		
		let additionalFields: string = "";
		let additionalFieldCount: number = this.settings.users?.additionalFields?.length ?? 0;
		
		if (additionalFieldCount > 0) {
			
			additionalFields = (this.settings.users?.additionalFields as SQLFieldDescriptor[]).map(
				(additionalField: SQLFieldDescriptor): string => this.formulateColumnDefinition(additionalField)
			).join(",\n") + ",";
			
		}
		
		let result: MySQLQueryResults = await this.query(`
			CREATE TABLE IF NOT EXISTS ${this.tableIDs.users} (
				id INT NOT NULL AUTO_INCREMENT PRIMARY KEY UNIQUE
					COMMENT 'The internal ID of this user.',
				username VARCHAR(128) NOT NULL UNIQUE
					COMMENT 'This user\\'s uniquely identifying name, used for login and various other purposes.',
				firstName VARCHAR(128) NOT NULL
					COMMENT 'This user\\'s given name.',
				lastName VARCHAR(128) NOT NULL
					COMMENT 'This user\\'s family name.',
				phone VARCHAR(32) NOT NULL
					COMMENT 'This user\\'s phone number.',
				email VARCHAR(256) NOT NULL
					COMMENT 'This user\\'s email address.',
				passwordHash VARCHAR(256) NOT NULL
					COMMENT 'A hashed version of this user\\'s password, having been hashed with this user\\'s salt and the server\\'s pepper.',
				passwordSalt VARCHAR(256) NOT NULL
					COMMENT 'A random base64-encoded byte-string used to give additional cryptographic strength to the user\\'s hashed password.',
				passwordIterations INT NOT NULL
					COMMENT 'The number of iterations over which this user\\'s password is hashed.',
				${additionalFields}
				modifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP
					COMMENT 'The date at which this row was last modified.',
				createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
					COMMENT 'The date at which this row was first inserted.'
			) COMMENT 'An enumeration of platform users and their associated information.'
		`);
		
		// let wasSuccessful: boolean = (result.results.serverStatus === 2);
		// let didTableAlreadyExist: boolean = (result.results.warningCount === 1);
		
		result;
		
	}
	
	/**
	 * Initializes the table responsible for holding user group information, returning a Promise that resolves once the
	 * table has been verified to exist.
	 *
	 * @returns {Promise<void>} A Promise that resolves once the table has been verified to exist.
	 */
	protected async initializeGroupsTable(): Promise<void> {
		
		let additionalFields: string = "";
		let additionalFieldCount: number = this.settings.groups?.additionalFields?.length ?? 0;
		
		if (additionalFieldCount > 0) {
			
			additionalFields = (this.settings.groups?.additionalFields as SQLFieldDescriptor[]).map(
				(additionalField: SQLFieldDescriptor): string => this.formulateColumnDefinition(additionalField)
			).join(",\n") + ",";
			
		}
		
		let result: MySQLQueryResults = await this.query(`
			CREATE TABLE IF NOT EXISTS ${this.tableIDs.groups} (
				id INT NOT NULL AUTO_INCREMENT PRIMARY KEY UNIQUE
					COMMENT 'The internal ID of this group.',
				name VARCHAR(256) NOT NULL UNIQUE
					COMMENT 'This user\\'s uniquely identifying name, used for login and various other purposes.',
				${additionalFields}
				modifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP
					COMMENT 'The date at which this row was last modified.',
				createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
					COMMENT 'The date at which this row was first inserted.'
			) COMMENT 'An enumeration of groups to which this platform\\'s users may belong.'
		`);
		
		// let wasSuccessful: boolean = (result.results.serverStatus === 2);
		// let didTableAlreadyExist: boolean = (result.results.warningCount === 1);
		
		result;
		
	}
	
	/**
	 * Initializes the table responsible for holding user group membership information, returning a Promise that
	 * resolves once the table has been verified to exist.
	 *
	 * @returns {Promise<void>} A Promise that resolves once the table has been verified to exist.
	 */
	protected async initializeMembershipTable(): Promise<void> {
		
		let additionalFields: string = "";
		let additionalFieldCount: number = this.settings.membership?.additionalFields?.length ?? 0;
		
		if (additionalFieldCount > 0) {
			
			additionalFields = (this.settings.membership?.additionalFields as SQLFieldDescriptor[]).map(
				(additionalField: SQLFieldDescriptor): string => this.formulateColumnDefinition(additionalField)
			).join(",\n") + ",";
			
		}
		
		let result: MySQLQueryResults = await this.query(`
			CREATE TABLE IF NOT EXISTS ${this.tableIDs.membership} (
				userID INT NOT NULL
					COMMENT 'The ID of the user that is being associated with this row\\'s group.',
				groupID INT NOT NULL
					COMMENT 'The ID of the group that is being associated with this row\\'s user.',
				${additionalFields}
				modifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP
					COMMENT 'The date at which this row was last modified.',
				createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
					COMMENT 'The date at which this row was first inserted.',
				PRIMARY KEY (userID, groupID),
                FOREIGN KEY user_id_fk (userID)
                    REFERENCES users(id)
                    ON DELETE CASCADE,
                FOREIGN KEY group_id_fk (groupID)
                    REFERENCES \`groups\`(id)
                    ON DELETE CASCADE
			) COMMENT 'A many-to-many associative table that matches users to groups.'
		`);
		
		// let wasSuccessful: boolean = (result.results.serverStatus === 2);
		// let didTableAlreadyExist: boolean = (result.results.warningCount === 1);
		
		result;
		
	}
	
	/**
	 * Initializes the table responsible for holding user permissions information, returning a Promise that resolves
	 * once the table has been verified to exist.
	 *
	 * @returns {Promise<void>} A Promise that resolves once the table has been verified to exist.
	 */
	protected async initializePermissionsTable(): Promise<void> {
		
		let additionalFields: string = "";
		let additionalFieldCount: number = this.settings.permissions?.additionalFields?.length ?? 0;
		
		if (additionalFieldCount > 0) {
			
			additionalFields = (this.settings.permissions?.additionalFields as SQLFieldDescriptor[]).map(
				(additionalField: SQLFieldDescriptor): string => this.formulateColumnDefinition(additionalField)
			).join(",\n") + ",";
			
		}
		
		let result: MySQLQueryResults = await this.query(`
			CREATE TABLE IF NOT EXISTS ${this.tableIDs.permissions} (
				userID INT NOT NULL
					COMMENT '',
				permission VARCHAR(256) NOT NULL UNIQUE
					COMMENT '',
				${additionalFields}
				modifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP
					COMMENT 'The date at which this row was last modified.',
				createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
					COMMENT 'The date at which this row was first inserted.',
                PRIMARY KEY (userID, permission),
                FOREIGN KEY user_id_fk (userID)
                    REFERENCES users(id)
                    ON DELETE CASCADE
			) COMMENT 'An enumeration of platform users and their associated information.'
		`);
		
		// let wasSuccessful: boolean = (result.results.serverStatus === 2);
		// let didTableAlreadyExist: boolean = (result.results.warningCount === 1);
		
		result;
		
	}
	
	/**
	 * Returns a Promise that resolves to a count of the number of users in this Community.
	 * 
	 * @returns {Promise<number>} A Promise that resolves to a count of the number of users in this Community.
	 */
	public async countUsers(): Promise<number> {
		
		let result: MySQLQueryResults = await this.query(`
			SELECT COUNT(id) AS count FROM ${this.tableIDs.users}
		`);
		
		return result.results[0].count;
		
	}
	
	/**
	 * Returns a Promise that resolves to a count of the number of groups in this Community.
	 *
	 * @returns {Promise<number>} A Promise that resolves to a count of the number of groups in this Community.
	 */
	public async countGroups(): Promise<number> {
		
		let result: MySQLQueryResults = await this.query(`
			SELECT COUNT(id) AS count FROM ${this.tableIDs.groups}
		`);
		
		return result.results[0].count;
		
	}
	
	/**
	 * Returns a Promise that will resolve to true if a user matching the provided description exists.
	 * 
	 * Note: Do not use this method as a pre-cursor to {@link Community#getUser} - this method utilizes that method
	 * internally, and simply checks if the result is defined. Instead, simply call {@link Community#getUser} and check
	 * for yourself whether or not the result is defined, and then use the result if so.
	 * 
	 * @param {SemiPartial<U>} userInfo The information of the user to check for.
	 * @returns {Promise<boolean>} A Promise that will resolve to true if a user matching the provided description
	 * exists.
	 * @see {@link SemiPartial} For more information regarding the type of the parameter of this function.
	 */
	public async doesUserExist(userInfo: SemiPartial<U>): Promise<boolean> {
		
		return (await this.getUser(userInfo) !== undefined);
		
	}
	
	/**
	 * Returns a Promise that will resolve to the {@link User} object/information for the user matching the provided
	 * description, or undefined if no such user exists.
	 * 
	 * @param {SemiPartial<U>} userInfo The information of the user to retrieve.
	 * @returns {Promise<U | undefined>} A Promise that will resolve to the {@link User} object/information for the user
	 * matching the provided description, or undefined if no such user exists.
	 * @see {@link SemiPartial} For more information regarding the type of the parameter of this function.
	 */
	public async getUser(userInfo: SemiPartial<U>): Promise<U | undefined> {
		
		let whereClause: string = "";
		let firstClause: boolean = true;
		
		for (let key of Object.keys(userInfo)) {
			
			if (firstClause) {
				
				whereClause += " WHERE";
				firstClause = false;
				
			} else whereClause += " AND"
			
			whereClause += ` ${key} = '${userInfo[key as keyof U]}'`
			
		}
		
		let query: string = `SELECT * FROM ${this.tableIDs.users}${whereClause} LIMIT 1`;
		
		let result: MySQLQueryResults = await this.query(query);
		
		if (result.results.length > 0) return result.results[0] as U;
		else return undefined;
		
	}
	
	/**
	 * Returns a Promise that will resolve to an array containing the {@link User} objects/information for every user in
	 * this Community.
	 * 
	 * @returns {Promise<U[]>} A Promise that will resolve to an array containing the {@link User} objects/information
	 * for every user in this Community.
	 */
	public async getAllUsers(): Promise<U[]> {
		
		let result: MySQLQueryResults = await this.query(`
			SELECT * FROM ${this.tableIDs.users}
		`);
		
		return (result.results ?? []) as U[];

	}
	
	/**
	 * 
	 * 
	 * @param {SemiPartial<G>} groupInfo
	 * @returns {Promise<G[]>}
	 */
	public async getUsersInGroup(groupInfo: SemiPartial<G>): Promise<U[]> {
		
		return [];
		
	}
	
	public async getGroupsForUser(userInfo: SemiPartial<U>): Promise<G[]> {
		
		return [];
		
	}
	
}
