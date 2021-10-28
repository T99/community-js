/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 10:58 AM -- October 19th, 2021
 * Project: community-js
 */
 
import { DatabaseIdentifiable } from "./database-identifiable";
import { DatabaseTimestampable } from "./database-timestampable";
import { SemiPartial } from "../util/semipartial";

export type GroupBase = DatabaseIdentifiable & DatabaseTimestampable;

export type GroupDescriptor<CustomGroup = {}> = SemiPartial<GroupBase> | SemiPartial<CustomGroup>;
