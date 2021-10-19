import { FieldInfo, MysqlError, Pool as MySQLConnectionPool, QueryOptions } from "mysql";
import { SQLFieldDescriptor } from "./community-settings";

/**
 * The type of the object that is resolved from Promises returned from DatabaseManager#query calls.
 *
 * @see DatabaseAccessor#query
 */
export type MySQLQueryResults = {
	
	results: Array<{ [columnName: string]: any }>,
	
	fields: FieldInfo[]
	
};

/**
 * A class capable of connecting to and querying a MySQL database, which provides a number of quality-of-life/utility
 * query methods on top of the normal/raw `query` method that is standard.
 * 
 * @author Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/)
 * @version v0.1.0
 * @since v0.1.0
 */
export abstract class DatabaseAccessor {
	
	/**
	 * The connection pool that this instance uses to access the desired database.
	 */
	protected connection: MySQLConnectionPool;
	
	/**
	 * Initializes a new DatabaseAccessor object that will connect via the provided connection pool.
	 * 
	 * @param {Pool} connection The connection pool to use to access the desired database.
	 */
	protected constructor(connection: MySQLConnectionPool) {
		
		this.connection = connection;
		
	}
	
	/**
	 * Returns the fully qualified table identifier based on the provided raw table and schema name.
	 * 
	 * @param {string} tableName The name of the table for which to build an identifier.
	 * @param {string} schemaName The name of the schema containing the table for which to build an identifier.
	 * @returns {string} The fully qualified table identifier based on the provided raw table and schema name.
	 */
	protected buildTableID(tableName: string, schemaName?: string): string {
		
		let result: string = "";
		
		if (schemaName !== undefined) result += `${this.connection.escapeId(schemaName)}.`;
		
		result += `${this.connection.escapeId(tableName)}`;
		
		return result;
		
	}
	
	/**
	 * Builds and returns a query-ready string column definition based on the provided {@link SQLFieldDescriptor}
	 * object.
	 * 
	 * @param {SQLFieldDescriptor} descriptor The {@link SQLFieldDescriptor} object describing the desired column info.
	 * @returns {string} A query-ready string column definition based on the provided {@link SQLFieldDescriptor} object. 
	 */
	protected formulateColumnDefinition(descriptor: SQLFieldDescriptor): string {
		
		let name: string = this.connection.escapeId(descriptor.name);
		let type: string = descriptor.type;
		let nullability: string = (descriptor.nullable ?? true ? " NULL" : " NOT NULL"); 
		
		let result: string = `\`${name}\` ${type} ${nullability}`;
		
		if (descriptor.default !== undefined) result += ` DEFAULT ${descriptor.default}`;
		
		if (descriptor.unique === true) result += " UNIQUE";
		
		if (descriptor.comment !== undefined) result += ` COMMENT '${this.connection.escape(descriptor.comment)}'`;
		
		return result;
		
	}
	
	/**
	 * Returns a Promise that resolves with the results of the specified query, or rejects with the error that
	 * occurred while attempting to complete the query.
	 *
	 * This function is a Promisified version of the mysql.ConnectionPool's underlying #query function. See the
	 * documentation of that library/function for more details as to further available options and configuration.
	 *
	 * @param {string | QueryOptions} options The string SQL query or QueryOptions object to query with/on.
	 * @param {any[]} values An optional collection of values to use inside the provided query.
	 * @return {Promise<MySQLQueryResults>} A Promise that resolves with the results of the specified query, or rejects
	 * with the error that occurred while attempting to complete the query.
	 */
	protected async query(options: string | QueryOptions, values?: any[]): Promise<MySQLQueryResults> {
		
		if (values === undefined) {
			
			return new Promise<MySQLQueryResults>((resolve: (value: MySQLQueryResults) => void,
												   reject: (reason: any) => void): void => {
				
				this.connection.query(options, (error: MysqlError | null, results?: any,
															fields?: FieldInfo[]): void => {
					
					if (error !== null) reject(error);
					else resolve({ results, fields: fields as FieldInfo[] });
					
				});
				
			});
			
		} else {
			
			return new Promise<MySQLQueryResults>((resolve: (value: MySQLQueryResults) => void,
												   reject: (reason: any) => void): void => {
				
				this.connection.query(options, values, (error: MysqlError | null, results?: any,
																	fields?: FieldInfo[]): void => {
					
					if (error !== null) reject(error);
					else resolve({ results, fields: fields as FieldInfo[] });
					
				});
				
			});
			
		}
		
	}
	
	/**
	 * Returns a Promise that resolves to true if there is at least one row returned by the query, otherwise returning
	 * false.
	 *
	 * This function is a Promisified version of the mysql.ConnectionPool's underlying #query function. See the
	 * documentation of that library/function for more details as to further available options and configuration.
	 *
	 * @param {string | QueryOptions} options The string SQL query or QueryOptions object to query with/on.
	 * @param {any[]} values An optional collection of values to use inside the provided query.
	 * @return {Promise<boolean>} A Promise that resolves to true if there is at least one row returned by the query,
	 * otherwise resolving to false, or rejects with the error that occurred while attempting to complete the query.
	 */
	protected async queryForExistence(options: string | QueryOptions, values?: any[]): Promise<boolean> {
		
		let results: MySQLQueryResults = await this.query(options, values);
		
		return (results.results.length >= 1);
		
	}
	
	/**
	 * Returns a Promise that resolves to the value contained in the first column of the first row of the result set, or
	 * undefined if no rows were returned.
	 *
	 * This function is a Promisified version of the mysql.ConnectionPool's underlying #query function. See the
	 * documentation of that library/function for more details as to further available options and configuration.
	 *
	 * @param {string | QueryOptions} options The string SQL query or QueryOptions object to query with/on.
	 * @param {any[]} values An optional collection of values to use inside the provided query.
	 * @return {Promise<T | undefined>} A Promise that resolves to the value contained in the first column of the first
	 * row of the result set, or undefined if no rows were returned, or rejects with the error that occurred while
	 * attempting to complete the query.
	 */
	protected async queryForSingleCell<T>(options: string | QueryOptions, values?: any[]): Promise<T | undefined> {
		
		let results: MySQLQueryResults = await this.query(options, values);
		
		if (results.results.length >= 1) {
			
			let row: any = results.results[0];
			
			return row[Object.keys(row)[0]];
			
		} else return undefined;
		
	}
	
	/**
	 * Returns a Promise that resolves to a count of the number of rows returned by the given query.
	 *
	 * This function is a Promisified version of the mysql.ConnectionPool's underlying #query function. See the
	 * documentation of that library/function for more details as to further available options and configuration.
	 *
	 * @param {string | QueryOptions} options The string SQL query or QueryOptions object to query with/on.
	 * @param {any[]} values An optional collection of values to use inside the provided query.
	 * @return {Promise<number>} A Promise that resolves to a count of the number of rows returned by the given query,
	 * or rejects with the error that occurred while attempting to complete the query.
	 */
	protected async queryForRowCount(options: string | QueryOptions, values?: any[]): Promise<number> {
		
		let results: MySQLQueryResults = await this.query(options, values);
		
		return results.results.length;
		
	}
	
	/**
	 * Returns a Promise that resolves to an array of the values of the first column of the results.
	 *
	 * This function is a Promisified version of the mysql.ConnectionPool's underlying #query function. See the
	 * documentation of that library/function for more details as to further available options and configuration.
	 *
	 * @param {string | QueryOptions} options The string SQL query or QueryOptions object to query with/on.
	 * @param {any[]} values An optional collection of values to use inside the provided query.
	 * @return {Promise<T[]>} A Promise that resolves to an array of the values of the first column of the results, or
	 * rejects with the error that occurred while attempting to complete the query.
	 */
	protected async queryForColumnArray<T>(options: string | QueryOptions, values?: any[]): Promise<T[]> {
		
		let results: MySQLQueryResults = await this.query(options, values);
		
		if (results.results.length >= 1) {
			
			let columnName: string = Object.keys(results.results[0])[0];
			
			return results.results.map((row: any): T => {
				
				return row[columnName] as T;
				
			});
			
		} else return [];
		
	}
	
	/**
	 * Closes the connection to the database, returning a Promise that resolves once the operation is complete.
	 *
	 * @return {Promise<void>} A Promise that resolves once the operation is complete.
	 */
	protected async close(): Promise<void> {
		
		return new Promise<void>((resolve: () => void, reject: (reason: any) => void): void => {
			
			this.connection.end((error?: MysqlError): void => {
				
				if (error === undefined) resolve();
				else reject(error);
				
			});
			
		});
		
	}
	
}
