/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 10:58 AM -- October 19th, 2021
 * Project: community-js
 */
 
import { DatabaseIdentifiable } from "./database-identifiable";

export type Group<AdditionalFields extends {} = {}> = DatabaseIdentifiable & AdditionalFields;
