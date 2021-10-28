import { CommunitySettings, SQLFieldDescriptor } from "./community-settings";
import { DatabaseAccessor, MySQLQueryResults } from "./database-accessor";
import { UserBase, UserDescriptor, UserPasswordInformation } from "./schema/user";
import { AuthenticationAgent } from "./authentication-agent";
import { SemiPartial } from "./util/semipartial";
import { generateSetClauseForObject, generateWhereClauseForObject } from "./util/sql-construction";
import { CommunityError } from "./community-error";

export class Community<CustomUser = {}, CustomGroup = {},
	CustomMembership = {}, CustomPermission = {}> extends DatabaseAccessor {
	
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
			
			membership: this.buildTableID(settings.membership?.tableName ?? "memberships", settings.schema),
			
			permissions: this.buildTableID(settings.permissions?.tableName ?? "permissions", settings.schema)
			
		};
		
		this.authenticationAgent = new AuthenticationAgent(
			settings.authentication.pepper,
			settings.authentication.hashingIterations,
			settings.authentication.passwordConformityFunction
		);
		
	}
	
	public static async gather<U, G, M, P>(settings: CommunitySettings): Promise<Community<U, G, M, P>> {
		
		let community: Community<U, G, M, P> = new Community(settings);
		
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
                ${additionalFields}
				passwordHash VARCHAR(256) NOT NULL
					COMMENT 'A hashed version of this user\\'s password, having been hashed with this user\\'s salt and the server\\'s pepper.',
				passwordSalt VARCHAR(256) NOT NULL
					COMMENT 'A random base64-encoded byte-string used to give additional cryptographic strength to the user\\'s hashed password.',
				passwordIterations INT NOT NULL
					COMMENT 'The number of iterations over which this user\\'s password is hashed.',
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
                FOREIGN KEY memberships_user_id_fk (userID)
                    REFERENCES users(id)
                    ON DELETE CASCADE,
                FOREIGN KEY memberships_group_id_fk (groupID)
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
                FOREIGN KEY permissions_user_id_fk (userID)
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
	 * for yourself whether or not the result is defined.
	 * 
	 * @param {UserDescriptor<CustomUser>} userInfo The information of the user to check for.
	 * @returns {Promise<boolean>} A Promise that will resolve to true if a user matching the provided description
	 * exists.
	 * @see {@link UserDescriptor} For more information regarding the type of the parameter for this function.
	 */
	public async doesUserExist(userInfo: UserDescriptor<CustomUser>): Promise<boolean> {
		
		return (await this.getUser(userInfo) !== undefined);
		
	}
	
	/**
	 * Returns a Promise that will resolve to the user object/information for the user matching the provided
	 * description, or undefined if no such user exists.
	 * 
	 * @param {UserDescriptor<CustomUser>} userInfo The information of the user to retrieve.
	 * @returns {Promise<(UserBase & CustomUser) | undefined>} A Promise that will resolve to the object/information for
	 * the user matching the provided description, or undefined if no such user exists.
	 * @see {@link UserDescriptor} For more information regarding the type of the parameter for this function.
	 */
	public async getUser(userInfo: UserDescriptor<CustomUser>): Promise<(UserBase & CustomUser) | undefined> {
		
		let result: MySQLQueryResults = await this.query(`
			SELECT *
			FROM ${this.tableIDs.users}
			${generateWhereClauseForObject(userInfo, this.connection)}
			LIMIT 1
		`);
		
		if (result.results.length > 0) return result.results[0] as UserBase & CustomUser;
		else return undefined;
		
	}
	
	/**
	 * Returns a Promise that will resolve to an array containing the user objects/information for every user in this
	 * Community.
	 *
	 * @returns {Promise<(UserBase & CustomUser)[]>} A Promise that will resolve to an array containing the user
	 * objects/information for every user in this Community.
	 */
	public async getAllUsers(): Promise<(UserBase & CustomUser)[]> {
		
		let result: MySQLQueryResults = await this.query(`
			SELECT * FROM ${this.tableIDs.users}
		`);
		
		return result.results as unknown as (UserBase & CustomUser)[];
		
	}
	
	/**
	 * Attempts to create a new user with the provided information.
	 * 
	 * @param {string} password The password for the user that is being created.
	 * @param {CustomUser} userInfo The additional information for the user that is being created.
	 * @returns {Promise<(UserBase & CustomUser) | undefined>} A Promise that will resolve to the object/information for
	 * the newly created user, or undefined if no user was created.
	 */
	public async createUser(password: string, userInfo: CustomUser): Promise<UserBase & CustomUser> {
		
		let passwordInfo: UserPasswordInformation = await this.authenticationAgent.createLogin(password);
		
		let fullUser: CustomUser & UserPasswordInformation = {
			...userInfo,
			...passwordInfo,
		};
		
		let result: MySQLQueryResults = await this.query(`
			INSERT IGNORE INTO ${this.tableIDs.users}
			SET ${generateSetClauseForObject(fullUser, this.connection, false)}
		`);
		
		if (result.results.affectedRows === 1) {
			
			return this.getUser({ id: result.results.insertId as number }) as Promise<UserBase & CustomUser>;
			
		} else {
			
			throw new CommunityError(
				"USER_ALREADY_EXISTS",
				"Failed to insert a new user into the users table. This is most likely due to a failed " +
				"uniqueness constraint, meaning that the user most likely already exists."
			);
			
		}
		
	}
	
	// TODO [10/27/21 @ 4:10 PM] Is it even worth it to provide a singular 'updateUser' function, rather than just the
	//                           normal 'updateUsers' function? All 'updateUser' would do would be to ensure that only
	//                           a single row was being updated.
	
	// public async updateUser(identifyingInfo: UserDescriptor<CustomUser>, updatedInfo: SemiPartial<CustomUser>,
	// 						orderingColumn: keyof (UserBase & CustomUser) = "id",
	// 						orderAscending: boolean = true): Promise<(UserBase & CustomUser) | undefined> {
	//	
	// 	let whereClause: string = generateWhereClauseForObject(identifyingInfo, this.connection, false);
	//	
	// 	let result: MySQLQueryResults = await this.query(`
	// 		UPDATE ${this.tableIDs.users}
	// 		SET ${generateSetClauseForObject(updatedInfo, this.connection, false)}
	// 		WHERE ${whereClause}
	// 		ORDER BY ${this.connection.escapeId(orderingColumn as string)} ${orderAscending ? "ASC" : "DESC"}
	// 		LIMIT 1
	// 	`);
	//	
	// 	result;
	//	
	// 	return undefined as any;
	//	
	//}
	
	/**
	 * Updates the information for the users described by the `identifyingInfo` argument to that information which was
	 * provided via the `updatedInfo` argument.
	 * 
	 * @param {UserDescriptor<CustomUser>} identifyingInfo The identifying information for the users that should be
	 * updated.
	 * @param {SemiPartial<CustomUser>} updatedInfo The new information that should be used to update the information
	 * for the users specified via the `identifyingInfo` argument.
	 * @returns {Promise<(UserBase & CustomUser)[]>} An array of the updated information for the users specified by the
	 * `identifyingInfo` argument.
	 */
	public async updateUsers(identifyingInfo: UserDescriptor<CustomUser>,
							 updatedInfo: SemiPartial<CustomUser>): Promise<(UserBase & CustomUser)[]> {
		
		let result: MySQLQueryResults = await this.query(`
			SELECT @@autocommit INTO @storedAutocommitState;
			SET autocommit = FALSE;
			START TRANSACTION;

			DROP TABLE IF EXISTS updatedUserIDs;

			CREATE TEMPORARY TABLE IF NOT EXISTS updatedUserIDs(id INT);

			TRUNCATE TABLE updatedUserIDs;

			INSERT INTO updatedUserIDs
			SELECT id
			FROM ${this.tableIDs.users}
			WHERE ${generateWhereClauseForObject(identifyingInfo, this.connection, false)};

			UPDATE ${this.tableIDs.users}
				RIGHT OUTER JOIN updatedUserIDs
					ON ${this.tableIDs.users}.id = updatedUserIDs.id
			SET ${generateSetClauseForObject(updatedInfo, this.connection, false)};

			SELECT *
			FROM ${this.tableIDs.users}
				RIGHT OUTER JOIN updatedUserIDs
					ON ${this.tableIDs.users}.id = updatedUserIDs.id;

			COMMIT;
			SET autocommit = @storedAutocommitState;
		`);
		
		// The relevant select statement from the above query is the 9th statement of the query.
		return result.results[8] as (UserBase & CustomUser)[];
		
	}
	
	/**
	 * 
	 * @param {UserDescriptor<CustomUser>} userInfo
	 * @returns {Promise<boolean>} A Promise that resolves to true if the specified user was found and deleted.
	 */
	public async deleteUser(userInfo: UserDescriptor<CustomUser>): Promise<boolean> {
		
		return undefined as any;
		
	}
	
	/**
	 * 
	 * @param {UserDescriptor<CustomUser>} userInfo
	 * @returns {Promise<number>} A Promise that resolves to a numeric count of the number of users deleted. 
	 */
	public async deleteUsers(userInfo: UserDescriptor<CustomUser>): Promise<number> {
		
		return undefined as any;
		
	}
	
	/**
	 * 
	 * @returns {Promise<number>} A Promise that resolves to a numeric count of the number of users deleted.
	 */
	public async deleteAllUsers(): Promise<number> {
		
		let result: MySQLQueryResults = await this.query(`
			DELETE FROM ${this.tableIDs.users}
		`);
		
		return result.results.changedRows ?? 0;
		
	}
	
	// public async addUserToGroups(userInfo: UserDescriptor<CustomUser>,
	// 							 ...groupsInfo: SemiPartial<CustomGroup>[]): Promise<(GroupBase & CustomGroup)[]> {}
	
	// public async addUsersToGroup(groupInfo: SemiPartial<GroupBase> | SemiPartial<CustomGroup>,
	// 							 ...usersInfo: SemiPartial<CustomUser>[]): Promise<(UserBase & CustomUser)[]> {}
	
	// public async addUsersToGroups(usersInfo: Array<SemiPartial<CustomUser>>,
	// 							  groupsInfo: Array<SemiPartial<CustomGroup>>): Promise<Dunno> {}
	
	// isUserInGroup
	
	// areUsersInGroup
	
	// isUserInGroups
	
	// areUsersInGroups
	
	// can the above be made into efficient queries? if so, keep the method, if not, remove
	
	public async getUsersInGroup(groupInfo: SemiPartial<CustomGroup>): Promise<CustomUser[]> {
		
		return undefined as any;
		
	}
	
	public async getGroupsForUser(userInfo: SemiPartial<CustomUser>): Promise<CustomGroup[]> {
		
		return undefined as any;
		
	}
	
}
