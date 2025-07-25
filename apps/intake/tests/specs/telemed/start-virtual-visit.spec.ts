import { BrowserContext, expect, Page, test } from '@playwright/test';
import { chooseJson, CreateAppointmentResponse } from 'utils';
import { dataTestIds } from '../../../src/helpers/data-test-ids';
import { Locators } from '../../utils/locators';
import { FillingInfo } from '../../utils/telemed/FillingInfo';
import { PaperworkTelemed } from '../../utils/telemed/Paperwork';
import { TelemedVisitFlow } from '../../utils/telemed/TelemedVisitFlow';
import { UploadDocs } from '../../utils/UploadDocs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum PersonSex {
  Male = 'male',
  Female = 'female',
  Intersex = 'other',
}

const appointmentIds: string[] = [];

test.describe.configure({ mode: 'serial' });

test.describe('Start virtual visit with required information only', async () => {
  test.describe.configure({ mode: 'serial' });

  let context: BrowserContext;
  let page: Page;
  let fillingInfo: FillingInfo;
  let paperwork: PaperworkTelemed;
  let locators: Locators;
  let telemedFlow: TelemedVisitFlow;
  let slotId: string;

  let patientInfo: Awaited<ReturnType<FillingInfo['fillNewPatientInfo']>>;
  let dob: Awaited<ReturnType<FillingInfo['fillDOBless18']>> | undefined;

  async function clickContinueButton(awaitRedirect = true): Promise<void> {
    await locators.clickContinueButton(awaitRedirect);
  }

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    fillingInfo = new FillingInfo(page);
    paperwork = new PaperworkTelemed(page);
    locators = new Locators(page);
    telemedFlow = new TelemedVisitFlow(page);

    page.on('response', async (response) => {
      if (response.url().includes('/create-appointment/')) {
        const { resources } = chooseJson(await response.json()) as CreateAppointmentResponse;
        const appointment = resources?.appointment;
        const appointmentId = appointment?.id;
        const slotIdFromAppt = appointment?.slot?.[0]?.reference?.split('/')[1];
        if (appointmentId && !appointmentIds.includes(appointmentId)) {
          appointmentIds.push(appointmentId);
        }
        if (slotIdFromAppt) {
          slotId = slotIdFromAppt;
        }
      }
    });
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

  test('Should create new patient', async () => {
    await page.goto('/home');

    await telemedFlow.selectVisitAndContinue();

    await telemedFlow.selectTimeLocationAndContinue();
    await telemedFlow.selectDifferentFamilyMemberAndContinue();

    const patientData = await telemedFlow.fillNewPatientDataAndContinue();
    patientInfo = patientData;
    dob = {
      randomDay: patientData.dob.d,
      randomMonth: patientData.dob.m,
      randomYear: patientData.dob.y,
    };

    await clickContinueButton();

    await paperwork.fillAndCheckContactInformation(patientInfo);

    await clickContinueButton();
  });

  test('Should display new patient in patients list', async () => {
    expect(slotId).toBeDefined();
    await page.goto(`/book/${slotId}/patients`);

    const locator = page.getByText(`${patientInfo?.firstName} ${patientInfo?.lastName}`).locator('..');

    if (!dob?.randomMonth || !dob?.randomDay || !dob?.randomYear) {
      throw Error('Date units are not provided');
    }

    await expect(locator.getByText(`${patientInfo?.firstName} ${patientInfo?.lastName}`)).toBeVisible({
      timeout: 10000,
    });
    await expect(
      locator.getByText(
        `Birthday: ${fillingInfo.getStringDateByDateUnits(dob?.randomMonth, dob?.randomDay, dob?.randomYear)}`
      )
    ).toBeVisible();
  });

  // TODO: Fix the test, it should not be dependent on some resources that are pre-created at some moment
  // right now there is possible condition when another appointment is in the status that causes a "Return to call" button
  // to appear which has higher priority than "Continue Virtual Visit Request" button
  test.skip('Should display Continue visit and Cancel request buttons', async () => {
    await page.goto('/home');

    await expect(page.getByRole('button', { name: 'Continue Virtual Visit Request' })).toBeVisible({ timeout: 20000 });

    const cancelButton = page.getByRole('button', { name: 'Cancel this request' });
    await expect(cancelButton).toBeVisible();

    await cancelButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Why are you canceling?')).toBeVisible();
  });

  test('Should display correct patient info', async () => {
    await page.goto('/home');

    await page.getByTestId(dataTestIds.startVirtualVisitButton).click();

    await telemedFlow.selectTimeLocationAndContinue();

    const patientName = page.getByText(`${patientInfo?.firstName} ${patientInfo?.lastName}`);
    await expect(patientName).toBeVisible();
    await patientName.scrollIntoViewIfNeeded();
    await patientName.click();
    await clickContinueButton();

    await expect(page.getByText(`Confirm ${patientInfo?.firstName}'s date of birth`)).toBeVisible();

    if (!dob?.randomMonth || !dob?.randomDay || !dob?.randomYear) {
      throw Error('Date units are not provided');
    }

    await fillingInfo.fillWrongDOB(dob?.randomMonth, dob?.randomDay, dob?.randomYear);
    await clickContinueButton(false);

    const errorText = await page
      .getByText('Unfortunately, this patient record is not confirmed.') // modal, in that case try again option should be selected
      .or(page.getByText('Date may not be in the future')) // validation error directly on the form
      .textContent();

    // close if it is modal
    if (errorText?.includes('Unfortunately, this patient record is not confirmed')) {
      await page.getByRole('button', { name: 'Try again' }).click();
    }

    await fillingInfo.fillCorrectDOB(dob?.randomMonth, dob?.randomDay, dob?.randomYear);
    await clickContinueButton();

    await expect(page.getByText('About the patient')).toBeVisible({ timeout: 20000 });

    if (!dob?.randomMonth || !dob?.randomDay || !dob?.randomYear) {
      throw Error('Date units are not provided');
    }

    await expect(patientName).toBeVisible();
    await expect(
      page.getByText(
        `Birthday: ${fillingInfo.getStringDateByDateUnits(
          dob?.randomMonth,
          dob?.randomDay,
          dob?.randomYear,
          'MMMM dd, yyyy'
        )}`
      )
    ).toBeVisible();
    await expect(page.locator("input[type='text'][id='email']")).toHaveValue(patientInfo?.email || '');
  });

  test('Should fill in reason for visit', async () => {
    await page.goto('/home');
    await page.getByTestId(dataTestIds.startVirtualVisitButton).click();

    await telemedFlow.selectTimeLocationAndContinue();

    const patientName = page.getByText(`${patientInfo?.firstName} ${patientInfo?.lastName}`);
    await patientName.scrollIntoViewIfNeeded();
    await patientName.click();
    await clickContinueButton();

    await fillingInfo.fillCorrectDOB(dob?.randomMonth ?? '', dob?.randomDay ?? '', dob?.randomYear ?? '');
    await clickContinueButton();
    await expect(page.getByText('About the patient')).toBeVisible({ timeout: 20000 });

    await expect(page.locator('#reasonForVisit')).toHaveText('Select...');
    const Reason = await fillingInfo.fillTelemedReasonForVisit();
    await expect(page.locator('#reasonForVisit')).toHaveText(Reason);
  });

  test("Should fill in correct patient's DOB", async () => {
    await clickContinueButton();
    await clickContinueButton(false);

    // todo use another way to get appointment id
    // await getAppointmentIdFromCreateAppointmentRequest(page);

    await expect(page.getByText('Contact information')).toBeVisible({ timeout: 30000 });
  });

  test('Should fill in contact information', async () => {
    await paperwork.fillAndCheckContactInformation(patientInfo);
  });

  test('Should fill in patient details', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckPatientDetails();
  });

  test('Should fill in current medications as empty', async () => {
    await clickContinueButton();
    await clickContinueButton(); // skip page with no required fields

    await paperwork.fillAndCheckEmptyCurrentMedications();
  });

  test('Should fill in current allergies as empty', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckEmptyCurrentAllergies();
  });

  test('Should fill in medical history as empty', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckEmptyMedicalHistory();
  });

  test('Should fill in surgical history as empty', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckEmptySurgicalHistory();
  });

  test('Should fill in payment option as self-pay', async () => {
    await clickContinueButton();
    await clickContinueButton(); // skip page with no required fields

    await paperwork.fillAndCheckSelfPay();
  });
  test('Should fill in responsible party as self', async () => {
    await paperwork.fillAndCheckResponsiblePartyInfoAsSelf({
      firstName: patientInfo?.firstName,
      lastName: patientInfo?.lastName,
      email: patientInfo?.email,
      birthSex: patientInfo?.birthSex,
      thisEmailBelongsTo: patientInfo?.thisEmailBelongsTo,
      reasonForVisit: patientInfo?.reasonForVisit,
    });
    await clickContinueButton();
  });

  test('Skip optional Photo ID', async () => {
    await clickContinueButton();
  });

  test('Fill patient conditions', async () => {
    await clickContinueButton();
  });

  test('Should fill school or work note as none', async () => {
    await paperwork.fillAndCheckSchoolWorkNoteAsNone();
  });

  test('Should fill consent forms', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckConsentForms();
  });

  test('Should not invite anyone', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckNoInviteParticipant();
  });

  test('Should go to waiting room', async () => {
    await clickContinueButton();
    await page.getByRole('button', { name: 'Go to the Waiting Room' }).click();
    await expect(page.getByText('Please wait, call will start automatically.')).toBeVisible({ timeout: 30000 });
  });
});

test.describe('Start virtual visit with filling in paperwork', async () => {
  test.describe.configure({ mode: 'serial' });

  let context: BrowserContext;
  let page: Page;
  let fillingInfo: FillingInfo;
  let paperwork: PaperworkTelemed;
  let locators: Locators;
  let telemedFlow: TelemedVisitFlow;
  let slotId: string;

  let patientInfo: Awaited<ReturnType<FillingInfo['fillNewPatientInfo']>>;
  let dob: Awaited<ReturnType<FillingInfo['fillDOBless18']>> | undefined;

  async function clickContinueButton(awaitRedirect = true): Promise<void> {
    await locators.clickContinueButton(awaitRedirect);
  }

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    fillingInfo = new FillingInfo(page);
    paperwork = new PaperworkTelemed(page);
    locators = new Locators(page);
    telemedFlow = new TelemedVisitFlow(page);

    page.on('response', async (response) => {
      if (response.url().includes('/create-appointment/')) {
        const { resources } = chooseJson(await response.json()) as CreateAppointmentResponse;
        const appointment = resources?.appointment;
        const appointmentId = appointment?.id;
        const slotIdFromAppt = appointment?.slot?.[0]?.reference?.split('/')[1];
        if (appointmentId && !appointmentIds.includes(appointmentId)) {
          appointmentIds.push(appointmentId);
        }
        if (slotIdFromAppt) {
          slotId = slotIdFromAppt;
        }
      }
    });
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

  test('Should create new patient', async () => {
    await page.goto('/home');

    await telemedFlow.selectVisitAndContinue();
    await telemedFlow.selectTimeLocationAndContinue();
    await telemedFlow.selectDifferentFamilyMemberAndContinue();

    const patientData = await telemedFlow.fillNewPatientDataAndContinue();
    patientInfo = patientData;
    dob = {
      randomDay: patientData.dob.d,
      randomMonth: patientData.dob.m,
      randomYear: patientData.dob.y,
    };

    await clickContinueButton();
    await paperwork.fillAndCheckContactInformation(patientInfo);
    await clickContinueButton();
  });

  test('Should display new patient in patients list and display correct patient info', async () => {
    expect(slotId).toBeDefined();
    await page.goto(`/book/${slotId}/patients`);

    const locator = page.getByText(`${patientInfo?.firstName} ${patientInfo?.lastName}`).locator('..');

    if (!dob?.randomMonth || !dob?.randomDay || !dob?.randomYear) {
      throw Error('Date units are not provided');
    }

    await expect(locator.getByText(`${patientInfo?.firstName} ${patientInfo?.lastName}`)).toBeVisible({
      timeout: 10000,
    });

    await expect(
      locator.getByText(
        `Birthday: ${fillingInfo.getStringDateByDateUnits(dob?.randomMonth, dob?.randomDay, dob?.randomYear)}`
      )
    ).toBeVisible();

    const patientName = page.getByText(`${patientInfo?.firstName} ${patientInfo?.lastName}`);
    await patientName.scrollIntoViewIfNeeded();
    await patientName.click();
    await clickContinueButton();

    await fillingInfo.fillCorrectDOB(dob?.randomMonth ?? '', dob?.randomDay ?? '', dob?.randomYear ?? '');
    await clickContinueButton();

    await expect(page.getByText('About the patient')).toBeVisible({ timeout: 20000 });

    if (!dob?.randomMonth || !dob?.randomDay || !dob?.randomYear) {
      throw Error('Date units are not provided');
    }

    await expect(patientName).toBeVisible();
    await expect(
      page.getByText(
        `Birthday: ${fillingInfo.getStringDateByDateUnits(
          dob?.randomMonth,
          dob?.randomDay,
          dob?.randomYear,
          'MMMM dd, yyyy'
        )}`
      )
    ).toBeVisible();
    await expect(page.locator("input[type='text'][id='email']")).toHaveValue(patientInfo?.email || '');
  });

  test('Should fill in reason for visit', async () => {
    await page.goto('/home');
    await page.getByTestId(dataTestIds.startVirtualVisitButton).click();
    await telemedFlow.selectTimeLocationAndContinue();

    const patientName = page.getByText(`${patientInfo?.firstName} ${patientInfo?.lastName}`);
    await patientName.scrollIntoViewIfNeeded();
    await patientName.click();
    await clickContinueButton();

    await fillingInfo.fillCorrectDOB(dob?.randomMonth ?? '', dob?.randomDay ?? '', dob?.randomYear ?? '');
    await clickContinueButton();

    await expect(page.getByText('About the patient')).toBeVisible({ timeout: 20000 });

    await expect(page.locator('#reasonForVisit')).toHaveText('Select...');
    const Reason = await fillingInfo.fillTelemedReasonForVisit();
    await expect(page.locator('#reasonForVisit')).toHaveText(Reason);
  });

  test('Should land on first paperwork page when appointment created', async () => {
    await clickContinueButton();
    await clickContinueButton();

    // todo use another way to get appointment id
    // await getAppointmentIdFromCreateAppointmentRequest(page);
    expect(slotId).toBeDefined;
    await expect(page.getByText('Contact information')).toBeVisible({ timeout: 30000 });
  });

  test('Should fill in contact information', async () => {
    await paperwork.fillAndCheckContactInformation(patientInfo);
  });

  test('Should fill in patient details', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckPatientDetails();
  });

  test('Should fill in current medications', async () => {
    await clickContinueButton();
    await clickContinueButton(); // skip page with no required fields
    await paperwork.fillAndCheckFilledCurrentMedications();
  });

  test('Should fill in current allergies', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckFilledCurrentAllergies();
  });

  test('Should fill in medical history', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckFilledMedicalHistory();
  });

  test('Should fill in surgical history', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckFilledSurgicalHistory();
  });

  test('Should fill in additional questions', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckAdditionalQuestions();
  });

  test('Should fill in payment option as self-pay', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckSelfPay();
  });
  test('Should fill in responsible party as self', async () => {
    await paperwork.fillAndCheckResponsiblePartyInfoAsSelf({
      firstName: patientInfo?.firstName,
      lastName: patientInfo?.lastName,
      email: patientInfo?.email,
      birthSex: patientInfo?.birthSex,
      thisEmailBelongsTo: patientInfo?.thisEmailBelongsTo,
      reasonForVisit: patientInfo?.reasonForVisit,
    });
    await clickContinueButton();
  });
  test('Skip optional Photo ID', async () => {
    await clickContinueButton();
  });

  test('Fill patient conditions', async () => {
    await clickContinueButton();
  });

  test('Should fill school or work note as none', async () => {
    await paperwork.fillAndCheckSchoolWorkNoteAsNone();
  });

  test('Should fill consent forms', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckConsentForms();
  });

  test('Should not invite anyone', async () => {
    await clickContinueButton();

    await paperwork.fillAndCheckNoInviteParticipant();
  });

  test('Should go to waiting room', async () => {
    await clickContinueButton();
    await page.getByRole('button', { name: 'Go to the Waiting Room' }).click();
    await expect(page.getByText('Please wait, call will start automatically.')).toBeVisible({ timeout: 30000 });
  });

  test('Should check photo upload feature', async () => {
    const uploadPhotoButton = page.getByText('Upload photo');
    await expect(uploadPhotoButton).toBeVisible();
    await expect(page.getByText('No photo uploaded')).toBeVisible();
    await uploadPhotoButton.click();
    await expect(page.getByText('Patient condition photo')).toBeVisible();

    const uploadPhoto = new UploadDocs(page);
    await uploadPhoto.fillPatientCondition();
    await page.getByText('Save').click();

    await expect(page.getByText('Photo attached')).toBeVisible();
    await uploadPhotoButton.click();
    await expect(page.getByText('We already have this! It was saved on')).toBeVisible();
  });
});
