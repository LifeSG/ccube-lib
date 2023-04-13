import { JsonPathUtils } from "../JsonPathUtils";

/* tslint:disable-next-line no-big-function */
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
		describe("Unwrap: false", () => {
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
		});

		describe("Unwrap: true", () => {
			it("should return correct output for object pattern with unwrap:true", () => {
				const pattern = { objectPattern: "$.age", unwrap: true };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(26);
			});

			it("should return correct output for object pattern with unwrap:true, string result", () => {
				const pattern = { objectPattern: "$.countString", unwrap: true };
				expect(JsonPathUtils.parse(pattern, data)).toEqual("123");
			});

			it("should return correct output for object pattern with unwrap:true, obj result", () => {
				const pattern = { objectPattern: "$.address", unwrap: true };
				expect(JsonPathUtils.parse(pattern, data)).toEqual({
					streetAddress: "naist street",
					city: "Nara",
					postalCode: "630-0192",
				});
			});

			it("should return correct output for object filter pattern with unwrap:true", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='home')]", unwrap: true };
				expect(JsonPathUtils.parse(pattern, data)).toEqual({ type: "home", number: "0123-4567-8910" });
			});

			it("should return correct output for object filter pattern with unwrap:true, multiple results", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='iPhone')]", unwrap: true };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([
					{ type: "iPhone", number: "0123-4567-8888" },
					{ type: "iPhone", number: "0123-4567-1234" },
				]);
			});

			it("should return correct output for object pattern with unwrap:true, no results", () => {
				const pattern = { objectPattern: "$.abc", unwrap: true };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(undefined);
			});

			it("should return correct output for object filter pattern with unwrap:true, no results", () => {
				const pattern = { objectPattern: "$.phoneNumbers[?(@.type=='abc')]", unwrap: true };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(undefined);
			});

			it("should return correct output for object pattern with unwrap:true, with actual null result", () => {
				const pattern = { objectPattern: "$.nullAttr", unwrap: true };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for object pattern with unwrap:true, with actual empty array result", () => {
				const pattern = { objectPattern: "$.emptyArray", unwrap: true };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([]);
			});
		});
	});

	describe("ObjectPattern (parseString)", () => {
		describe("Number", () => {
			it("should return correct output for parseString number", () => {
				const pattern = { objectPattern: "$.countString", unwrap: true, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(123);
			});

			it("should return correct output for parseString number, floatStr result", () => {
				const pattern = { objectPattern: "$.floatStr", unwrap: true, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, { ...data, floatStr: "12.3" })).toEqual(12.3);
			});

			it("should return correct output for parseString number, letter string result", () => {
				const pattern = { objectPattern: "$.firstName", unwrap: true, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(NaN);
			});

			it("should return correct output for parseString number, null result", () => {
				const pattern = { objectPattern: "$.nullAttrStr", unwrap: true, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, { ...data, nullAttrStr: "null" })).toEqual(NaN);
			});

			it("should return correct output for parseString number, no results", () => {
				const pattern = { objectPattern: "$.abc", unwrap: true, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(NaN);
			});
		});

		describe("Boolean", () => {
			it("should return correct output for parseString boolean", () => {
				const pattern = { objectPattern: "$.boolString", unwrap: true, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(true);
			});

			it("should return correct output for parseString boolean, letter string result", () => {
				const pattern = { objectPattern: "$.firstName", unwrap: true, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(true);
			});

			it("should return correct output for parseString boolean, boolean with non-lowercase result", () => {
				const pattern = { objectPattern: "$.boolStringCaps", unwrap: true, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, { ...data, boolStringCaps: "False" })).toEqual(false);
			});

			it("should return correct output for parseString boolean, null result", () => {
				const pattern = { objectPattern: "$.nullAttr", unwrap: true, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(false);
			});

			it("should return correct output for parseString boolean, no results", () => {
				const pattern = { objectPattern: "$.abc", unwrap: true, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(false);
			});
		});

		describe("Array", () => {
			it("should return correct output for parseString array", () => {
				const pattern = { objectPattern: "$.stringifiedArray", unwrap: true, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(["a", "b"]);
			});

			it("should return correct output for parseString array, non-parseable result", () => {
				const pattern = { objectPattern: "$.firstName", unwrap: true, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for parseString array, parseable non-array result", () => {
				const pattern = { objectPattern: "$.age", unwrap: true, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for parseString array, no results", () => {
				const pattern = { objectPattern: "$.abc", unwrap: true, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});
		});

		describe("Datetime", () => {
			it("should return correct output for parseString datetime, default format (date input)", () => {
				const pattern = { objectPattern: "$.someDate", unwrap: true, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual("2023-03-10T00:00:00Z");
			});

			it("should return correct output for parseString datetime, default format (datetime input)", () => {
				const pattern = { objectPattern: "$.someDatetime1", unwrap: true, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual("2023-03-10T13:25:54+08:00");
			});

			it("should return correct output for parseString datetime, date format (date input)", () => {
				const pattern = {
					objectPattern: "$.someDate",
					unwrap: true,
					parseString: "datetime",
					datetimeFormat: "DD MMM YYYY",
				};
				expect(JsonPathUtils.parse(pattern, data)).toEqual("10 Mar 2023");
			});

			it("should return correct output for parseString datetime, date format (datetime input)", () => {
				const pattern = {
					objectPattern: "$.someDatetime1",
					unwrap: true,
					parseString: "datetime",
					datetimeFormat: "YYYY-MM-DD",
				};
				expect(JsonPathUtils.parse(pattern, data)).toEqual("2023-03-10");
			});

			it("should return correct output for parseString datetime, time format (datetime input)", () => {
				const pattern = {
					objectPattern: "$.someDatetime1",
					unwrap: true,
					parseString: "datetime",
					datetimeFormat: "HH:mm",
				};
				expect(JsonPathUtils.parse(pattern, data)).toEqual("13:25");
			});

			it("should return correct output for parseString datetime, non-date string input", () => {
				const pattern = { objectPattern: "$.firstName", unwrap: true, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for parseString datetime, undefined input", () => {
				const pattern = { objectPattern: "$.abc", unwrap: true, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});
		});

		it("should return error for invalid parseString", () => {
			const pattern = { objectPattern: "$.stringifiedArray", unwrap: true, parseString: "abc" };
			expect(() => JsonPathUtils.parse(pattern, data)).toThrowError(
				new Error(`Invalid "parseString" value "${pattern.parseString}"`),
			);
		});
	});
});
