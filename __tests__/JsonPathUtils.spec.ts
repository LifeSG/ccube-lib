import { JsonPathUtils, TConditionalPattern, TPattern, TStringPattern } from "../JsonPathUtils";

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

		it("should throw error if some results are missing and onError=throwError", () => {
			const pattern: TStringPattern = {
				stringPattern: "{{$.abc}}, {{$.lastName}}! {{$.firstName}}",
				onError: "throwError",
			};
			expect(() => JsonPathUtils.parse(pattern, data)).toThrow();

			const patternForArray: TStringPattern = { stringPattern: "{{$.emptyArray}}", onError: "throwError" };
			expect(() => JsonPathUtils.parse(patternForArray, data)).toThrow();
		});

		it("should use fallback pattern if some results are missing, " +
			"onError=fallback and there is a fallback pattern", () => {
				const pattern: TStringPattern = {
					stringPattern: "{{$.abc}}, {{$.lastName}}! {{$.firstName}}",
					onError: "fallback",
					fallback: "{{$.address.city}}",
				};
				expect(JsonPathUtils.parse(pattern, data)).toEqual("Nara");

				const patternForArray: TStringPattern = {
					stringPattern: "{{$.emptyArray}}",
					onError: "fallback",
					fallback: "{{$.address.city}}",
				};
				expect(JsonPathUtils.parse(patternForArray, data)).toEqual("Nara");
			});

		it("should not use fallback pattern if some results are missing, " +
			"onError=fallback but there is no fallback pattern", () => {
				const pattern: TStringPattern = {
					stringPattern: "{{$.abc}}, {{$.lastName}}! {{$.firstName}}",
					onError: "fallback",
					fallback: null,
				};
				expect(JsonPathUtils.parse(pattern, data)).toEqual(", doe! John");
			});

		describe("mask", () => {
			describe("uinfin", () => {
				it("should mask uinfin", () => {
					const pattern: TStringPattern = {
						stringPattern: "{{$.uinfin}}",
						mask: { type: "uinfin" },
					};
					expect(JsonPathUtils.parse(pattern, { uinfin: "S1234567D" })).toEqual("S****567D");
				});

				it("should mask the uinfin fragments of a string", () => {
					const pattern: TStringPattern = {
						stringPattern: "{{$.key}}",
						mask: { type: "uinfin" },
					};
					expect(JsonPathUtils.parse(pattern, { key: "uinfin=S1234567D&id=123 hello S1234567D" })).toEqual(
						"uinfin=S****567D&id=123 hello S****567D",
					);
				});

				it("should replace with character specified in replacement", () => {
					const pattern: TStringPattern = {
						stringPattern: "{{$.uinfin}}",
						mask: { type: "uinfin", replacement: "-" },
					};
					expect(JsonPathUtils.parse(pattern, { uinfin: "S1234567D" })).toEqual("S----567D");

					const pattern2: TStringPattern = {
						stringPattern: "{{$.key}}",
						mask: { type: "uinfin", replacement: "-" },
					};
					expect(JsonPathUtils.parse(pattern2, { key: "uinfin=S1234567D&id=123 hello S1234567D" })).toEqual(
						"uinfin=S----567D&id=123 hello S----567D",
					);
				});
			});

			describe("whole", () => {
				it("should mask the entire value", () => {
					const pattern: TStringPattern = {
						stringPattern: "{{$.firstName}}",
						mask: { type: "whole" },
					};
					expect(JsonPathUtils.parse(pattern, data)).toEqual("****");

					const pattern2: TStringPattern = {
						stringPattern: "{{$.firstName}} {{$.lastName}}",
						mask: { type: "whole" },
					};
					expect(JsonPathUtils.parse(pattern2, data)).toEqual("********");
				});

				it("should replace with character specified in replacement", () => {
					const pattern: TStringPattern = {
						stringPattern: "{{$.firstName}}",
						mask: { type: "whole", replacement: "-" },
					};
					expect(JsonPathUtils.parse(pattern, data)).toEqual("----");

					const pattern2: TStringPattern = {
						stringPattern: "{{$.firstName}} {{$.lastName}}",
						mask: { type: "whole", replacement: "-" },
					};
					expect(JsonPathUtils.parse(pattern2, data)).toEqual("--------");
				});
			});
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

			it("should return correct output for object pattern with wrap:false, " +
				"with actual empty array result", () => {
					const pattern = { objectPattern: "$.emptyArray", wrap: false };
					expect(JsonPathUtils.parse(pattern, data)).toEqual([]);
				});

			it("should return correct output for object pattern with wrap:false, " +
				"with actual single-element array result", () => {
					const pattern = { objectPattern: "$.singleElemArray", wrap: false };
					expect(JsonPathUtils.parse(pattern, data)).toEqual(["234"]);
				});

			it("should return correct output for object pattern with wrap:false, " +
				"with actual multi-element array result", () => {
					const pattern = { objectPattern: "$.multiElemArray", wrap: false };
					expect(JsonPathUtils.parse(pattern, data)).toEqual(["234", "987"]);
				});
		});

		describe("Wrap: 'unwrap'", () => {
			it("should return correct output for object pattern with wrap:'unwrap'", () => {
				const pattern: TPattern = { objectPattern: "$.age", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(26);
			});

			it("should return correct output for object pattern with wrap:'unwrap', string result", () => {
				const pattern: TPattern = { objectPattern: "$.countString", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual("123");
			});

			it("should return correct output for object pattern with wrap:'unwrap', obj result", () => {
				const pattern: TPattern = { objectPattern: "$.address", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual({
					streetAddress: "naist street",
					city: "Nara",
					postalCode: "630-0192",
				});
			});

			it("should return correct output for object filter pattern with wrap:'unwrap'", () => {
				const pattern: TPattern = { objectPattern: "$.phoneNumbers[?(@.type=='home')]", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual({ type: "home", number: "0123-4567-8910" });
			});

			it("should return correct output for object filter pattern with wrap:'unwrap', multiple results", () => {
				const pattern: TPattern = { objectPattern: "$.phoneNumbers[?(@.type=='iPhone')]", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([
					{ type: "iPhone", number: "0123-4567-8888" },
					{ type: "iPhone", number: "0123-4567-1234" },
				]);
			});

			it("should return correct output for object pattern with wrap:'unwrap', no results", () => {
				const pattern: TPattern = { objectPattern: "$.abc", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(undefined);
			});

			it("should return correct output for object filter pattern with wrap:'unwrap', no results", () => {
				const pattern: TPattern = { objectPattern: "$.phoneNumbers[?(@.type=='abc')]", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(undefined);
			});

			it("should return correct output for object pattern with wrap:'unwrap', with actual null result", () => {
				const pattern: TPattern = { objectPattern: "$.nullAttr", wrap: "unwrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for object pattern with wrap:'unwrap', " +
				"with actual empty array result", () => {
					const pattern: TPattern = { objectPattern: "$.emptyArray", wrap: "unwrap" };
					expect(JsonPathUtils.parse(pattern, data)).toEqual([]);
				});

			it("should return correct output for object pattern with wrap:'unwrap', " +
				"with actual single-element array result", () => {
					const pattern: TPattern = { objectPattern: "$.singleElemArray", wrap: "unwrap" };
					expect(JsonPathUtils.parse(pattern, data)).toEqual("234");
				});

			it("should return correct output for object pattern with wrap:'unwrap', " +
				"with actual multi-element array result", () => {
					const pattern: TPattern = { objectPattern: "$.multiElemArray", wrap: "unwrap" };
					expect(JsonPathUtils.parse(pattern, data)).toEqual(["234", "987"]);
				});
		});

		describe("Wrap: 'wrap'", () => {
			it("should return correct output for object pattern with wrap:'wrap'", () => {
				const pattern: TPattern = { objectPattern: "$.age", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([26]);
			});

			it("should return correct output for object pattern with wrap:'wrap', string result", () => {
				const pattern: TPattern = { objectPattern: "$.countString", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(["123"]);
			});

			it("should return correct output for object pattern with wrap:'wrap', obj result", () => {
				const pattern: TPattern = { objectPattern: "$.address", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([
					{
						streetAddress: "naist street",
						city: "Nara",
						postalCode: "630-0192",
					},
				]);
			});

			it("should return correct output for object filter pattern with wrap:'unwrap'", () => {
				const pattern: TPattern = { objectPattern: "$.phoneNumbers[?(@.type=='home')]", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([{ type: "home", number: "0123-4567-8910" }]);
			});

			it("should return correct output for object filter pattern with wrap:'wrap', multiple results", () => {
				const pattern: TPattern = { objectPattern: "$.phoneNumbers[?(@.type=='iPhone')]", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([
					{ type: "iPhone", number: "0123-4567-8888" },
					{ type: "iPhone", number: "0123-4567-1234" },
				]);
			});

			it("should return correct output for object pattern with wrap:'wrap', no results", () => {
				const pattern: TPattern = { objectPattern: "$.abc", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([]);
			});

			it("should return correct output for object filter pattern with wrap:'wrap', no results", () => {
				const pattern: TPattern = { objectPattern: "$.phoneNumbers[?(@.type=='abc')]", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([]);
			});

			it("should return correct output for object pattern with wrap:'wrap', with actual null result", () => {
				const pattern: TPattern = { objectPattern: "$.nullAttr", wrap: "wrap" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual([null]);
			});

			it("should return correct output for object pattern with wrap:'wrap', " +
				"with actual empty array result", () => {
					const pattern: TPattern = { objectPattern: "$.emptyArray", wrap: "wrap" };
					expect(JsonPathUtils.parse(pattern, data)).toEqual([]);
				});

			it("should return correct output for object pattern with wrap:'wrap', " +
				"with actual single-element array result", () => {
					const pattern: TPattern = { objectPattern: "$.singleElemArray", wrap: "wrap" };
					expect(JsonPathUtils.parse(pattern, data)).toEqual(["234"]);
				});

			it("should return correct output for object pattern with wrap:'wrap', " +
				"with actual multi-element array result", () => {
					const pattern: TPattern = { objectPattern: "$.multiElemArray", wrap: "wrap" };
					expect(JsonPathUtils.parse(pattern, data)).toEqual(["234", "987"]);
				});
		});
	});

	describe("ObjectPattern (parseString)", () => {
		describe("Number", () => {
			it("should return correct output for parseString number", () => {
				const pattern: TPattern = { objectPattern: "$.countString", wrap: false, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(123);
			});

			it("should return correct output for parseString number, floatStr result", () => {
				const pattern: TPattern = { objectPattern: "$.floatStr", wrap: false, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, { ...data, floatStr: "12.3" })).toEqual(12.3);
			});

			it("should return correct output for parseString number, letter string result", () => {
				const pattern: TPattern = { objectPattern: "$.firstName", wrap: false, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(NaN);
			});

			it("should return correct output for parseString number, null result", () => {
				const pattern: TPattern = { objectPattern: "$.nullAttrStr", wrap: false, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, { ...data, nullAttrStr: "null" })).toEqual(NaN);
			});

			it("should return correct output for parseString number, no results", () => {
				const pattern: TPattern = { objectPattern: "$.abc", wrap: false, parseString: "number" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(NaN);
			});
		});

		describe("Boolean", () => {
			it("should return correct output for parseString boolean", () => {
				const pattern: TPattern = { objectPattern: "$.boolString", wrap: false, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(true);
			});

			it("should return correct output for parseString boolean, letter string result", () => {
				const pattern: TPattern = { objectPattern: "$.firstName", wrap: false, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(true);
			});

			it("should return correct output for parseString boolean, boolean with non-lowercase result", () => {
				const pattern: TPattern = { objectPattern: "$.boolStringCaps", wrap: false, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, { ...data, boolStringCaps: "False" })).toEqual(false);
			});

			it("should return correct output for parseString boolean, null result", () => {
				const pattern: TPattern = { objectPattern: "$.nullAttr", wrap: false, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(false);
			});

			it("should return correct output for parseString boolean, no results", () => {
				const pattern: TPattern = { objectPattern: "$.abc", wrap: false, parseString: "boolean" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(false);
			});
		});

		describe("Array", () => {
			it("should return correct output for parseString array", () => {
				const pattern: TPattern = { objectPattern: "$.stringifiedArray", wrap: false, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(["a", "b"]);
			});

			it("should return correct output for parseString array, non-parseable result", () => {
				const pattern: TPattern = { objectPattern: "$.firstName", wrap: false, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for parseString array, parseable non-array result", () => {
				const pattern: TPattern = { objectPattern: "$.age", wrap: false, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for parseString array, no results", () => {
				const pattern: TPattern = { objectPattern: "$.abc", wrap: false, parseString: "array" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});
		});

		describe("Datetime", () => {
			it("should return correct output for parseString datetime, default format (date input)", () => {
				const pattern: TPattern = { objectPattern: "$.someDate", wrap: false, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual("2023-03-10T00:00:00Z");
			});

			it("should return correct output for parseString datetime, default format (datetime input)", () => {
				const pattern: TPattern = { objectPattern: "$.someDatetime1", wrap: false, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual("2023-03-10T13:25:54+08:00");
			});

			it("should return correct output for parseString datetime, date format (date input)", () => {
				const pattern: TPattern = {
					objectPattern: "$.someDate",
					wrap: false,
					parseString: "datetime",
					datetimeFormat: "DD MMM YYYY",
				};
				expect(JsonPathUtils.parse(pattern, data)).toEqual("10 Mar 2023");
			});

			it("should return correct output for parseString datetime, date format (datetime input)", () => {
				const pattern: TPattern = {
					objectPattern: "$.someDatetime1",
					wrap: false,
					parseString: "datetime",
					datetimeFormat: "YYYY-MM-DD",
				};
				expect(JsonPathUtils.parse(pattern, data)).toEqual("2023-03-10");
			});

			it("should return correct output for parseString datetime, time format (datetime input)", () => {
				const pattern: TPattern = {
					objectPattern: "$.someDatetime1",
					wrap: false,
					parseString: "datetime",
					datetimeFormat: "HH:mm",
				};
				expect(JsonPathUtils.parse(pattern, data)).toEqual("13:25");
			});

			it("should return correct output for parseString datetime, non-date string input", () => {
				const pattern: TPattern = { objectPattern: "$.firstName", wrap: false, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});

			it("should return correct output for parseString datetime, undefined input", () => {
				const pattern: TPattern = { objectPattern: "$.abc", wrap: false, parseString: "datetime" };
				expect(JsonPathUtils.parse(pattern, data)).toEqual(null);
			});
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

		it("should iterate through and replace array object if it contains direct " +
			"stringPattern or objectPattern keys", () => {
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
							wrap: false,
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
				search: {
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
					index: { objectPattern: "$.mapIndex", wrap: false },
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

		it('should map undefined array to empty array', () => {
			const expected = {
				mapped: [],
			};
			expect(JsonPathUtils.replacePattern(template, {})).toEqual(expected);
		});
	});

	describe('ArrayMergePattern', () => {
		describe('merge', () => {
			const template = {
				mapped: {
					arrayMergePattern: [
						"just a string",
						{ objectPattern: "$.phoneNumbers..type", wrap: "wrap" },
						42,
						{ stringPattern: "{{$.firstName}}" },
						{ objectPattern: "$.phoneNumbers..number", wrap: "wrap" },
						{ unrelated: "object" },
					],
				},
			};

			it('should merge the arrays', () => {
				const expected = {
					mapped: [
						"just a string",
						"iPhone",
						"home",
						"iPhone",
						42,
						"John",
						"0123-4567-8888",
						"0123-4567-8910",
						"0123-4567-1234",
						{ unrelated: "object" },
					],
				};

				expect(JsonPathUtils.replacePattern(template, data)).toEqual(expected);
			});

			it('should work with empty array', () => {
				const expected = {
					mapped: [],
				};
				expect(JsonPathUtils.replacePattern(
					{ mapped: { arrayMergePattern: [] } },
					{ phoneNumbers: [] },
				)).toEqual(expected);
			});

			it('should remove duplicates', () => {
				const expected = {
					mapped: [
						"just a string",
						"iPhone",
						"home",
					],
				};

				expect(JsonPathUtils.replacePattern({
					mapped: {
						arrayMergePattern: [
							"just a string",
							{ objectPattern: "$.phoneNumbers..type", wrap: "wrap" },
						],
						removeDuplicates: true,
					},
				}, data)).toEqual(expected);
			});
		});

		describe('intersect', () => {
			const template = {
				intersectArrays: {
					arrayMergePattern: [
						{ objectPattern: "$.phoneNumbers..number", wrap: "wrap" },
						[
							"0123-4567-8888",
							"0123-4567-8910",
							"0123-4567-8911", // doesn't exist
						],
					],
					mergeMethod: "intersect",
				},
				intersectValue: {
					arrayMergePattern: [
						{ objectPattern: "$.phoneNumbers..number", wrap: "wrap" },
						"0123-4567-8910",
					],
					mergeMethod: "intersect",
				},
			};

			it('should return the intersection array', () => {
				const expected = {
					intersectArrays: [
						"0123-4567-8888",
						"0123-4567-8910",
					],
					intersectValue: [
						"0123-4567-8910",
					],
				};

				expect(JsonPathUtils.replacePattern(template, data))
					.toEqual(expected);
			});

			it('should return empty intersections', () => {
				const expected = {
					intersectArrays: [],
					intersectValue: [],
				};

				expect(JsonPathUtils.replacePattern(template, {
					phoneNumbers: [],
				})).toEqual(expected);

				expect(JsonPathUtils.replacePattern(template, {})).toEqual(expected);

				expect(JsonPathUtils.replacePattern(template, {
					phoneNumbers: [
						{
							type: "iPhone",
							number: "0123-4567-9999",
						},
						{
							type: "home",
							number: "0123-4567-0000",
						},
					],
				})).toEqual(expected);
			});

			it('should evaluate nested patterns in sub-arrays', () => {
				const nested = {
					p: {
						arrayMergePattern: [
							{ objectPattern: "$.phoneNumbers..number", wrap: "wrap" },
							[
								{ stringPattern: "{{$.phoneNumbers[0].number}}" },
								"0123-4567-8910",
							],
						],
						mergeMethod: "intersect",
					},
				};
				const expected = {
					p: [
						"0123-4567-8888",
						"0123-4567-8910",
					],
				};

				expect(JsonPathUtils.replacePattern(nested, data))
					.toEqual(expected);
			});
		});
	});

	describe('ObjectMergePattern', () => {
		const addressData = {
			address1: {
				streetAddress: "naist street",
				postalCode: "630-0192",
			},
			address2: {
				streetAddress: "bob street",
				city: "Nara",
			},
		};
		const template = {
			mapped: {
				objectMergePattern: [
					{ objectPattern: "$.address1", wrap: false },
					{ objectPattern: "$.address2", wrap: false },
					{ unrelated: "object" },
				],
			},
		};

		it('should merge the objects', () => {
			const expected = {
				mapped: {
					streetAddress: "bob street",
					postalCode: "630-0192",
					city: "Nara",
					unrelated: "object",
				},
			};

			expect(JsonPathUtils.replacePattern(template, addressData)).toEqual(expected);
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
					trueValue: { objectPattern: "$.firstName", wrap: false },
					falseValue: { objectPattern: "$.lastName", wrap: false },
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
					trueValue: { objectPattern: "$.firstName", wrap: false },
					falseValue: { objectPattern: "$.lastName", wrap: false },
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
					trueValue: { objectPattern: "$.firstName", wrap: false },
					falseValue: { objectPattern: "$.lastName", wrap: false },
				},
			};
			const expected = {
				p: "doe",
			};
			expect(JsonPathUtils.replacePattern(template, data)).toEqual(expected);
		});

		it('should check for equality if conditionalCheck="equal" and return trueValue', () => {
			const template = {
				p: {
					conditionalPattern: "$.firstName",
					conditionalCheck: "equal",
					conditionalCheckValue: "John",
					trueValue: "it's equal",
					falseValue: "it's not equal",
				} as TConditionalPattern,
			};
			const expected = {
				p: "it's equal",
			};
			expect(JsonPathUtils.replacePattern(template, data)).toEqual(expected);
		});

		it('should check for equality if conditionalCheck="equal" and return falseValue', () => {
			const template = {
				p: {
					conditionalPattern: "$.firstName",
					conditionalCheck: "equal",
					conditionalCheckValue: "Foo",
					trueValue: "it's equal",
					falseValue: "it's not equal",
				} as TConditionalPattern,
			};
			const expected = {
				p: "it's not equal",
			};
			expect(JsonPathUtils.replacePattern(template, data)).toEqual(expected);
		});

		it('should check for missing values with conditionalCheck="equal" and conditionalCheckValue=undefined (default)',
			() => {
				const template = {
					p: {
						conditionalPattern: "$.keyDoesntExist",
						conditionalCheck: "equal",
						trueValue: "it doesn't not exist",
						falseValue: "it exist",
					} as TConditionalPattern,
				};
				const expected = {
					p: "it doesn't not exist",
				};
				expect(JsonPathUtils.replacePattern(template, data)).toEqual(expected);
			});

		describe('numerical check', () => {
			it.each([
				["lt", "age", 27, true],
				["lt", "age", 26, false],
				["lte", "age", 27, true],
				["lte", "age", 26, true],
				["lte", "age", 25, false],

				["gt", "age", 25, true],
				["gt", "age", 26, false],
				["gte", "age", 25, true],
				["gte", "age", 26, true],
				["gte", "age", 27, false],

				["lt", "floatAttr", 12.4, true],
				["lt", "floatAttr", 12.3, false],
				["lte", "floatAttr", 12.4, true],
				["lte", "floatAttr", 12.3, true],
				["lte", "floatAttr", 12.2, false],

				["gt", "floatAttr", 12.2, true],
				["gt", "floatAttr", 12.3, false],
				["gte", "floatAttr", 12.2, true],
				["gte", "floatAttr", 12.3, true],
				["gte", "floatAttr", 12.4, false],

				["lt", "countString", 124, true],
				["lt", "countString", 123, false],
				["lte", "countString", 124, true],
				["lte", "countString", 123, true],
				["lte", "countString", 122, false],
				["gt", "countString", 122, true],
				["gt", "countString", 123, false],
				["gte", "countString", 122, true],
				["gte", "countString", 123, true],
				["gte", "countString", 124, false],
			])('should check %s against %s(%d) as %s', (check, key, value, expected) => {
				const template = {
					p: {
						conditionalPattern: "$." + key,
						conditionalCheck: check,
						conditionalCheckValue: value,
						trueValue: true,
						falseValue: false,
					} as TConditionalPattern,
				};
				expect(JsonPathUtils.replacePattern(template, data)).toEqual({ p: expected });
			});
		});

		describe('date check', () => {
			it.each`
			check | value | expected
			${"isBefore"} | ${"2023-03-10T13:25:55+08:00"} | ${true}
			${"isBefore"} | ${"2023-03-10T13:25:53+08:00"} | ${false}
			${"isAfter"} | ${"2023-03-10T13:25:53+08:00"} | ${true}
			${"isAfter"} | ${"2023-03-10T13:25:55+08:00"} | ${false}
			`('should check $check=$expected with full datetime', ({ check, value, expected }) => {
				const template = {
					p: {
						conditionalPattern: "$.someDatetime1",
						conditionalCheck: check,
						conditionalCheckValue: value,
						trueValue: true,
						falseValue: false,
					} as TConditionalPattern,
				};
				expect(JsonPathUtils.replacePattern(template, data)).toEqual({ p: expected });
			});

			it.each`
			check | value | expected
			${"isBefore"} | ${"2023-03-11T00:00:00+08:00"} | ${true}
			${"isBefore"} | ${"2023-03-09T00:00:00+08:00"} | ${false}
			${"isAfter"} | ${"2023-03-09T00:00:00+08:00"} | ${true}
			${"isAfter"} | ${"2023-03-11T00:00:00+08:00"} | ${false}
			`('should check $check=$expected with full date-only', ({ check, value, expected }) => {
				const template = {
					p: {
						conditionalPattern: "$.someDate",
						conditionalCheck: check,
						conditionalCheckValue: value,
						trueValue: true,
						falseValue: false,
					} as TConditionalPattern,
				};
				expect(JsonPathUtils.replacePattern(template, data)).toEqual({ p: expected });
			});
		});
	});


	describe('Complex RBS examples', () => {
		const rbsData = {
			// this is IResource (excerpt)
			"name": "Lychee Room",
			"categories": [
				{
					"id": "1",
					"name": "Resource Usage",
					"type": "RESOURCE_USAGE",
					"labels": [
						{ "id": "u1", "name": "Meeting" },
						{ "id": "u2", "name": "Workshop" },
					],
				},
				{
					"id": "2",
					"name": "Built-in Amenities",
					"type": "BUILT_IN_AMENITIES",
					"labels": [
						{ "id": "a1", "name": "TV" },
						{ "id": "a2", "name": "Microphone" },
					],
				},
			],
			"resourceLayouts": [
				{
					"id": "l1",
					"name": "Classroom",
					"description": "All facing forwards",
					"imageUrls": "https://image.com/1",
					"maxCapacity": 10,
					"setupTime": 20,
					"teardownTime": 20,
				},
				{
					"id": "l2",
					"name": "Meeting",
					"description": "All facing the center",
					"imageUrls": "https://image.com/2",
					"maxCapacity": 14,
					"setupTime": 10,
					"teardownTime": 10,
				},
			],
		};

		describe('Categories', () => {
			const template: Record<string, TPattern | TPattern[]> = {
				// this is the resource response mapping (excerpt)
				additionalDetails: [
					{
						conditionalPattern: '$.categories[?(@.type==="RESOURCE_USAGE")].labels',
						trueValue: {
							key: "Booking usage",
							title: "Booking usage",
							items: {
								objectPattern: '$.categories[?(@.type==="RESOURCE_USAGE")].labels.[name]',
							},
						},
					},
				],
			};

			it('should map usage (also applies to "built-in amenities" and "additional amenities")', () => {
				const expected = {
					additionalDetails: [
						{
							key: 'Booking usage',
							title: 'Booking usage',
							items: ['Meeting', 'Workshop'],
						},
					],
				};

				expect(JsonPathUtils.replacePattern(template, rbsData)).toEqual(expected);
			});

			it('should map a missing or empty category to `undefined`', () => {
				// missing categories
				expect(JsonPathUtils.replacePattern(template, {})).toEqual({ additionalDetails: [undefined] });

				// empty (no labels)
				expect(JsonPathUtils.replacePattern(template,
					{ "categories": [] })).toEqual({ additionalDetails: [undefined] });
			});
		});

		describe('Layouts (list)', () => {
			const template: Record<string, TPattern | TPattern[]> = {
				additionalDetails: [
					{
						conditionalPattern: '$.resourceLayouts.*',
						trueValue: {
							key: "Available layouts",
							title: "Available layouts",
							description: "Additional time may be added when checking for availability due to setup and teardown of layout.",
							items: {
								arrayMapPattern: "$.resourceLayouts.*",
								itemMapping: {
									stringPattern: "{{$.mapItem.name}} ({{$.mapItem.maxCapacity}} pax)",
								},
							},
						},
					},
				],
			};

			it('should map layouts', () => { // (with string concats)
				const expected = {
					additionalDetails: [
						{
							key: 'Available layouts',
							title: 'Available layouts',
							description: 'Additional time may be added when checking for availability due to setup and teardown of layout.',
							items: ['Classroom (10 pax)', 'Meeting (14 pax)'],
						},
					],
				};

				expect(JsonPathUtils.replacePattern(template, rbsData)).toEqual(expected);
			});

			it('should map layouts to `undefined` if no layouts', () => {
				// missing layouts
				expect(JsonPathUtils.replacePattern(template, {})).toEqual({ additionalDetails: [undefined] });

				// empty (no layouts)
				expect(JsonPathUtils.replacePattern(template,
					{ "resourceLayouts": [] })).toEqual({ additionalDetails: [undefined] });
			});
		});

		describe('Layout modal', () => {
			const template: Record<string, TPattern | TPattern[]> = {
				additionalDetails: [
					{
						conditionalPattern: '$.resourceLayouts.*',
						trueValue: {
							key: "View layout details",
							title: "View layout details",
							items: {
								arrayMapPattern: "$.resourceLayouts.*",
								itemMapping: {
									label: { stringPattern: "{{$.mapItem.name}} ({{$.mapItem.maxCapacity}} pax)" },
									description: [
										{
											label: "Setup time",
											value: { stringPattern: "{{$.mapItem.setupTime}} minutes" },
										},
										{
											label: "Teardown time",
											value: { stringPattern: "{{$.mapItem.teardownTime}} minutes" },
										},
									],
								},
							},
						},
					},
				],
			};

			it('should map image modal', () => {
				const expected = {
					additionalDetails: [
						{
							key: 'View layout details',
							title: 'View layout details',
							items: [
								{
									label: 'Classroom (10 pax)',
									description: [
										{ label: "Setup time", value: "20 minutes" },
										{ label: "Teardown time", value: "20 minutes" },
									],
								},
								{
									label: 'Meeting (14 pax)',
									description: [
										{ label: "Setup time", value: "10 minutes" },
										{ label: "Teardown time", value: "10 minutes" },
									],
								},
							],
						},
					],
				};

				expect(JsonPathUtils.replacePattern(template, rbsData)).toEqual(expected);
			});
		});
	});
});
