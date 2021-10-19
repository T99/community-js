import crypto from "crypto";
import { User } from "./schema/user";
import { UserPasswordInformation } from "./schema/user-password-information";

/**
 * The type of the function responsible for determining password conformity. A return value of 'true' from this function
 * for a given input string indicates that the given input conforms to the standards of the platform.
 */
export type PasswordConformityFunction = (password: string) => boolean;

/**
 * A class/agent responsible for managing the tasks and complexities related to verify user logins.
 * 
 * @author Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/)
 * @version v0.1.0
 * @since v0.1.0
 */
export class AuthenticationAgent {
	
	/**
	 * This is an additional security measure on top of the salt that is hashed with user passwords in order to add an
	 * extra layer of defense against brute-force attackers that have somehow gained access to a given user's salt.
	 */
	protected pepper: string;
	
	/**
	 * The default number of iterations over which to hash a user's password during the authentication process.
	 */
	protected hashingIterations: number;
	
	/**
	 * The configured password conformity function. This function is used to determine whether or not a given password
	 * conforms to the security standards of the platform. A return value of 'true' from this function for a given input
	 * string indicates that the given input conforms to the aforementioned standards.
	 */
	protected passwordConformityFunction: PasswordConformityFunction;
	
	/**
	 * Initializes a new AuthenticationAgent instance with the provided cryptographic pepper, number of default hashing
	 * iterations, and password conformity function.
	 * 
	 * @param {string} pepper 
	 * @param {number} hashingIterations
	 * @param {PasswordConformityFunction} passwordConformityFunction
	 */
	public constructor(pepper: string, hashingIterations: number,
					   passwordConformityFunction: PasswordConformityFunction) {
		
		this.pepper = pepper;
		this.hashingIterations = hashingIterations;
		this.passwordConformityFunction = passwordConformityFunction;
		
	}
	
	/**
	 * Checks the provided password string against the configured password conformity function, returning true if the
	 * given password conforms to the standards of the aforementioned function, otherwise returning false.
	 * 
	 * @param {string} password The password to check for conformity against the configured password conformity
	 * function.
	 * @returns {boolean} true if the given password conforms to the standards of the aforementioned function, otherwise
	 * returning false.
	 */
	public checkPasswordConformity(password: string): boolean {
		
		return this.passwordConformityFunction(password);
		
	}
	
	/**
	 * Hashes the provided input string with the given salt over the specified number of iterations, returning a base64
	 * string representation of the result. Also makes use of a 'pepper' that defaults to the one provided in the
	 * server's credentials.json file.
	 *
	 * @param {string} input The string to be hashed.
	 * @param {string} salt The salt to hash with the provided string.
	 * @param {number} iterations The number of iterations over which to hash the input string.
	 * @param {string} pepper An additional string to be hashed with the input string that is unique to the server, not
	 * an individual input+salt combination.
	 * @return {Promise<string>} A Promise that resolves to a base64 string representation of the the resultant hash.
	 */
	public createHash(input: string, salt: string, iterations: number, pepper: string = this.pepper): Promise<string> {
		
		return new Promise<string>((resolve: (hash: string) => void,
									reject: (error: any) => void): void => {
			
			crypto.pbkdf2(input, salt + pepper, iterations, 128, "SHA256",
				(error: Error | null, derivedKey: Buffer): void => {
					
					if (error === null) resolve(derivedKey.toString("base64"));
					else reject(new Error("An error occurred while attempting to hash a string."));
					
				});
			
		});
		
	}
	
	/**
	 * Returns a Promise that resolves to true if the provided username and password combination are valid.
	 *
	 * @param {User} user The {@link User} object/information for the user for which login is being attempted.
	 * @param {string} passwordAttempt The user-provided password to attempt to login with.
	 * @return {Promise<boolean>} A Promise that resolves to true if the provided username and password combination
	 * are valid.
	 */
	public async checkLogin(user: User, passwordAttempt: string): Promise<boolean> {
		
		return (user.passwordHash === await this.createHash(
			passwordAttempt,
			user.passwordSalt,
			user.passwordIterations
		));
		
	}
	
	/**
	 * Creates user login information, returning a Promise that resolves to said login information for the provided
	 * password.
	 *
	 * @param {string} password The password for which to create user password information.
	 * @return {Promise<UserPasswordInformation>} A Promise that resolves to said login information for the provided
	 * password.
	 */
	public async createLogin(password: string): Promise<UserPasswordInformation | undefined> {
		
		// If the password conformity check fails, do not generate user password information and return undefined.
		if (!this.checkPasswordConformity(password)) return undefined;
		
		let passwordSalt: string = crypto.randomBytes(128).toString("base64");
		let passwordIterations: number = this.hashingIterations;
		let passwordHash: string = await this.createHash(password, passwordSalt, passwordIterations);
		
		return { passwordHash, passwordSalt, passwordIterations };
		
	}
	
}
