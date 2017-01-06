import { FileParser } from "../parser";
import {
  Import,
  TestDataFile,
  SettingsTable,
  Setting,
  Variable,
  ScalarVariable,
  VariablesTable,
  Step,
  Keyword,
  KeywordsTable,
} from "../models";

import * as chai from "chai";

const parser = new FileParser();

function parseAndAssert(stringToParse: string, expected: any) {
  const actual = parser.parse(stringToParse);

  chai.assert.deepEqual(actual, expected);
}

/**
 *
 */
function createSettingsTable(content): TestDataFile {
  const testDataFile = new TestDataFile();

  testDataFile.settingsTable = Object.assign(new SettingsTable(), content);

  return testDataFile;
}

/**
 *
 */
function createVariablesTable(variables): TestDataFile {
  const testDataFile = new TestDataFile();

  testDataFile.variablesTable = Object.assign(new VariablesTable(), { variables });

  return testDataFile;
}

/**
 *
 */
function generateSettingsTableTest(tableDefinition: string, expectedData) {
  const inputData = `*** Settings ***\n${ tableDefinition }`;

  const expected = createSettingsTable(expectedData);

  parseAndAssert(inputData, expected);
}

/**
 *
 */
function generateVariablesTableTest(tableDefinition: string, expectedData) {
  const inputData = `*** Variables ***\n${ tableDefinition }`;

  const expected = createVariablesTable(expectedData);

  parseAndAssert(inputData, expected);
}

/**
 *
 */
function createKeywordsTable(keywords) {
  const testDataFile = new TestDataFile();

  testDataFile.keywordsTable = Object.assign(new KeywordsTable(), { keywords });

  return testDataFile;
}

/**
 *
 */
function generateKeywordsTableTest(tableDefinition: string, expectedData) {
  const inputData = `*** Keywords ***\n${ tableDefinition }`;

  const expected = createKeywordsTable(expectedData);

  parseAndAssert(inputData, expected);
}

describe("RF Parser", () => {

  describe("Parsing Settings table", () => {

    it("should recognise a settings table", () => {
      const expected = createSettingsTable({});

      parseAndAssert(`*** Settings ***`, expected);
      parseAndAssert(`*** Settings`, expected);
      parseAndAssert(`*Settings`, expected);
    });

    it("should parse resource imports", () => {
      generateSettingsTableTest(`
Resource   resources/\${ENVIRONMENT}.robot
Resource   resources/smoke_resources.robot
`, {
  imports: [
    new Import("Resource", "resources/\${ENVIRONMENT}.robot"),
    new Import("Resource", "resources/smoke_resources.robot"),
  ]
});
    });

    it("should parse suite setup", () => {
      generateSettingsTableTest(
        `Suite Setup         Open Default Browser`,
        { suiteSetup: new Setting("Suite Setup", "Open Default Browser") }
      );
    });

    it("should parse suite teardown", () => {
      generateSettingsTableTest(
        `Suite Teardown         Open Default Browser`,
        { suiteTeardown: new Setting("Suite Teardown", "Open Default Browser") }
      );
    });

    it("should parse test setup", () => {
      generateSettingsTableTest(
        `Test Setup         Open Default Browser`,
        { testSetup: new Setting("Test Setup", "Open Default Browser") }
      );
    });

    it("should parse test teardown", () => {
      generateSettingsTableTest(
        `Test Teardown         Open Default Browser`,
        { testTeardown: new Setting("Test Teardown", "Open Default Browser") }
      );
    });

  });

  describe("Parsing Variables table", () => {

    it("should recognise variables table", () => {
      const expected = new TestDataFile();
      expected.variablesTable = new VariablesTable();

      parseAndAssert(`*** Variables ***`, expected);
      parseAndAssert(`*** Variables`, expected);
      parseAndAssert(`*Variables`, expected);
    });

    it("should parse scalar variables", () => {
      generateVariablesTableTest("${lol}    123", [new ScalarVariable("lol", "123")]);
      generateVariablesTableTest("${lol}=   123", [new ScalarVariable("lol", "123")]);
      generateVariablesTableTest("${lol} =  123", [new ScalarVariable("lol", "123")]);
    });

  });

  describe("Parsing Keywords table", () => {

    it("should recognise keywords table", () => {
      const expected = new TestDataFile();
      expected.keywordsTable = new KeywordsTable();

      parseAndAssert(`*** Keywords ***`, expected);
      parseAndAssert(`*** Keywords`, expected);
      parseAndAssert(`*Keywords`, expected);
    });

    it("should parse empty keyword", () => {
      const keywordName = "Keyword Name";

      generateKeywordsTableTest(keywordName, [new Keyword(keywordName)]);
    });

    it("should parse keyword steps", () => {
      const keyword = `
Keyword Name
    Step1   Arg11
    Step2   arg21   arg22
`;

      generateKeywordsTableTest(keyword, [
        new Keyword("Keyword Name", [
          new Step("Step1", ["Arg11"]),
          new Step("Step2", ["arg21", "arg22"])
        ])
      ]);
    });

  });

});