import {
  ApptTelemedTab,
  DispositionType,
  ExamCardsNames,
  ExamFieldsNames,
  ExamTabCardNames,
  PractitionerQualificationCode,
  RoleType,
  TelemedAppointmentVisitTabs,
} from 'utils';

export const dataTestIds = {
  closeIcon: 'CloseIcon',
  loadingSpinner: 'loading-spinner',
  deleteOutlinedIcon: 'DeleteOutlinedIcon',
  header: {
    userName: 'header-user-name',
  },
  cssHeader: {
    container: 'css-header-container',
    patientName: 'patient-name',
    appointmentStatus: 'appointment-status',
    switchStatusButton: (status: string) => `switch-status-to-${status}`,
  },
  dashboard: {
    appointmentsTable: (tab: 'prebooked' | 'in-office' | 'completed' | 'cancelled') => `appointments-table-${tab}`,
    addPatientButton: 'add-patient-button',
    intakeButton: `intake-button`,
    visitDetailsButton: `visit-details-button`,
    progressNoteButton: `progress-note-button`,
    dischargeButton: 'discharge-button',
    prebookedTab: 'prebooked-tab',
    locationSelect: 'location-select',
    datePickerTodayButton: 'date-picker-today-button',
    loadingIndicator: 'loading-indicator',
    tableRowWrapper: (appointmentId: string) => `appointments-table-row-${appointmentId}`,
    tableRowStatus: (appointmentId: string) => `appointments-table-row-status-${appointmentId}`,
    inOfficeTab: 'in-office-tab',
    groupSelect: 'group-select',
    dischargedTab: 'discharged-tab',
    cancelledTab: 'cancelled-tab',
    arrivedButton: 'arrived-button',
    appointmentStatus: 'appointment-status',
    chatButton: 'Chat-outlined-icon',
    patientName: 'patient-name',
  },
  appointmentPage: {
    patientFullName: 'patient-full-name',
  },
  addPatientPage: {
    locationHeader: 'location-header',
    mobilePhoneInput: 'mobile-phone-input',
    searchForPatientsButton: 'search-for-patients-button',
    addButton: 'add-button',
    cancelButton: 'cancel-button',
    patientNotFoundButton: 'patient-not-found-button',
    firstNameInput: 'first-name-input',
    lastNameInput: 'last-name-input',
    sexAtBirthDropdown: 'sex-at-birth-dropdown',
    reasonForVisitDropdown: 'reason-for-visit-dropdown',
    visitTypeDropdown: 'visit-type-dropdown',
    dateFormatValidationError: 'date-format-validation-error',
    prefillForButton: 'prefill-for-button',
    prefilledPatientName: 'prefilled-patient-name',
    prefilledPatientBirthday: 'prefilled-patient-birthday',
    prefilledPatientBirthSex: 'prefilled-patient-birth-sex',
    prefilledPatientEmail: 'prefilled-patient-email',
  },
  pagination: {
    paginationContainer: 'pagination-container',
  },
  patientInformationPage: {
    saveChangesButton: 'save-changes-button',
    addInsuranceButton: 'add-insurance-button',
    breadcrumb: 'breadcrumb',
  },
  patientHeader: {
    patientId: 'header-patient-id',
    patientName: 'header-patient-name',
    patientBirthSex: 'header-patient-birth-sex',
    patientBirthday: 'header-patient-birthday',
    patientAddress: 'header-patient-address',
    patientPhoneNumber: 'header-patient-phone-number',
    emergencyContact: 'header-patient-emergency-contact',
    closeButton: 'header-patient-close-button',
  },
  patientInformationContainer: {
    patientLastName: 'patient-last-name',
    patientFirstName: 'patient-first-name',
    patientBirthSex: 'patient-birth-sex',
    patientDateOfBirth: 'patient-date-of-birth',
    patientMiddleName: 'patient-middle-name',
    patientSuffix: 'patient-suffix',
    patientPreferredName: 'patient-preferred-name',
    patientPreferredPronouns: 'patient-preferred-pronouns',
  },
  contactInformationContainer: {
    streetAddress: 'street-address',
    addressLineOptional: 'address-line-optional',
    city: 'city',
    state: 'state',
    zip: 'zip',
    patientMobile: 'patient-mobile',
    patientEmail: 'patient-email',
  },
  patientDetailsContainer: {
    patientsEthnicity: 'patients-ethnicity',
    patientsRace: 'patients-race',
    sexualOrientation: 'sexual-orientation',
    genderIdentity: 'gender-identity',
    howDidYouHearAboutUs: 'how-did-you-hear-about-us',
    sendMarketingMessages: 'send-marketing-messages',
    preferredLanguage: 'preferred-language',
    commonWellConsent: 'common-well-consent',
    pleaseSpecifyField: 'please-specify-field',
  },
  primaryCarePhysicianContainer: {
    pcpCheckbox: 'pcp-checkbox',
    firstName: 'primaryCarePhysicianContainer-first-name',
    lastName: 'primaryCarePhysicianContainer-last-name',
    practiceName: 'primaryCarePhysicianContainer-practice-name',
    address: 'primaryCarePhysicianContainer-address',
    mobile: 'primaryCarePhysicianContainer-mobile',
  },
  insuranceContainer: {
    type: 'insurance-type',
    insuranceCarrier: 'insurance-carrier',
    memberId: 'insurance-member-id',
    showMoreButton: 'insurance-show-more-button',
    hideButton: 'insurance-hide-button',
    policyHoldersFirstName: 'insurance-policy-holders-first-name',
    policyHoldersLastName: 'insurance-policy-holders-last-name',
    policyHoldersMiddleName: 'insurance-policy-holders-middle-name',
    policyHoldersDateOfBirth: 'insurance-policy-holders-date-of-birth',
    policyHoldersSex: 'insurance-policy-holders-sex',
    policyHolderAddressCheckbox: 'insurance-policy-holder-address-checkbox',
    streetAddress: 'insurance-street-address',
    addressLine2: 'insurance-address-line2',
    city: 'insurance-city',
    state: 'insurance-state',
    zip: 'insurance-zip',
    relationship: 'insurance-relationship',
    additionalInformation: 'insurance-additional-information',
    removeButton: 'insurance-remove-button',
  },
  responsiblePartyInformationContainer: {
    id: 'responsible-party-information-container',
    relationshipDropdown: 'responsible-party-information-container-relationship-dropdown',
    firstName: 'responsible-party-information-container-first-name',
    lastName: 'responsible-party-information-container-last-name',
    dateOfBirthDropdown: 'responsible-party-information-container-date-of-birth-dropdown',
    birthSexDropdown: 'responsible-party-information-container-birth-sex-dropdown',
    phoneInput: 'responsible-party-information-container-phone-input',
    addressLine1: 'responsible-party-information-container-address',
    addressLine2: 'responsible-party-information-container-address-2',
    city: 'responsible-party-information-container-city',
    state: 'responsible-party-information-container-state',
    zip: 'responsible-party-information-container-zip',
  },

  userSettingsContainer: {
    releaseOfInfoDropdown: 'release-of-info-dropdown',
    RxHistoryConsentDropdown: 'Rx-history-consent-dropdown',
  },

  slots: {
    slot: 'slot',
  },
  dialog: {
    closeButton: 'dialog-close-button',
    cancelButton: 'dialog-cancel-button',
    proceedButton: 'dialog-proceed-button',
    title: 'dialog-title',
  },
  statesPage: {
    statesSearch: 'states-search',
    stateValue: 'state-value',
    operateInStateValue: 'operate-in-state-value',
    stateRow: (stateValue: string) => `state-row-${stateValue}`,
  },
  editState: {
    saveChangesButton: 'save-changes-button',
    cancelButton: 'cancel-button',
    operateInStateToggle: 'operate-in-state-toggle',
    stateNameTitle: 'state-name-title',
    stateNameField: 'state-name-field',
  },
  patients: {
    searchByLastNameField: 'search-last-name-field',
    searchByGivenNamesField: 'search-given-names-field',
    searchByDateOfBirthField: 'searchByDateOfBirthField',
    searchByPhoneField: 'search-phone-field',
    searchByAddressField: 'search-by-address',
    searchByEmailField: 'search-by-email-field',
    searchByStatusName: 'search-by-status-name',
    searchByLocationName: 'search-by-location-name',
    searchButton: 'search-button',
    resetFiltersButton: 'reset-filters-button',
    patientId: 'patient-id',
    patientName: 'patient-name',
    patientDateOfBirth: 'patient-date-of-birth',
    patientEmail: 'patient-email',
    patientPhoneNumber: 'patient-phone-number',
    patientAddress: 'patient-address',
    searchResultsRowPrefix: 'search-result-row-',
    searchResultRow: (patientId: string) => `${dataTestIds.patients.searchResultsRowPrefix}${patientId}`,
  },
  employeesPage: {
    table: 'employees-providers-content-table',
    providersTabButton: 'providers-tab-button',
    searchByName: 'search-by-name-field',
    providersStateFilter: 'providers-state-filter',
    informationForm: 'employee-information-form',
    firstName: 'employee-first-name',
    middleName: 'employee-middle-name',
    lastName: 'employee-last-name',
    birthDate: 'employee-birth-date',
    email: 'employee-email',
    phone: 'employee-phone',
    fax: 'employee-fax',
    addressLine1: 'employee-address-line-1',
    addressLine2: 'employee-address-line-2',
    addressCity: 'employee-address-city',
    addressState: 'employee-address-state',
    addressZip: 'employee-address-zip',
    rolesSection: 'employee-roles-section',
    roleRow: (employeeRole: RoleType): string => `employee-${employeeRole}-role`,
    providerDetailsCredentials: 'employees-provider-details-credentials',
    providerDetailsNPI: 'employees-provider-details-npi',
    submitButton: 'employees-form-submit-button',
    qualificationsTable: 'employee-qualifications-table',
    qualificationRow: (code: PractitionerQualificationCode): string => `employee-${code}-qualification`,
    deleteQualificationButton: 'employee-delete-qualification-button',
    addQualificationCard: 'add-new-qualification-card',
    newQualificationStateDropdown: 'new-qualification-state-dropdown',
    newQualificationTypeDropdown: 'new-qualification-type-dropdown',
    newQualificationNumberField: 'new-qualification-number-field',
    newQualificationExpDatePicker: 'new-qualification-expiration-date-picker',
    addQualificationButton: 'add-qualification-button',
    deactivateUserButton: 'deactivate-user-button',
    statusChip: 'employee-status-chip',
  },
  telemedEhrFlow: {
    trackingBoardLocationsSelect: 'telemed-tracking-board-location-select',
    trackingBoardLocationsSelectOption: (id: string) => `telemed-tracking-board-location-select-option-${id}`,
    telemedAppointmentsTabs: (tab: ApptTelemedTab) => `telemed-appointments-tabs-${tab}`,
    trackingBoardTableGroupRow: `telemed-tracking-board-table-group-row`,
    trackingBoardTableRow: (appointmentId: string) => `telemed-tracking-board-table-row-${appointmentId}`,
    myPatientsButton: 'telemed-my-patients-button',
    allPatientsButton: 'telemed-all-patients-button',
    trackingBoardTable: 'telemed-tracking-board-table',
    trackingBoardAssignButton: 'telemed-tracking-board-assign-appointment-button',
    trackingBoardViewButton: (appointmentId?: string) =>
      `telemed-tracking-board-view-appointment-button-${appointmentId}`,
    trackingBoardChatButton: (appointmentId?: string) =>
      `telemed-tracking-board-chat-appointment-button-${appointmentId}`,
    appointmentStatusChip: 'telemed-appointment-status-chip',
    footerButtonConnectToPatient: 'telemed-appointment-footer-button-connect-to-patient',
    footerButtonAssignMe: 'telemed-appointment-footer-button-assign-me',
    footerButtonUnassign: 'telemed-appointment-footer-button-unassign',
    appointmentChartFooter: 'telemed-chart-appointment-footer',
    hpiFieldListLoadingSkeleton: 'telemed-hpi-field-list-loading-skeleton',
    hpiMedicalConditionColumn: 'telemed-hpi-medical-condition-column',
    hpiMedicalConditionsList: 'telemed-hpi-medical-condition-list',
    hpiMedicalConditionPatientProvidedList: 'telemed-hpi-medical-condition-patient-provided-list',
    hpiMedicalConditionsInput: 'telemed-hpi-medical-condition-input',
    hpiMedicalConditionListItem: 'telemed-hpi-medical-condition-list-item',
    hpiCurrentMedicationsPatientProvidedList: 'telemed-hpi-current-medications-patient-provided-list',
    hpiCurrentMedicationsInput: 'telemed-hpi-current-medications-input',
    hpiCurrentMedicationsDoseInput: 'telemed-hpi-current-medications-dose-input',
    hpiCurrentMedicationsDateTimeInput: 'telemed-hpi-current-medications-date-time-input',
    hpiCurrentMedicationsAddButton: 'telemed-hpi-current-medications-add-button',
    hpiCurrentMedicationsScheduledList: 'telemed-hpi-current-medications-scheduled-list',
    hpiCurrentMedicationsAsNeededList: 'telemed-hpi-current-medications-as-needed-list',
    hpiCurrentMedicationsScheduledRadioButton: 'telemed-hpi-current-medications-scheduled-radio-button',
    hpiCurrentMedicationsAsNeededRadioButton: 'telemed-hpi-current-medications-as-needed-radio-button',
    hpiCurrentMedicationsList: (listType: 'scheduled' | 'as-needed') =>
      `telemed-hpi-current-medications-list-${listType}`,
    hpiCurrentMedicationsListItem: (listDataTestId: string) => `${listDataTestId}-item`,
    hpiCurrentMedicationsColumn: 'telemed-hpi-current-medications-column',
    hpiKnownAllergiesColumn: 'telemed-hpi-known-allergies-column',
    hpiKnownAllergiesList: 'telemed-hpi-known-allergies-list',
    hpiKnownAllergiesPatientProvidedList: 'telemed-hpi-known-allergies-patient-provided-list',
    hpiKnownAllergiesInput: 'telemed-hpi-known-allergies-input',
    hpiKnownAllergiesListItem: 'telemed-hpi-known-allergies-list-item',
    hpiSurgicalHistoryColumn: 'telemed-hpi-surgical-history-column',
    hpiSurgicalHistoryList: 'telemed-hpi-surgical-history-list',
    hpiSurgicalHistoryPatientProvidedList: 'telemed-hpi-surgical-history-patient-provided-list',
    hpiSurgicalHistoryInput: 'telemed-hpi-surgical-history-input',
    hpiSurgicalHistoryListItem: 'telemed-hpi-surgical-history-list-item',
    hpiAdditionalQuestions: (questionSymptom: string) => `telemed-additional-questions-${questionSymptom}`,
    hpiAdditionalQuestionsPatientProvided: (questionSymptom: string) =>
      `telemed-additional-questions-patient-provided-${questionSymptom}`,
    hpiSurgicalHistoryNote: 'telemed-hpi-surgical-history-note',
    hpiChiefComplaintNotes: 'telemed-chief-complaint-notes',
    hpiChiefComplaintRos: 'telemed-chief-complaint-ros',
    hpiPatientConditionPhotos: 'telemed-patient-condition-photos',
    hpiReasonForVisit: 'telemed-reason-for-visit',
    examTabField: (field: ExamFieldsNames | ExamCardsNames) => `telemed-exam-tab-field-${field}`,
    examTabCards: (card: ExamTabCardNames) => `telemed-exam-tab-cards-${card}`,
    examTabDistressCheckbox: 'exam-exam-tab-distress-checkbox',
    examTabDistressDropdown: 'telemed-exam-tab-distress-dropdown',
    examTabTenderCheckbox: 'telemed-exam-tab-tender-checkbox',
    examTabTenderDropdown: 'telemed-exam-tab-tender-dropdown',
    examTabRashesAbnormalSubsection: 'telemed-exam-tab-rashes-abnormal-subsection',
    examTabRashElementInSubsection: 'telemed-exam-tab-rash-element-in-subsection',
    examTabRashesDropdown: 'telemed-exam-tab-rashes-dropdown',
    examTabRashesCheckbox: 'telemed-exam-tab-rashes-checkbox',
    examTabRashesDescription: 'telemed-exam-tab-rashes-description',
    examTabRashesAddButton: 'telemed-exam-tab-rashes-add-button',
    examTabCardsComments: (card: ExamTabCardNames) => `telemed-exam-tab-cards-comment-${card}`,
    videoRoomContainer: 'telemed-video-room-container',
    endVideoCallButton: 'telemed-end-video-call-button',
    appointmentVisitTabs: (tab: TelemedAppointmentVisitTabs) => `telemed-appointment-visit-tab-${tab}`,
    patientInfoConfirmationCheckbox: 'telemed-patient-info-confirmation-checkbox',
    signButton: 'telemed-sign-button',
    planTabDispositionContainer: 'telemed-plan-tab-disposition-container',
    planTabDispositionToggleButton: (buttonName: DispositionType) =>
      `telemed-plan-tab-disposition-toggle-button-${buttonName}`,
    planTabDispositionFollowUpDropdown: 'telemed-plan-tab-disposition-follow-up-dropdown',
    planTabDispositionNote: 'telemed-plan-tab-disposition-note',
    planTabDispositionReasonForTransferDropdown: 'telemed-plan-tab-disposition-reason-for-transfer-dropdown',
    reviewTabMedicalConditionsContainer: 'telemed-review-tab-medical-conditions-container',
    reviewTabKnownAllergiesContainer: 'telemed-review-tab-known-allergies-container',
    reviewTabMedicationsContainer: 'telemed-review-tab-medications-container',
    reviewTabSurgicalHistoryContainer: 'telemed-review-tab-surgical-history-container',
    reviewTabAdditionalQuestion: (questionSymptom: string) =>
      `telemed-review-tab-additional-question-${questionSymptom}`,
    reviewTabChiefComplaintContainer: 'telemed-review-tab-chief-complaint-container',
    reviewTabRosContainer: 'telemed-review-tab-ros-container',
    reviewTabPatientInstructionsContainer: 'telemed-review-tab-patient-instructions-container',
    reviewTabExaminationsContainer: 'telemed-review-tab-examinations-container',
    cancelThisVisitButton: 'telemed-cancel-this-visit-button',
    inviteParticipant: 'telemed-invite-participant-button',
    editPatientButtonSideBar: 'telemed-edit-patient-button-side-bar',
    chatModalDescription: 'telemed-chat-modal-description',
    telemedNewOrExistingPatient: 'telemed-new-or-existing-patient',
  },
  sideMenu: {
    completeIntakeButton: 'complete-intake-button',
    sideMenuItem: (item: string): string => `menu-item-${item}`,
  },
  cssModal: {
    confirmationDialogue: 'confirmation-dialogue',
  },
  hospitalizationPage: {
    hospitalizationTitle: 'hospitalization-title',
  },
  progressNotePage: {
    reviewAndSignButton: 'review-and-sign-button',
    dischargeButton: 'discharge-button',
    sendFaxButton: 'send-fax-button',
    missingCard: 'missing-card',
    missingCardText: 'missing-card-text',
    primaryDiagnosisLink: 'primary-diagnosis-link',
    secondaryDiagnosisLink: 'secondary-diagnosis-link',
    medicalDecisionLink: 'medical-decision-link',
    emCodeLink: 'em-code-link',
    visitNoteCard: 'visit-note-card',
  },
  assessmentCard: {
    emCodeDropdown: 'em-code-dropdown',
    medicalDecisionField: 'medical-decision-field',
    cptCodeField: 'cpt-code-field',
  },
  diagnosisContainer: {
    diagnosisDropdown: 'diagnosis-dropdown',
    primaryDiagnosis: 'diagnosis-container-primary-diagnosis',
    secondaryDiagnosis: 'diagnosis-container-secondary-diagnosis',
    primaryDiagnosisDeleteButton: 'diagnosis-container-primary-diagnosis-delete-button',
    secondaryDiagnosisDeleteButton: 'diagnosis-container-secondary-diagnosis-delete-button',
    makePrimaryButton: 'diagnosis-container-make-primary-button',
  },
  billingContainer: {
    deleteButton: 'billing-container-delete-button',
    deleteCptCodeButton: (code: string) => `billing-container-delete-cpt-code-button-${code}`,
    cptCodeEntry: (code: string) => `cpt-code-entry-${code}`,
  },
  patientInfoPage: {
    patientInfoVerifiedCheckbox: 'patient-info-verified-checkbox',
  },
  inHouseMedicationsPage: {
    title: 'medications-title',
    orderButton: 'order-button',
    marTableRow: 'mar-table-row',
    marTableMedicationCell: 'mar-table-medication-cell',
    marTableStatusCell: 'mar-table-status-cell',
    marTableDoseCell: 'mar-table-dose-cell',
    marTableRouteCell: 'mar-table-route-cell',
    marTableInstructionsCell: 'mar-table-instructions-cell',
    medicationDetailsTab: 'medication-details-tab',
    pencilIconButton: 'EditOutlinedIcon',
  },
  orderMedicationPage: {
    inputField: (field: string): string => `input-${field}`,
    fillOrderToSaveButton: 'fill-order-to-save-button',
    backButton: 'back-button',
    confirmationDialogue: 'confirmation-dialogue',
  },
  visitDetailsPage: {
    cancelVisitButton: 'cancel-visit-button',
    cancelationReasonDropdown: 'cancelation-reason-dropdown',
    cancelVisitDialogue: 'cancel-visit-dialogue',
  },
  patientRecordPage: {
    seeAllPatientInfoButton: 'see-all-patient-info-button',
  },

  addInsuranceDialog: {
    id: 'add-insurance-dialog',
    type: 'add-insurance-dialog-type',
    insuranceCarrier: 'add-insurance-dialog-carrier',
    memberId: 'add-insurance-dialog-member-id',
    policyHoldersFirstName: 'add-insurance-dialog-policy-holders-first-name',
    policyHoldersLastName: 'add-insurance-dialog-policy-holders-last-name',
    policyHoldersMiddleName: 'add-insurance-dialog-policy-holders-middle-name',
    policyHoldersDateOfBirth: 'add-insurance-dialog-policy-holders-date-of-birth',
    policyHoldersSex: 'add-insurance-dialog-policy-holders-sex',
    streetAddress: 'add-insurance-dialog-street-address',
    addressLine2: 'add-insurance-dialog-address-line2',
    city: 'add-insurance-dialog-city',
    state: 'add-insurance-dialog-state',
    zip: 'add-insurance-dialog-zip',
    relationship: 'add-insurance-dialog-relationship',
    additionalInformation: 'add-insurance-dialog-additional-information',
    addInsuranceButton: 'add-insurance-dialog-add-insurance-button',
  },
};
