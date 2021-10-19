/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 10:53 PM -- June 11th, 2019.
 * Project: community-js
 * 
 * community-js - Unified user-management logic for login-enabled applications.
 * Copyright (C) 2021 Trevor Sears
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * NPM main class used for exporting this package's contents.
 *
 * @author Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/)
 * @version v<version>
 * @since v<version>
 */

// export { ClassName } from "./class-location";

import mysql, { Pool as MySQLConnectionPool } from "mysql";
import { Community } from "./community";
import { credentials } from "./credentials";
import { User } from "./schema/user";
// import { User } from "./schema/user";

export async function main(): Promise<void> {
	
	let connection: MySQLConnectionPool = mysql.createPool(credentials);
	
	let community: Community = await Community.gather({
		
		connection,
		
		authentication: {
			
			pepper: "%70i$%2#IVbm$vNO30fVZ&XoytPdT*5c",
			hashingIterations: 10_000,
			passwordConformityFunction: (password: string): boolean => password.length >= 8
			
		}
		
	});
	
	// console.log(`User count: ${await community.countUsers()}`);
	// console.log(`Group count: ${await community.countGroups()}`);
	
	let user: User = await community.getUser({ id: 2 }) as User;
	
	// console.log(await community.getAllUsers());
	
	connection.end();
	
}

main().catch((error: any): void => console.error(error));
