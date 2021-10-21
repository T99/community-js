import { DatabaseTimestampable } from "./database-timestampable";

export type DatabaseIdentifiable = {
	
	id: number
	
} & DatabaseTimestampable;
