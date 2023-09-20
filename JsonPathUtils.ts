import { ZonedDateTime } from "@js-joda/core";
import { JSONPath } from "jsonpath-plus";
import * as _ from "lodash";
import * as moment from "moment";

export type TData = string | number | boolean | object | any[] | null;

export interface TPatternWithError {
	onError?: "ignore" | "throwError";
}

export interface TPatternWithFallback {
	onError: "fallback";
	// used instead if error occurred.
	fallback: string;
}

export type TPatternWithErrorHandling<T> = TPatternWithError & T | TPatternWithFallback & T;

/**
 * Pattern to perform string interpolation. Placeholders are JsonPaths surrounded by a double-curly bracket (mustache).
 *
 * Example: `{stringPattern: "{{$.lastName}}, {{$.firstName}}"}`
 *
 * By default, JsonPaths that return nothing are ignored. This can be customized using `onError` and `fallback`.
 */
export type TStringPattern = TPatternWithErrorHandling<{
	// a string with placeholders surrounded by a double-curly bracket (mustache). Each placeholder is a JsonPath expression.
	stringPattern: string;
}>;

/**
 * Placeholder that evaluates one JsonPath expression. The JsonPath wrapping behaviour can be controlled, and further
 * parsing of the result into common types is possible.
 *
 * Example: `{ objectPattern: "$.boolString", wrap: false}`
 *
 * Wrap:
 * - Wrap=true is the default JsonPath behaviour, that wraps everything into an array.
 * - Wrap=false instructs JsonPath to avoid wrapping if possible. Depending on the result of the JsonPath expression, this will return a single element or array.
 * - Wrap="unwrap" will additionally try to unwrap arrays that only contain a single element.
 * - Wrap="wrap" will ensure that the returned value is always an array, even if JsonPath might return it as a single value.
 *
 * Parsing:
 * If wrap is anything except `true`, additional parsing of the result can be enabled with `parseString` if desired.
 */
export interface TObjectPattern {
	// a single JsonPath expression
	objectPattern: string;
	/**
	 * Wrap:
	 * - Wrap=true is the default JsonPath behaviour, that wraps everything into an array.
	 * - Wrap=false instructs JsonPath to avoid wrapping if possible. Depending on the result of the JsonPath expression, this will return a single element or array.
	 * - Wrap="unwrap" will additionally try to unwrap arrays that only contain a single element.
	 * - Wrap="wrap" will ensure that the returned value is always an array, even if JsonPath might return it as a single value.
	 */
	wrap?: boolean | "wrap" | "unwrap";
	// If wrap is not `true`, this can be used to further process the result, if it is a string, as a number, array, boolean or formatted datetime
	// tslint:disable: max-union-size
	parseString?: "number" | "array" | "boolean" | "datetime";
	// if `parseString` is `datetime`, specify what datetime format the string should be formatted as. By default, the datetime is formatted in an ISO 8601 format.
	datetimeFormat?: string;
}

/**
 * Takes an array selected by a JsonPath in `arrayMapPattern` and converts each array element using the template in `itemMapping`.
 * Within `itemMapping`, the item and the index of the current element can be accessed as `$.mapItem` and `$.mapIndex`.
 */
export interface TArrayMapPattern {
	// JsonPath expression specifying the array to be mapped
	arrayMapPattern: string;
	// template with placeholder patterns that will be used to map each array item. The current item and index can be accessed as `$.mapItem` and `$.mapIndex`.
	itemMapping: TPattern;
}

/**
 * Takes an array, where each element may be a Pattern, and merges the elements to a flat array.
 * If the element is a Pattern, the pattern is first replaced. The pattern may produce an array itself.
 * Use this to combine arrays from multiple sources.
 */
export interface TArrayMergePattern {
	// array of that can contain Patterns
	arrayMergePattern: (TPattern | any)[];
	// determine how the arrays are merged. Default `concat` simply flattens the array and keeps all items. `intersect` takes each element as an array, and intersects all arrays and keeps only the common elements. Primitives are considered a single-element array.
	mergeMethod?: "concat" | "intersect";
	// flatten the array elements further in case of nested arrays. Default is `1`. Used in mergeMethod `concat`.
	flattenDepth?: number;
	// Remove duplicate items after merging. Default is `false`.
	removeDuplicates?: boolean;
}

/**
 * Takes an array of objects, where each element may be a Pattern that produces an object, and merges all the objects into one.
 * If the same key exists in multiple objects in the array, the last value is taken.
 */
export interface TObjectMergePattern {
	// objects to merge. Can be created by a pattern.
	objectMergePattern: (TObjectPattern | TNestedPattern | TConditionalPattern)[];
}

/**
 * Evaluates a JsonPath expression in `conditionalPattern`. Depending on the result, it will either return `trueValue` or `falseValue`. Both can be primitive values, or patterns themselves.
 *
 * By default, the result of `conditionalPattern` is checked for truthiness. See `falseyList`.
 *
 * If `conditionalCheck='equal'`, the result is instead checked for equality to `conditionalCheckValue`.
 */
export interface TConditionalPattern {
	// JsonPath expression that provides the value to check
	conditionalPattern: string;
	/**
	 * type of check to perform. Default is `boolean`, which determines the truthy-ness of the value.
	 *
	 * `equal` checks equality with the value in `conditionalCheckValue`.
	 *
	 * `isBefore` and `isAfter` check if a datetime value is before/after `conditionalCheckValue`. All datetimes will be interpreted in ISO format.
	 *
	 * `lt`, `lte`, `gt` and `gte` perform numerical less-than(-equal) or greater-than(-equal) checks.
	 */
	conditionalCheck?: "boolean" | "equal" | "isBefore" | "isAfter" | "lt" | "lte" | "gt" | "gte";
	// reference value to check against. Not used when check is `boolean`.
	conditionalCheckValue?: any;
	// if the check returns true, the pattern evaluates to this value
	trueValue: TPattern;
	// if the check returns false, the pattern evaluates to this value
	falseValue?: TPattern;
}

/**
 * Generic objects with TPattern properties
 */
export interface TNestedPattern {
	[key: string]: TPattern | TPattern[];
}

/**
 * A pattern is a primitive value, or one of multiple special placeholder patterns. The placeholder patterns are evaluated into an actual value by the functions `replacePattern` or `parse`.
 */
export type TPattern =
	string | number | boolean |
	TStringPattern |
	TObjectPattern |
	TArrayMapPattern |
	TArrayMergePattern |
	TObjectMergePattern |
	TConditionalPattern |
	TNestedPattern;

export type TReturn<T extends TPattern> = T extends TObjectPattern
	? T extends { parseString: "boolean" } ? boolean
		: T extends { parseString: "number" } ? number
			: T extends { parseString: "array" } ? any[]
				: T extends { parseString: "datetime" } ? string
					: object | any[]
	: T extends TStringPattern ? string
		: T extends TArrayMapPattern ? any | any[]
			: T extends TArrayMergePattern ? any[]
				: T extends TObjectMergePattern ? any
					: T extends TConditionalPattern ? TData
						: T;

export namespace JsonPathUtils {

	const isPattern = (x: any): boolean => _.isObject(x) && (
		"stringPattern" in x ||
		"objectPattern" in x ||
		"arrayMapPattern" in x ||
		"arrayMergePattern" in x ||
		"objectMergePattern" in x ||
		"conditionalPattern" in x);

	const isStringPattern = (x: any): x is TStringPattern => (x as TStringPattern).stringPattern !== undefined;
	const isObjectPattern = (x: any): x is TObjectPattern => (x as TObjectPattern).objectPattern !== undefined;
	const isArrayMapPattern = (x: any): x is TArrayMapPattern => (x as TArrayMapPattern).arrayMapPattern !== undefined;
	const isArrayMergePattern = (x: any): x is TArrayMergePattern => (x as TArrayMergePattern).arrayMergePattern !== undefined;
	const isObjectMergePattern = (x: any): x is TObjectMergePattern => (x as TObjectMergePattern).objectMergePattern !== undefined;
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

	const getResultFromArrayMergePattern = (pattern: TArrayMergePattern, data: TData): TReturn<TArrayMergePattern> => {
		let array = pattern.arrayMergePattern.map(p => {
			if (isPattern(p)) return parse(p, data);
			if (_.isArray(p)) return replaceArrayElems(p, data);
			return p;
		});
		if (pattern.mergeMethod === "intersect") {
			array = _.intersection(...array.map(e => Array.isArray(e) ? e : [e]));
		} else {
			array = array.flat(pattern.flattenDepth ?? 1);
		}
		if (pattern.removeDuplicates) {
			array = _.uniq(array);
		}
		return array;
	};

	const getResultFromObjectMergePattern = (pattern: TObjectMergePattern, data: TData): TReturn<TObjectMergePattern> => {
		const array = pattern.objectMergePattern.map(p => {
			if (isPattern(p)) return parse(p, data);
			return p;
		});
		return _.merge({}, ...array);
	};

	const checkConditionalEqual = (pattern: TConditionalPattern, data) => {
		const value = getResultFromObjectPattern({
			objectPattern: pattern.conditionalPattern,
			wrap: "unwrap",
		}, data);
		return value === pattern.conditionalCheckValue;
	};

	const checkConditionalDatetime = (pattern: TConditionalPattern, data) => {
		const value = getResultFromObjectPattern({
			objectPattern: pattern.conditionalPattern,
			wrap: "unwrap",
			parseString: "datetime",
		}, data);
		const date = ZonedDateTime.parse(String(value));
		const checkDate = ZonedDateTime.parse(String(pattern.conditionalCheckValue));

		if (pattern.conditionalCheck === "isBefore") {
			return date.isBefore(checkDate);
		} else {
			return date.isAfter(checkDate);
		}
	};

	function checkConditionalNumeric(pattern: TConditionalPattern, data) {
		const value = getResultFromObjectPattern({
			objectPattern: pattern.conditionalPattern,
			wrap: "unwrap",
			parseString: "number",
		}, data);

		if (pattern.conditionalCheck === "lt") {
			return value < pattern.conditionalCheckValue;
		} else if (pattern.conditionalCheck === "lte") {
			return value <= pattern.conditionalCheckValue;
		} else if (pattern.conditionalCheck === "gt") {
			return value > pattern.conditionalCheckValue;
		} else if (pattern.conditionalCheck === "gte") {
			return value >= pattern.conditionalCheckValue;
		} else {
			throw new Error("unknown numerical check method " + pattern.conditionalCheck);
		}
	}

	function checkConditionalBoolean(pattern: TConditionalPattern, data) {
		return !!getResultFromObjectPattern({
			objectPattern: pattern.conditionalPattern,
			wrap: "unwrap",
			parseString: "boolean",
		}, data);
	}

	const getResultFromConditionalPattern = (
		pattern: TConditionalPattern,
		data: TData,
	): TReturn<TConditionalPattern> => {
		let cond: boolean;
		switch (pattern.conditionalCheck) {
			case "equal":
				cond = checkConditionalEqual(pattern, data);
				break;
			case "isBefore":
			case "isAfter":
				cond = checkConditionalDatetime(pattern, data);
				break;
			case "lt":
			case "lte":
			case "gt":
			case "gte":
				cond = checkConditionalNumeric(pattern, data);
				break;
			case "boolean": // default
			default:
				cond = checkConditionalBoolean(pattern, data);
				break;
		}

		if (cond) {
			return replacePattern(pattern.trueValue, data);
		}
		return replacePattern(pattern.falseValue, data);
	};


	/**
	 * Parses a single placeholder pattern. To replace all placeholders inside an object template, use `replacePattern` instead.
	 * @param pattern A placeholder pattern.
	 * @param data Contextual data that is used in the placeholder.
	 */
	export const parse = <T extends TPattern>(pattern: T, data: TData): TReturn<T | TPattern> => {
		if (isStringPattern(pattern)) {
			return getResultFromStringPattern(pattern, data);
		} else if (isObjectPattern(pattern)) {
			return getResultFromObjectPattern(pattern, data);
		} else if (isArrayMapPattern(pattern)) {
			return getResultFromArrayMapPattern(pattern, data);
		} else if (isArrayMergePattern(pattern)) {
			return getResultFromArrayMergePattern(pattern, data);
		} else if (isObjectMergePattern(pattern)) {
			return getResultFromObjectMergePattern(pattern, data);
		} else if (isConditionalPattern(pattern)) {
			return getResultFromConditionalPattern(pattern, data);
		}
		return pattern;
	};

	function replaceArrayElems(value: any[], values) {
		return _.map(value, (innerValue: object) => {
			if (_.isObject(innerValue)) {
				if (isPattern(innerValue)) {
					return parse(innerValue as TPattern, values);
				}
				return replacePattern(innerValue, values);
			}
			return innerValue; // is a primitive value within array
		});
	}

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
				const mappedArray = replaceArrayElems(value, values);
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
