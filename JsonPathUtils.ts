import { JSONPath } from "jsonpath-plus";
import * as _ from "lodash";
import * as moment from "moment";

export namespace JsonPathUtils {
	type TData = string | number | boolean | object | any[] | null;
	interface TStringPattern {
		stringPattern: string;
	}
	interface TObjectPattern {
		objectPattern: string;
		unwrap?: boolean;
		parseString?: string;
		datetimeFormat?: string;
	}

	type TPattern = string | number | boolean | TStringPattern | TObjectPattern;
	type TReturn<T extends TPattern> = T extends TObjectPattern
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
		let result = JSONPath({ path: pattern.objectPattern, json: data, wrap: !pattern.unwrap });
		if (pattern.unwrap) {
			if (Array.isArray(result) && result.length === 1) result = result[0];
			if (pattern.parseString) {
				switch (pattern.parseString) {
					case "number":
						result = Number(result);
						break;
					case "boolean":
						result =
							typeof result === "string" ? !falseyList.includes(result.toLowerCase()) : Boolean(result);
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
			}
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
}
