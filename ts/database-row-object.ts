export interface DatabaseRowObject {

	getModifiedAtTimestamp(): Promise<Date>;
	
	getCreatedAtTimestamp(): Promise<Date>;
	
}
