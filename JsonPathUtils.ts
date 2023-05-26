import { JSONPath } from "jsonpath-plus";
import * as _ from "lodash";
import * as moment from "moment";

export type TData = string | number | boolean | object | any[] | null;

export interface TPatternWithError {
	onError?: "ignore" | "throwError";
}
export interface TPatternWithFallback {
	onError: "fallback";
	fallback: string;
}
export type TPatternWithErrorHandling<T> = TPatternWithError & T | TPatternWithFallback & T;

export type TStringPattern = TPatternWithErrorHandling<{ stringPattern: string; }>;

export interface TObjectPattern {
	objectPattern: string;
	wrap?: boolean | "wrap" | "unwrap";
	parseString?: string;
	datetimeFormat?: string;
}

export interface TArrayMapPattern {
	arrayMapPattern: string;
	itemMapping: TPattern;
}

export interface TConditionalPattern {
	conditionalPattern: string;
	conditionalCheck?: "boolean" | "equal";
	conditionalEqualValue?: any;
	trueValue: TPattern;
	falseValue?: TPattern;
}

export type TPattern =
	string | number | boolean |
	TStringPattern |
	TObjectPattern |
	TArrayMapPattern |
	TConditionalPattern;

export type TReturn<T extends TPattern> = T extends TObjectPattern
	? T extends { parseString: "boolean" } ? boolean
	: T extends { parseString: "number" } ? number
	: T extends { parseString: "array" } ? any[]
	: T extends { parseString: "datetime" } ? string
	: object | any[]
	: T extends TStringPattern ? string
	: T extends TArrayMapPattern ? any | any[]
	: T extends TConditionalPattern ? TData
	: T;

export namespace JsonPathUtils {

	const isPattern = (x: any): boolean => _.isObject(x) && (
		"stringPattern" in x ||
		"objectPattern" in x ||
		"arrayMapPattern" in x ||
		"conditionalPattern" in x);
	const isStringPattern = (x: any): x is TStringPattern => (x as TStringPattern).stringPattern !== undefined;
	const isObjectPattern = (x: any): x is TObjectPattern => (x as TObjectPattern).objectPattern !== undefined;
	const isArrayMapPattern = (x: any): x is TArrayMapPattern => (x as TArrayMapPattern).arrayMapPattern !== undefined;
	const isConditionalPattern = (x: any): x is TConditionalPattern => (x as TConditionalPattern).conditionalPattern !== undefined;
	const falseyList = ["false", "0", "-0", "0n", "", "null", "undefined", "nan", "[]"];

	const getResultFromStringPattern = (pattern: TStringPattern, data: TData): TReturn<TStringPattern> => {
		const parsedPatternsList = pattern.stringPattern.matchAll(/\{\{(.*?)\}\}/g);
		let output = pattern.stringPattern;
		let hasMissingValues = false;

		for (const parsedPattern of parsedPatternsList) {
			let result = JSONPath({ path: parsedPattern[1], json: data, wrap: false });
			if (_.isArray(result)) {
				if (!result.length) hasMissingValues = true;
				if (result.length === 1) result = result[0];
				else result = JSON.stringify(result);
			} else if (result === undefined) {
				hasMissingValues = true;
			}
			output = output.replace(parsedPattern[0], result === undefined ? "" : result);
		}


		if (hasMissingValues) {
			if (pattern.onError === "throwError") {
				throw new Error(`Missing output from "stringPattern" "${pattern.stringPattern}"`);
			} else if (pattern.onError === "fallback" && pattern.fallback) {
				return getResultFromStringPattern({ ...pattern, stringPattern: pattern.fallback }, data);
			}
		}

		return output;
	};

	const getResultFromObjectPattern = (pattern: TObjectPattern, data: TData): TReturn<TObjectPattern> => {
		const wrap = pattern.wrap === undefined || pattern.wrap === true;
		let result = JSONPath({ path: pattern.objectPattern, json: data, wrap });

		switch (pattern.wrap) {
			case "wrap":
				if (result === undefined) result = [];
				else if (!_.isArray(result)) result = [result];
				break;
			case "unwrap":
				if (_.isArray(result) && result.length === 1) result = result[0];
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
				if (typeof result === "string") {
					result = !falseyList.includes(result.toLowerCase());
				} else if (_.isArray(result) && _.isEmpty(result)) {
					result = false;
				} else {
					result = Boolean(result);
				}
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

	const getResultFromArrayMapPattern = (pattern: TArrayMapPattern, data: TData): TReturn<TArrayMapPattern> => {
		const array = parse({ objectPattern: pattern.arrayMapPattern, wrap: "wrap" }, data);
		if (!_.isArray(array)) return array;
		return array.map((v, i) => {
			return replacePattern(pattern.itemMapping, { data, mapItem: v, mapIndex: i });
		});
	};

	const getResultFromConditionalPattern = (
		pattern: TConditionalPattern,
		data: TData,
	): TReturn<TConditionalPattern> => {
		let cond: boolean;
		if (pattern.conditionalCheck === "equal") {
			const value = getResultFromObjectPattern({
				objectPattern: pattern.conditionalPattern,
				wrap: "unwrap",
			}, data);
			cond = value === pattern.conditionalEqualValue;
		} else { // "boolean" (default)
			cond = !!getResultFromObjectPattern({
				objectPattern: pattern.conditionalPattern,
				wrap: "unwrap",
				parseString: "boolean",
			}, data);
		}
		if (cond) {
			return replacePattern(pattern.trueValue, data);
		}
		return replacePattern(pattern.falseValue, data);
	};

	export const parse = <T extends TPattern>(pattern: T, data: TData): TReturn<T | TPattern> => {
		if (isStringPattern(pattern)) {
			return getResultFromStringPattern(pattern, data);
		} else if (isObjectPattern(pattern)) {
			return getResultFromObjectPattern(pattern, data);
		} else if (isArrayMapPattern(pattern)) {
			return getResultFromArrayMapPattern(pattern, data);
		} else if (isConditionalPattern(pattern)) {
			return getResultFromConditionalPattern(pattern, data);
		}
		return pattern;
	};

	/**
	 * This function substitutes the patterns in the given template with the actual values.
	 * The template should be a pattern, or an object that can contain patterns as values or inside arrays. This function will traverse all keys and arrays recursively and replace all patterns. Any value that is not a pattern is kept as-is in the result.
	 *
	 * Patterns that are supported:
	 * - stringPattern -- string interpolation. Can contain one or more JsonPaths.
	 * - objectPattern -- more fine control. Runs one JsonPath and can then adjust wrapping and convert the values.
	 * - conditionalPattern -- run a JsonPath and depending on its result return a new value.
	 * - arrayMapPattern -- reads an array specified by a JsonPath and converts each element using a mapping template.
	 *
	 * @param template The template of any arbitrary shape with the patterns to be replaced with.
	 * @param values The object containing the values for the placeholders.
	 * @returns The template with substituted values.
	 */
	export const replacePattern = (template: unknown, values: TData) => {
		if (!_.isObject(template)) return template;
		if (isPattern(template)) return parse(template as TPattern, values);

		const mapped = _.map(template, (value: object, key: string) => {
			// Check if value is an object with keys 'stringPattern' or 'objectPattern'
			if (isPattern(value)) {
				// Run util function to get value
				return [key, parse(value as TPattern, values)];
			}
			// Check if it is an array
			if (_.isArray(value)) {
				// Iterate over all elements in array and recursively call function for each, returning a mappedArray for collection
				const mappedArray = _.map(value, (innerValue: object) => {
					if (_.isObject(innerValue)) {
						if (isPattern(innerValue)) {
							return parse(innerValue as TPattern, values);
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
