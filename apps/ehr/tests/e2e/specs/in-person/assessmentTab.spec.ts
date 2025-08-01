import { BrowserContext, expect, Locator, Page, test } from '@playwright/test';
import { DateTime } from 'luxon';
import { waitForChartDataDeletion, waitForSaveChartDataResponse } from 'test-utils';
import { MDM_FIELD_DEFAULT_TEXT } from 'utils';
import { dataTestIds } from '../../../../src/constants/data-test-ids';
import { ResourceHandler } from '../../../e2e-utils/resource-handler';
import { CssHeader } from '../../page/CssHeader';
import { InPersonAssessmentPage } from '../../page/in-person/InPersonAssessmentPage';
import { InPersonProgressNotePage } from '../../page/in-person/InPersonProgressNotePage';
import { SideMenu } from '../../page/SideMenu';

const PROCESS_ID = `assessmentTab.spec.ts-${DateTime.now().toMillis()}`;
const resourceHandler = new ResourceHandler(PROCESS_ID, 'in-person');
let assessmentPage: InPersonAssessmentPage;
let progressNotePage: InPersonProgressNotePage;
let sideMenu: SideMenu;
let cssHeader: CssHeader;
let context: BrowserContext;
let page: Page;

const DEFAULT_TIMEOUT = { timeout: 15000 };

const DIAGNOSIS_CODE = 'J45.901';
const DIAGNOSIS_NAME = 'injury';
const E_M_CODE = '99201';
const CPT_CODE = '24640';
const CPT_CODE_2 = '72146';

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
  if (process.env.INTEGRATION_TEST === 'true') {
    await resourceHandler.setResourcesFast();
  } else {
    await resourceHandler.setResources();
    await resourceHandler.waitTillAppointmentPreprocessed(resourceHandler.appointment.id!);
  }

  context = await browser.newContext();
  page = await context.newPage();
  assessmentPage = new InPersonAssessmentPage(page);
  progressNotePage = new InPersonProgressNotePage(page);
  sideMenu = new SideMenu(page);
  cssHeader = new CssHeader(page);
  await page.goto(`in-person/${resourceHandler.appointment.id}/progress-note`);
  await cssHeader.verifyStatus('pending');
  await cssHeader.clickSwitchStatusButton('provider');
  await progressNotePage.expectLoaded();
});

test.afterAll(async () => {
  await page.close();
  await context.close();
  await resourceHandler.cleanupResources();
});

test('Check assessment page initial state and default MDM saving', async () => {
  await page.goto(`in-person/${resourceHandler.appointment.id}/assessment`);
  await assessmentPage.expectDiagnosisDropdown();
  await expect(page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis)).not.toBeVisible();
  await expect(page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis)).not.toBeVisible();
  await assessmentPage.expectMdmField({ text: MDM_FIELD_DEFAULT_TEXT });
});

test('Remove MDM and check missing required fields on review and sign page', async () => {
  await page.goto(`in-person/${resourceHandler.appointment.id}/assessment`);
  await assessmentPage.expectMdmField({ text: MDM_FIELD_DEFAULT_TEXT });
  await assessmentPage.fillMdmField('');
  await waitForChartDataDeletion(page);

  await sideMenu.clickProgressNote();
  await progressNotePage.expectLoaded();
  await progressNotePage.verifyReviewAndSignButtonDisabled();
  await test.step('Verify missing card is visible and has all required missing fields', async () => {
    await expect(page.getByTestId(dataTestIds.progressNotePage.missingCard)).toBeVisible();
    await expect(page.getByTestId(dataTestIds.progressNotePage.emCodeLink)).toBeVisible();
    await expect(page.getByTestId(dataTestIds.progressNotePage.medicalDecisionLink)).toBeVisible();
    await expect(page.getByTestId(dataTestIds.progressNotePage.primaryDiagnosisLink)).toBeVisible();
  });
  await page.getByTestId(dataTestIds.progressNotePage.primaryDiagnosisLink).click();
  await assessmentPage.expectDiagnosisDropdown();
  await assessmentPage.expectEmCodeDropdown();
  await assessmentPage.expectMdmField();
});

test('Search and select diagnoses', async () => {
  await page.goto(`in-person/${resourceHandler.appointment.id}/assessment`);
  await assessmentPage.expectDiagnosisDropdown();

  // Test ICD 10 code search
  await test.step('Search for ICD 10 code', async () => {
    await assessmentPage.selectDiagnosis({ diagnosisCode: DIAGNOSIS_CODE });
    await waitForSaveChartDataResponse(
      page,
      (json) =>
        !!json.chartData.diagnosis?.some((x) => x.code.toLocaleLowerCase().includes(DIAGNOSIS_CODE.toLocaleLowerCase()))
    );
  });

  let primaryDiagnosisValue: string | null = null;
  let primaryDiagnosis: Locator | null = null;
  await test.step('Verify primary diagnosis is visible', async () => {
    primaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis);
    await expect(primaryDiagnosis).toBeVisible();

    primaryDiagnosisValue = await primaryDiagnosis.textContent();
    expect(primaryDiagnosisValue).toContain(DIAGNOSIS_CODE);
  });

  // Test diagnosis name search
  await test.step('Search for diagnosis name', async () => {
    await assessmentPage.selectDiagnosis({ diagnosisNamePart: DIAGNOSIS_NAME });
    await waitForSaveChartDataResponse(
      page,
      (json) =>
        !!json.chartData.diagnosis?.some((x) =>
          x.display.toLocaleLowerCase().includes(DIAGNOSIS_NAME.toLocaleLowerCase())
        )
    );
  });

  let secondaryDiagnosis: Locator | null = null;
  let secondaryDiagnosisValue: string | null = null;
  await test.step('Verify secondary diagnosis is visible', async () => {
    secondaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis);
    await expect(secondaryDiagnosis).toBeVisible();

    secondaryDiagnosisValue = await secondaryDiagnosis.textContent();
    expect(secondaryDiagnosisValue?.toLocaleLowerCase()).toContain(DIAGNOSIS_NAME.toLocaleLowerCase());
  });

  // Verify diagnoses on Review and Sign page
  await test.step('Verify diagnoses on Review and Sign page', async () => {
    await sideMenu.clickProgressNote();
    await progressNotePage.expectLoaded();

    // Verify both diagnoses are present
    await expect(page.getByText(primaryDiagnosisValue!, { exact: false })).toBeVisible();
    await expect(page.getByText(secondaryDiagnosisValue!, { exact: false })).toBeVisible();
  });
});

test('Change primary diagnosis', async () => {
  await sideMenu.clickAssessment();
  await assessmentPage.expectDiagnosisDropdown();
  // Get initial values
  const initialPrimaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis);
  const initialSecondaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis);
  const initialPrimaryValue = await initialPrimaryDiagnosis.textContent();
  const initialSecondaryValue = await initialSecondaryDiagnosis.textContent();

  // Make secondary diagnosis primary
  await test.step('Make secondary diagnosis primary', async () => {
    await page.getByTestId(dataTestIds.diagnosisContainer.makePrimaryButton).click();
    await waitForSaveChartDataResponse(page);

    // After the primary diagnosis is updated, the secondary diagnosis should be updated, they should be swapped
    const newPrimaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis);
    const newSecondaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis);
    await expect(newPrimaryDiagnosis).toHaveText(initialSecondaryValue!, { ignoreCase: true });
    await expect(newSecondaryDiagnosis).toHaveText(initialPrimaryValue!, { ignoreCase: true });
  });

  // Verify on Review and Sign page
  await test.step('Verify swapped diagnoses on Review and Sign page', async () => {
    await sideMenu.clickProgressNote();
    await progressNotePage.expectLoaded();

    // Verify both diagnoses are present
    await expect(page.getByText(initialSecondaryValue!, { exact: false })).toBeVisible();
    await expect(page.getByText(initialPrimaryValue!, { exact: false })).toBeVisible();
  });
});

test('Delete primary diagnosis', async () => {
  await sideMenu.clickAssessment();
  await assessmentPage.expectDiagnosisDropdown();
  const primaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis);
  const primaryDiagnosisValue = await primaryDiagnosis.textContent();

  // Get secondary diagnosis value before deletion
  const secondaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis);
  const secondaryDiagnosisValue = await secondaryDiagnosis.textContent();

  // Delete primary diagnosis
  await test.step('Delete primary diagnosis', async () => {
    await page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosisDeleteButton).first().click();
    await waitForChartDataDeletion(page);
    await waitForSaveChartDataResponse(page);

    // Verify secondary diagnosis is promoted to primary
    await expect(page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis)).toBeVisible();
    await expect(page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis)).not.toBeVisible();

    const newPrimaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis);
    const newPrimaryValue = await newPrimaryDiagnosis.textContent();
    expect(newPrimaryValue?.toLocaleLowerCase()).toEqual(secondaryDiagnosisValue?.toLocaleLowerCase());
  });

  // Verify on Review and Sign page
  await test.step('Verify promoted diagnosis on Review and Sign page, deleted diagnosis is not present', async () => {
    await sideMenu.clickProgressNote();
    await progressNotePage.expectLoaded();

    // Verify only one diagnosis is present
    await expect(page.getByText(secondaryDiagnosisValue!, { exact: false })).toBeVisible();
    await expect(page.getByText(primaryDiagnosisValue!, { exact: false })).not.toBeVisible(DEFAULT_TIMEOUT);
  });
});

test('Medical Decision Making functionality', async () => {
  await sideMenu.clickAssessment();
  await assessmentPage.expectDiagnosisDropdown();

  // Check default text
  await assessmentPage.expectMdmField({ text: '' });

  // Edit the text
  const newText = 'Updated medical decision making text';
  await assessmentPage.fillMdmField(newText);

  // Verify text is updated
  await assessmentPage.expectMdmField({ text: newText });

  // Navigate to Review and Sign to verify text is displayed
  await sideMenu.clickProgressNote();
  await progressNotePage.expectLoaded();
  await expect(page.getByText(newText)).toBeVisible();
});

test('Add E&M code', async () => {
  await sideMenu.clickAssessment();
  await assessmentPage.expectDiagnosisDropdown();

  // Select E&M code
  await test.step('Select E&M code', async () => {
    await assessmentPage.selectEmCode(E_M_CODE);
    await waitForSaveChartDataResponse(page, (json) => json.chartData.emCode?.code === E_M_CODE);
  });

  await test.step('Verify E&M code is added', async () => {
    const value = await page.getByTestId(dataTestIds.assessmentCard.emCodeDropdown).locator('input').inputValue();

    // Navigate to Review and Sign to verify code is displayed
    await sideMenu.clickProgressNote();
    await progressNotePage.expectLoaded();
    await expect(page.getByText(value)).toBeVisible();
  });

  await test.step('Verify missing card is not visible', async () => {
    await expect(page.getByTestId(dataTestIds.progressNotePage.missingCard)).not.toBeVisible();
  });
});

test('Add CPT codes', async () => {
  await sideMenu.clickAssessment();
  await assessmentPage.expectDiagnosisDropdown();

  // Select CPT code
  await test.step('Select CPT code', async () => {
    await assessmentPage.selectCptCode(CPT_CODE);
    await waitForSaveChartDataResponse(page, (json) =>
      Boolean(json.chartData.cptCodes?.some((x) => x.code === CPT_CODE))
    );
    await assessmentPage.selectCptCode(CPT_CODE_2);
    await waitForSaveChartDataResponse(page, (json) =>
      Boolean(json.chartData.cptCodes?.some((x) => x.code === CPT_CODE_2))
    );
  });

  await test.step('Verify CPT codes are added to progress note', async () => {
    const value = await page.getByTestId(dataTestIds.billingContainer.cptCodeEntry(CPT_CODE)).textContent();
    expect(value).toContain(CPT_CODE);

    const value2 = await page.getByTestId(dataTestIds.billingContainer.cptCodeEntry(CPT_CODE_2)).textContent();
    expect(value2).toContain(CPT_CODE_2);

    // Navigate to Review and Sign to verify code is displayed
    await sideMenu.clickProgressNote();
    await progressNotePage.expectLoaded();
    await expect(page.getByText(value!)).toBeVisible();
    await expect(page.getByText(value2!)).toBeVisible();
  });
});

test('Remove CPT codes', async () => {
  await sideMenu.clickAssessment();
  await assessmentPage.expectDiagnosisDropdown();

  const value = await page.getByTestId(dataTestIds.billingContainer.cptCodeEntry(CPT_CODE)).textContent();
  expect(value).toContain(CPT_CODE);

  const value2 = await page.getByTestId(dataTestIds.billingContainer.cptCodeEntry(CPT_CODE_2)).textContent();
  expect(value2).toContain(CPT_CODE_2);

  await page.getByTestId(dataTestIds.billingContainer.deleteCptCodeButton(CPT_CODE)).click();
  await waitForChartDataDeletion(page);

  await page.getByTestId(dataTestIds.billingContainer.deleteCptCodeButton(CPT_CODE_2)).click();
  await waitForChartDataDeletion(page);

  await sideMenu.clickProgressNote();
  await progressNotePage.expectLoaded();
  await expect(page.getByText(value!)).not.toBeVisible();
  await expect(page.getByText(value2!)).not.toBeVisible();
});
