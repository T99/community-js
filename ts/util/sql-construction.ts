export type StringEscapingAgent = {
	
	escape(value: any): string;
	
	escapeId(value: any): string;
	
}

export function generateWhereClauseForObject<T extends object>(obj: T, escapingAgent: StringEscapingAgent,
															   includeWhereStatement: boolean = true): string {
	
	return (includeWhereStatement ? "WHERE " : "") + (Object.keys(obj) as Array<keyof T>).map(
		(key: keyof T): string => `${escapingAgent.escapeId(key)} = ${escapingAgent.escape(obj[key])}`
	).join(" AND ");
	
}

export function generateSetClauseForObject<T extends object>(obj: T, escapingAgent: StringEscapingAgent,
															 includeSetStatement: boolean = true): string {
	
	return (includeSetStatement ? "SET " : "") + (Object.keys(obj) as Array<keyof T>).map(
		(key: keyof T): string => `${escapingAgent.escapeId(key)} = ${escapingAgent.escape(obj[key])}`
	).join(", ");
	
}
