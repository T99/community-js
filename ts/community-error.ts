export type CommunityErrorCode =
	| "USER_ALREADY_EXISTS"
	| "USER_DOES_NOT_EXIST"
	| "GROUP_ALREADY_EXISTS"
	| "GROUP_DOES_NOT_EXIST";

/**
 * A specialized Error subclass used to better communicate the origins and reasons behind any errors originating from
 * a given {@link Community} instance.
 * 
 * @author Trevor Sears <trevorsears.main@gmail.com>
 * @version v0.1.0
 * @since v0.1.0
 */
export class CommunityError extends Error {
	
	/**
	 * The {@link Error} from which this CommunityError originated.
	 * 
	 * Usually, this is the originally thrown error, which is now being re-thrown as a CommunityError instance.
	 */
	public readonly underlyingError?: Error;
	
	/**
	 * A short, developer-friendly code used to uniquely identify the issue that occurred that precipitated this error.
	 */
	public readonly errorCode: string;
	
	/**
	 * Initializes a new CommunityError instance with the provided error code, optional long message, and underlying
	 * error.
	 * 
	 * @param {string} errorCode A short, developer-friendly code used to uniquely identify the issue that occurred that
	 * precipitated this error.
	 * @param {string} message A more descriptive, longer message used to describe what exactly occurred to cause this
	 * error.
	 * @param {Error} underlyingError The originally thrown error, if any, from which this CommunityError originated.
	 */
	public constructor(errorCode: string, message?: string, underlyingError?: Error) {
		
		let fullMessage: string = `CommunityError(${errorCode})`;
		
		if (message !== undefined) fullMessage += `: ${message}`;
		
		super(fullMessage);
		
		this.errorCode = errorCode;
		this.underlyingError = underlyingError;
		
	}
	
}
