import { JSONPath } from "jsonpath-plus";
import * as _ from "lodash";
import * as moment from "moment";

export type TData = string | number | boolean | object | any[] | null;
export interface TStringPattern {
	stringPattern: string;
}
export interface TObjectPattern {
	objectPattern: string;
	wrap?: boolean | string;
	parseString?: string;
	datetimeFormat?: string;
}

export type TPattern = string | number | boolean | TStringPattern | TObjectPattern;

export type TReturn<T extends TPattern> = T extends TObjectPattern
	? T extends { parseString: "boolean" }
		? boolean
		: T extends { parseString: "number" }
		? number
		: T extends { parseString: "array" }
		? any[]
		: T extends { parseString: "datetime" }
		? string
		: object | any[]
	: T extends TStringPattern
	? string
	: T;

export namespace JsonPathUtils {
	const isStringPattern = (x: any): x is TStringPattern => (x as TStringPattern).stringPattern !== undefined;
	const isObjectPattern = (x: any): x is TObjectPattern => (x as TObjectPattern).objectPattern !== undefined;
	const falseyList = ["false", "0", "-0", "0n", "", "null", "undefined", "nan"];

	const getResultFromStringPattern = (pattern: TStringPattern, data: TData): TReturn<TStringPattern> => {
		const parsedPatternsList = pattern.stringPattern.matchAll(/\{\{(.*?)\}\}/g);
		let output = pattern.stringPattern;

		for (const parsedPattern of parsedPatternsList) {
			let result = JSONPath({ path: parsedPattern[1], json: data, wrap: false });
			if (Array.isArray(result)) {
				if (result.length === 1) result = result[0];
				else result = JSON.stringify(result);
			}
			output = output.replace(parsedPattern[0], result === undefined ? "" : result);
		}

		return output;
	};

	const getResultFromObjectPattern = (pattern: TObjectPattern, data: TData): TReturn<TObjectPattern> => {
		if (![true, false, "wrap", "unwrap", undefined].includes(pattern.wrap))
			throw new Error(`Invalid "wrap" value "${pattern.wrap}"`);

		const wrap = pattern.wrap === undefined ? true : _.isBoolean(pattern.wrap) ? pattern.wrap : false;
		let result = JSONPath({ path: pattern.objectPattern, json: data, wrap });

		switch (pattern.wrap) {
			case "wrap":
				if (!Array.isArray(result)) result = [result];
				break;
			case "unwrap":
				if (Array.isArray(result) && result.length === 1) result = result[0];
			// Fall-through
			case false:
				if (pattern.parseString) result = parseResultFromString(pattern, result);
				break;
		}
		return result;
	};

	const parseResultFromString = (pattern: TObjectPattern, result: any) => {
		switch (pattern.parseString) {
			case "number":
				result = Number(result);
				break;
			case "boolean":
				result = typeof result === "string" ? !falseyList.includes(result.toLowerCase()) : Boolean(result);
				break;
			case "array":
				try {
					const parsedArr = JSON.parse(result.replace(/'/g, '"'));
					result = _.isArray(parsedArr) ? parsedArr : null;
				} catch (e) {
					result = null;
				}
				break;
			case "datetime":
				result = moment(result, "YYYY MM DD").isValid()
					? moment.parseZone(result).format(pattern.datetimeFormat)
					: null;
				break;
			default:
				throw new Error(`Invalid "parseString" value "${pattern.parseString}"`);
		}
		return result;
	};

	export const parse = <T extends TPattern>(pattern: T, data: TData): TReturn<T | TPattern> => {
		if (isStringPattern(pattern)) {
			return getResultFromStringPattern(pattern, data);
		} else if (isObjectPattern(pattern)) {
			return getResultFromObjectPattern(pattern, data);
		}
		return pattern;
	};

	/**
	 * This function substitutes the patterns in the given template with the actual values.
	 * NOTE: The template patterns should contain JsonPath syntax that points to the actual values to replace with.
	 * @param template The template of any arbitrary shape with the patterns to be replaced with.
	 * @param values The object containing the actual values.
	 * @returns The template with substituted values.
	 */
	export const replacePattern = (template: object, values: object) => {
		const mapped = _.map(template, (value: object, key: string) => {
			// Check if value is an object with keys 'stringPattern' or 'objectPattern'
			if (_.isObject(value) && ("stringPattern" in value || "objectPattern" in value)) {
				// Run util function to get value
				const parsed = [key, JsonPathUtils.parse(value as TPattern, values)];
				return parsed;
			}
			// Check if it is an array
			if (_.isArray(value)) {
				// Iterate over all elements in array and recursively call function for each, returning a mappedArray for collection
				const mappedArray = _.map(value, (innerValue: object) => {
					if (_.isObject(innerValue)) {
						if ("stringPattern" in innerValue || "objectPattern" in innerValue) {
							return JsonPathUtils.parse(innerValue as TPattern, values);
						}
						return replacePattern(innerValue, values);
					}
					return innerValue; // is a primitive value within array
				});
				return [key, mappedArray];
			}
			// It is an object
			if (_.isObject(value)) {
				// Recursive call
				return [key, replacePattern(value, values)];
			}
			// Return as-is, primitive value
			return [key, value];
		});
		return Object.fromEntries(mapped);
	};
}
