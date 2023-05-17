import { JsonPathUtils } from "../JsonPathUtils";

// tslint:disable: no-big-function
describe("JsonPathUtils", () => {
	const data = {
		firstName: "John",
		lastName: "doe",
		age: 26,
		address: {
			streetAddress: "naist street",
			city: "Nara",
			postalCode: "630-0192",
		},
		countString: "123",
		boolString: "true",
		stringifiedArray: "['a', 'b']",
		singleElemArray: ["234"],
		multiElemArray: ["234", "987"],
		emptyArray: [],
		nullAttr: null,
		boolAttr: false,
		floatAttr: 12.3,
		someDate: "2023-03-10",
		someDatetime1: "2023-03-10T13:25:54+08:00",
		phoneNumbers: [
			{
				type: "iPhone",
				number: "0123-4567-8888",
			},
			{
				type: "home",
				number: "0123-4567-8910",
			},
			{
				type: "iPhone",
				number: "0123-4567-1234",
			},
		],
	};

	describe("StringPattern", () => {
		it("should return correct output for string input", () => {
			const pattern = "just a string";
			expect(JsonPathUtils.parse(pattern, data)).toEqual("just a string");
		});

		it("should return correct output for number input", () => {
			const pattern = 123;
			expect(JsonPathUtils.parse(pattern, data)).toEqual(123);
		});

		it("should return correct output for single string pattern in array", () => {
			const pattern = { stringPattern: "{{$.phoneNumbers[0].number}}" };
			expect(JsonPathUtils.parse(pattern, data)).toEqual("0123-4567-8888");
		});

		it("should return correct output for multiple patterns in string", () => {
			const pattern = { stringPattern: "{{$.lastName}}, {{$.lastName}}! {{$.firstName}}" };
			expect(JsonPathUtils.parse(pattern, data)).toEqual("doe, doe! John");
		});

		it("should return correct output for string filter pattern", () => {
			const pattern = { stringPattern: "{{$.phoneNumbers[?(@.type=='home')].number}}" };
			expect(JsonPathUtils.parse(pattern, data)).toEqual("0123-4567-8910");
		});

		it("should return correct output for string filter pattern with multiple results", () => {
			const pattern = { stringPattern: "{{$.phoneNumbers[?(@.type=='iPhone')].number}}" };
			expect(JsonPathUtils.parse(pattern, data)).toEqual(`[\"0123-4567-8888\",\"0123-4567-1234\"]`);
		});

		it("should return empty string for string pattern with no results", () => {
			const pattern = { stringPattern: "{{$.abc}}" };
			expect(JsonPathUtils.parse(pattern, data)).toEqual("");
		});

		it("should return empty string/correct output for string pattern with some results", () => {
			const pattern = { stringPattern: "{{$.abc}}, {{$.lastName}}! {{$.firstName}}" };
			expect(JsonPathUtils.parse(pattern, data)).toEqual(", doe! John");
		});

		it("should return empty string/correct output for string filter pattern with some results", () => {
			const pattern = {
				stringPattern:
					"{{$.phoneNumbers[?(@.type=='iPhone')].number}}, {{$.phoneNumbers[?(@.type=='abc')].number}}",
			};
			expect(JsonPathUtils.parse(pattern, data)).toEqual(`[\"0123-4567-8888\",\"0123-4567-1234\"], `);
		});

		it("should return correct output for string pattern with actual null result", () => {
			const pattern = { stringPattern: "{{$.nullAttr}}" };
			expect(JsonPathUtils.parse(pattern, data)).toEqual("null");
		});

		it("should return correct output for string pattern with actual empty array result", () => {
			const pattern = { stringPattern: "{{$.emptyArray}}" };
			expect(JsonPathUtils.parse(pattern, data)).toEqual("[]");
		});
	});

	describe("ObjectPattern", () => {
		describe("Wrap: true", () => {
			it("should return correct output for object pattern", () => {
				const pattern = { objectPattern: "$.age" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([26]);
			});

			it("should return correct output for object pattern, string result", () => {
				const pattern = { objectPattern: "$.countString" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(["123"]);
			});

			it("should return correct output for object pattern, obj result", () => {
				const pattern = { objectPattern: "$.address" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([
					{
						streetAddress: "naist street",
						city: "Nara",
						postalCode: "630-0192",
					},
				]);
			});

			it("should return correct output for object filter pattern", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='home')]" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([{ type: "home", number: "0123-4567-8910" }]);
			});

			it("should return correct output for object filter pattern, multiple results", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='iPhone')]" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([
					{ type: "iPhone", number: "0123-4567-8888" },
					{ type: "iPhone", number: "0123-4567-1234" },
				]);
			});

			it("should return correct output for object pattern, no results", () => {
				const pattern = { objectPattern: "$.abc" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([]);
			});

			it("should return correct output for object filter pattern, no results", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='abc')]" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([]);
			});

			it("should return correct output for object pattern with actual null result", () => {
				const pattern = { objectPattern: "$.nullAttr" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([null]);
			});

			it("should return correct output for object pattern with actual empty array result", () => {
				const pattern = { objectPattern: "$.emptyArray" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([[]]);
			});

			it("should return correct output for object pattern with actual single-element array result", () => {
				const pattern = { objectPattern: "$.singleElemArray" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([["234"]]);
			});

			it("should return correct output for object pattern with actual multi-element array result", () => {
				const pattern = { objectPattern: "$.multiElemArray" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([["234", "987"]]);
			});
		});

		describe("Wrap: false", () => {
			it("should return correct output for object pattern with wrap:false", () => {
				const pattern = { objectPattern: "$.age", wrap: false };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(26);
			});

			it("should return correct output for object pattern with wrap:false, string result", () => {
				const pattern = { objectPattern: "$.countString", wrap: false };
				expect(JsonPathUtils.parse(pattern, data)).toEqual("123");
			});

			it("should return correct output for object pattern with wrap:false, obj result", () => {
				const pattern = { objectPattern: "$.address", wrap: false };
				expect(JsonPathUtils.parse(pattern, data)).toEqual({
					streetAddress: "naist street",
					city: "Nara",
					postalCode: "630-0192",
				});
			});

			it("should return correct output for object filter pattern with wrap:false", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='home')]", wrap: false };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([{ type: "home", number: "0123-4567-8910" }]);
			});

			it("should return correct output for object filter pattern with wrap:false, multiple results", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='iPhone')]", wrap: false };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([
					{ type: "iPhone", number: "0123-4567-8888" },
					{ type: "iPhone", number: "0123-4567-1234" },
				]);
			});

			it("should return correct output for object pattern with wrap:false, no results", () => {
				const pattern = { objectPattern: "$.abc", wrap: false };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(undefined);
			});

			it("should return correct output for object filter pattern with wrap:false, no results", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='abc')]", wrap: false };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(undefined);
			});

			it("should return correct output for object pattern with wrap:false, with actual null result", () => {
				const pattern = { objectPattern: "$.nullAttr", wrap: false };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for object pattern with wrap:false, with actual empty array result", () => {
				const pattern = { objectPattern: "$.emptyArray", wrap: false };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([]);
			});

			it("should return correct output for object pattern with wrap:false, with actual single-element array result", () => {
				const pattern = { objectPattern: "$.singleElemArray", wrap: false };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(["234"]);
			});

			it("should return correct output for object pattern with wrap:false, with actual multi-element array result", () => {
				const pattern = { objectPattern: "$.multiElemArray", wrap: false };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(["234", "987"]);
			});
		});

		describe("Wrap: 'unwrap'", () => {
			it("should return correct output for object pattern with wrap:'unwrap'", () => {
				const pattern = { objectPattern: "$.age", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(26);
			});

			it("should return correct output for object pattern with wrap:'unwrap', string result", () => {
				const pattern = { objectPattern: "$.countString", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual("123");
			});

			it("should return correct output for object pattern with wrap:'unwrap', obj result", () => {
				const pattern = { objectPattern: "$.address", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual({
					streetAddress: "naist street",
					city: "Nara",
					postalCode: "630-0192",
				});
			});

			it("should return correct output for object filter pattern with wrap:'unwrap'", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='home')]", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual({ type: "home", number: "0123-4567-8910" });
			});

			it("should return correct output for object filter pattern with wrap:'unwrap', multiple results", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='iPhone')]", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([
					{ type: "iPhone", number: "0123-4567-8888" },
					{ type: "iPhone", number: "0123-4567-1234" },
				]);
			});

			it("should return correct output for object pattern with wrap:'unwrap', no results", () => {
				const pattern = { objectPattern: "$.abc", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(undefined);
			});

			it("should return correct output for object filter pattern with wrap:'unwrap', no results", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='abc')]", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(undefined);
			});

			it("should return correct output for object pattern with wrap:'unwrap', with actual null result", () => {
				const pattern = { objectPattern: "$.nullAttr", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for object pattern with wrap:'unwrap', with actual empty array result", () => {
				const pattern = { objectPattern: "$.emptyArray", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([]);
			});

			it("should return correct output for object pattern with wrap:'unwrap', with actual single-element array result", () => {
				const pattern = { objectPattern: "$.singleElemArray", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual("234");
			});

			it("should return correct output for object pattern with wrap:'unwrap', with actual multi-element array result", () => {
				const pattern = { objectPattern: "$.multiElemArray", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(["234", "987"]);
			});
		});

		describe("Wrap: 'wrap'", () => {
			it("should return correct output for object pattern with wrap:'wrap'", () => {
				const pattern = { objectPattern: "$.age", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([26]);
			});

			it("should return correct output for object pattern with wrap:'wrap', string result", () => {
				const pattern = { objectPattern: "$.countString", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(["123"]);
			});

			it("should return correct output for object pattern with wrap:'wrap', obj result", () => {
				const pattern = { objectPattern: "$.address", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([
					{
						streetAddress: "naist street",
						city: "Nara",
						postalCode: "630-0192",
					},
				]);
			});

			it("should return correct output for object filter pattern with wrap:'unwrap'", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='home')]", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([{ type: "home", number: "0123-4567-8910" }]);
			});

			it("should return correct output for object filter pattern with wrap:'wrap', multiple results", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='iPhone')]", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([
					{ type: "iPhone", number: "0123-4567-8888" },
					{ type: "iPhone", number: "0123-4567-1234" },
				]);
			});

			it("should return correct output for object pattern with wrap:'wrap', no results", () => {
				const pattern = { objectPattern: "$.abc", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([undefined]);
			});

			it("should return correct output for object filter pattern with wrap:'wrap', no results", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='abc')]", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([undefined]);
			});

			it("should return correct output for object pattern with wrap:'wrap', with actual null result", () => {
				const pattern = { objectPattern: "$.nullAttr", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([null]);
			});

			it("should return correct output for object pattern with wrap:'wrap', with actual empty array result", () => {
				const pattern = { objectPattern: "$.emptyArray", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([]);
			});

			it("should return correct output for object pattern with wrap:'wrap', with actual single-element array result", () => {
				const pattern = { objectPattern: "$.singleElemArray", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(["234"]);
			});

			it("should return correct output for object pattern with wrap:'wrap', with actual multi-element array result", () => {
				const pattern = { objectPattern: "$.multiElemArray", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(["234", "987"]);
			});
		});

		it("should return error for invalid wrap value", () => {
			const pattern = { objectPattern: "$.age", wrap: "abc" };
			expect(() => JsonPathUtils.parse(pattern, data)).toThrowError(
				new Error(`Invalid "wrap" value "${pattern.wrap}"`),
			);
		});
	});

	describe("ObjectPattern (parseString)", () => {
		describe("Number", () => {
			it("should return correct output for parseString number", () => {
				const pattern = { objectPattern: "$.countString", wrap: false, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(123);
			});

			it("should return correct output for parseString number, floatStr result", () => {
				const pattern = { objectPattern: "$.floatStr", wrap: false, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, { ...data, floatStr: "12.3" })).toEqual(12.3);
			});

			it("should return correct output for parseString number, letter string result", () => {
				const pattern = { objectPattern: "$.firstName", wrap: false, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(NaN);
			});

			it("should return correct output for parseString number, null result", () => {
				const pattern = { objectPattern: "$.nullAttrStr", wrap: false, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, { ...data, nullAttrStr: "null" })).toEqual(NaN);
			});

			it("should return correct output for parseString number, no results", () => {
				const pattern = { objectPattern: "$.abc", wrap: false, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(NaN);
			});
		});

		describe("Boolean", () => {
			it("should return correct output for parseString boolean", () => {
				const pattern = { objectPattern: "$.boolString", wrap: false, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(true);
			});

			it("should return correct output for parseString boolean, letter string result", () => {
				const pattern = { objectPattern: "$.firstName", wrap: false, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(true);
			});

			it("should return correct output for parseString boolean, boolean with non-lowercase result", () => {
				const pattern = { objectPattern: "$.boolStringCaps", wrap: false, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, { ...data, boolStringCaps: "False" })).toEqual(false);
			});

			it("should return correct output for parseString boolean, null result", () => {
				const pattern = { objectPattern: "$.nullAttr", wrap: false, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(false);
			});

			it("should return correct output for parseString boolean, no results", () => {
				const pattern = { objectPattern: "$.abc", wrap: false, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(false);
			});
		});

		describe("Array", () => {
			it("should return correct output for parseString array", () => {
				const pattern = { objectPattern: "$.stringifiedArray", wrap: false, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(["a", "b"]);
			});

			it("should return correct output for parseString array, non-parseable result", () => {
				const pattern = { objectPattern: "$.firstName", wrap: false, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for parseString array, parseable non-array result", () => {
				const pattern = { objectPattern: "$.age", wrap: false, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for parseString array, no results", () => {
				const pattern = { objectPattern: "$.abc", wrap: false, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});
		});

		describe("Datetime", () => {
			it("should return correct output for parseString datetime, default format (date input)", () => {
				const pattern = { objectPattern: "$.someDate", wrap: false, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual("2023-03-10T00:00:00Z");
			});

			it("should return correct output for parseString datetime, default format (datetime input)", () => {
				const pattern = { objectPattern: "$.someDatetime1", wrap: false, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual("2023-03-10T13:25:54+08:00");
			});

			it("should return correct output for parseString datetime, date format (date input)", () => {
				const pattern = {
					objectPattern: "$.someDate",
					wrap: false,
					parseString: "datetime",
					datetimeFormat: "DD MMM YYYY",
				};
				expect(JsonPathUtils.parse(pattern, data)).toEqual("10 Mar 2023");
			});

			it("should return correct output for parseString datetime, date format (datetime input)", () => {
				const pattern = {
					objectPattern: "$.someDatetime1",
					wrap: false,
					parseString: "datetime",
					datetimeFormat: "YYYY-MM-DD",
				};
				expect(JsonPathUtils.parse(pattern, data)).toEqual("2023-03-10");
			});

			it("should return correct output for parseString datetime, time format (datetime input)", () => {
				const pattern = {
					objectPattern: "$.someDatetime1",
					wrap: false,
					parseString: "datetime",
					datetimeFormat: "HH:mm",
				};
				expect(JsonPathUtils.parse(pattern, data)).toEqual("13:25");
			});

			it("should return correct output for parseString datetime, non-date string input", () => {
				const pattern = { objectPattern: "$.firstName", wrap: false, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for parseString datetime, undefined input", () => {
				const pattern = { objectPattern: "$.abc", wrap: false, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});
		});

		it("should return error for invalid parseString", () => {
			const pattern = { objectPattern: "$.stringifiedArray", wrap: false, parseString: "abc" };
			expect(() => JsonPathUtils.parse(pattern, data)).toThrowError(
				new Error(`Invalid "parseString" value "${pattern.parseString}"`),
			);
		});
	});

	describe("replacePattern", () => {
		it("should iterate through object key/values and replace nested patterns", () => {
			const template = {
				search: {
					resourceType: { stringPattern: "{{$.data.resourceType}}" },
					resourceSubType: { stringPattern: "{{$.data.resourceSubType}}" },
					startTime: { stringPattern: "{{$.data.date}}T{{$.data.startTime}}+08:00" },
					endTime: { stringPattern: "{{$.data.date}}T{{$.data.endTime}}+08:00" },
				},
			};
			const ctx = {
				data: {
					resourceType: "123",
					resourceSubType: "234",
					date: "2023-03-30",
					startTime: "09:00",
					endTime: "10:00",
				},
			};

			const expected = {
				search: {
					resourceType: "123",
					resourceSubType: "234",
					startTime: "2023-03-30T09:00+08:00",
					endTime: "2023-03-30T10:00+08:00",
				},
			};
			expect(JsonPathUtils.replacePattern(template, ctx)).toEqual(expected);
		});

		it("should iterate through nested object key/values and replace nested patterns", () => {
			const template = {
				search: {
					resource: {
						resourceType: { stringPattern: "{{$.data.resourceType}}" },
						resourceSubType: { stringPattern: "{{$.data.resourceSubType}}" },
					},
					dateTime: {
						startTime: { stringPattern: "{{$.data.date}}T{{$.data.startTime}}+08:00" },
						endTime: { stringPattern: "{{$.data.date}}T{{$.data.endTime}}+08:00" },
					},
				},
			};
			const ctx = {
				data: {
					resourceType: "123",
					resourceSubType: "234",
					date: "2023-03-30",
					startTime: "09:00",
					endTime: "10:00",
				},
			};

			const expected = {
				search: {
					resource: {
						resourceType: "123",
						resourceSubType: "234",
					},
					dateTime: {
						startTime: "2023-03-30T09:00+08:00",
						endTime: "2023-03-30T10:00+08:00",
					},
				},
			};
			expect(JsonPathUtils.replacePattern(template, ctx)).toEqual(expected);
		});

		it("should iterate through array objects and replace nested patterns", () => {
			const template = {
				search: [{
					resourceType: { stringPattern: "{{$.data.resourceType}}" },
					resourceSubType: { stringPattern: "{{$.data.resourceSubType}}" },
				}, {
					startTime: { stringPattern: "{{$.data.date}}T{{$.data.startTime}}+08:00" },
					endTime: { stringPattern: "{{$.data.date}}T{{$.data.endTime}}+08:00" },
				}],
			};
			const ctx = {
				data: {
					resourceType: "123",
					resourceSubType: "234",
					date: "2023-03-30",
					startTime: "09:00",
					endTime: "10:00",
				},
			};

			const expected = {
				search: [
					{
						resourceType: "123",
						resourceSubType: "234",
					},
					{
						startTime: "2023-03-30T09:00+08:00",
						endTime: "2023-03-30T10:00+08:00",
					},
				],
			};
			expect(JsonPathUtils.replacePattern(template, ctx)).toEqual(expected);
		});

		it("should iterate through and replace array object if it contains direct stringPattern or objectPattern keys", () => {
			const template = {
				search: {
					resourceType: { stringPattern: "{{$.data.resourceType}}" },
					resourceSubType: { stringPattern: "{{$.data.resourceSubType}}" },
				},
				dateTime: [
					{ stringPattern: "{{$.data.date}}T{{$.data.startTime}}+08:00" },
					{ stringPattern: "{{$.data.date}}T{{$.data.endTime}}+08:00" },
					{
						objectPattern: "$.data.updatedAt",
						unwrap: true,
						parseString: "datetime",
						datetimeFormat: "YYYY-MM-DD",
					},
				],
			};
			const ctx = {
				data: {
					resourceType: "123",
					resourceSubType: "234",
					date: "2023-03-30",
					startTime: "09:00",
					endTime: "10:00",
					updatedAt: "2023-03-10T13:25:54+08:00",
				},
			};

			const expected = {
				search: {
						resourceType: "123",
						resourceSubType: "234",
					},
				dateTime: [
					"2023-03-30T09:00+08:00",
					"2023-03-30T10:00+08:00",
					"2023-03-10",
				],
			};
			expect(JsonPathUtils.replacePattern(template, ctx)).toEqual(expected);
		});

		it("should return primitive values as is", () => {
			const template = {
				search: {
					resourceType: { stringPattern: "{{$.data.resourceType}}" },
					resourceSubType: { stringPattern: "{{$.data.resourceSubType}}" },
					name: "myResource",
					quantity: 8,
				},
				dateTime: [
					{ stringPattern: "{{$.data.date}}T{{$.data.startTime}}+08:00" },
					{ stringPattern: "{{$.data.date}}T{{$.data.endTime}}+08:00" },
					"2023-03-28",
				],
			};
			const ctx = {
				data: {
					resourceType: "123",
					resourceSubType: "234",
					date: "2023-03-30",
					startTime: "09:00",
					endTime: "10:00",
				},
			};

			const expected = {
				search:
					{
						resourceType: "123",
						resourceSubType: "234",
						name: "myResource",
						quantity: 8,
					},
				dateTime: [
					"2023-03-30T09:00+08:00",
					"2023-03-30T10:00+08:00",
					"2023-03-28",
				],
			};
			expect(JsonPathUtils.replacePattern(template, ctx)).toEqual(expected);
		});
	});

	describe('ArrayMapPattern', () => {
		const template = {
			mapped: {
				arrayMapPattern: "$.phoneNumbers",
				itemMapping: {
					label: { stringPattern: "{{$.mapItem.type}} --- {{$.mapItem.number}}" },
					value: { stringPattern: "{{$.mapItem.number}}" },
					staticValue: 42,
					index: { objectPattern: "$.mapIndex", unwrap: true },
				},
			},
		};

		it('should map an array', () => {
			const expected = {
				mapped: [
					{
						label: "iPhone --- 0123-4567-8888",
						value: "0123-4567-8888",
						staticValue: 42,
						index: 0,
					},
					{
						label: "home --- 0123-4567-8910",
						value: "0123-4567-8910",
						staticValue: 42,
						index: 1,
					},
					{
						label: "iPhone --- 0123-4567-1234",
						value: "0123-4567-1234",
						staticValue: 42,
						index: 2,
					},
				],
			};

			expect(JsonPathUtils.replacePattern(template, data)).toEqual(expected);
		});

		it('should map empty array to empty array', () => {
			const expected = {
				mapped: [],
			};
			expect(JsonPathUtils.replacePattern(template, { phoneNumbers: [] })).toEqual(expected);
		});

		it('should map undefined array to undefined', () => {
			const expected = {
				mapped: undefined,
			};
			expect(JsonPathUtils.replacePattern(template, {})).toEqual(expected);
		});
	});

	describe('ConditionalPattern', () => {
		it('should return the true primitive value', () => {
			const template = {
				p: {
					conditionalPattern: "$.field",
					trueValue: "foo",
					falseValue: "bar",
				},
			};
			const expected = {
				p: "foo",
			};
			expect(JsonPathUtils.replacePattern(template, { field: "value" })).toEqual(expected);
			expect(JsonPathUtils.replacePattern(template, { field: 1 })).toEqual(expected);
			expect(JsonPathUtils.replacePattern(template, { field: ["hi"] })).toEqual(expected);
			expect(JsonPathUtils.replacePattern(template, { field: { hi: "hello" } })).toEqual(expected);
		});

		it('should return the false primitive value', () => {
			const template = {
				p: {
					conditionalPattern: "$.field",
					trueValue: "foo",
					falseValue: "bar",
				},
			};
			const expected = {
				p: "bar",
			};
			expect(JsonPathUtils.replacePattern(template, {})).toEqual(expected);
			expect(JsonPathUtils.replacePattern(template, { field: "" })).toEqual(expected);
			expect(JsonPathUtils.replacePattern(template, { field: false })).toEqual(expected);
			expect(JsonPathUtils.replacePattern(template, { field: [] })).toEqual(expected);
		});

		it('should return undefined if no false value given and it is false', () => {
			const template = {
				p: {
					conditionalPattern: "$.field",
					trueValue: "foo",
				},
			};
			const expected = {
				p: undefined,
			};
			expect(JsonPathUtils.replacePattern(template, { field: "" })).toEqual(expected);
		});

		it('should evaluate the true pattern', () => {
			const template = {
				p: {
					conditionalPattern: "$.age",
					trueValue: { objectPattern: "$.firstName", unwrap: true },
					falseValue: { objectPattern: "$.lastName", unwrap: true },
				},
			};
			const expected = {
				p: "John",
			};
			expect(JsonPathUtils.replacePattern(template, data)).toEqual(expected);
		});

		it('should evaluate the false pattern', () => {
			const template = {
				p: {
					conditionalPattern: "$.boolAttr",
					trueValue: { objectPattern: "$.firstName", unwrap: true },
					falseValue: { objectPattern: "$.lastName", unwrap: true },
				},
			};
			const expected = {
				p: "doe",
			};
			expect(JsonPathUtils.replacePattern(template, data)).toEqual(expected);
		});

		it('should evaluate the false pattern for empty array', () => {
			const template = {
				p: {
					conditionalPattern: "$.phoneNumbers[?(@.type=='abc')]",
					trueValue: { objectPattern: "$.firstName", unwrap: true },
					falseValue: { objectPattern: "$.lastName", unwrap: true },
				},
			};
			const expected = {
				p: "doe",
			};
			expect(JsonPathUtils.replacePattern(template, data)).toEqual(expected);
		});
	});
});
