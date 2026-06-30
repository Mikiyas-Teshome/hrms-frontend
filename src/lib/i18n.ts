import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import addMembersEn from '../locales/en/addMembers.json';
import billingEn from '../locales/en/billing.json';
import companyEn from '../locales/en/company.json';
import companyProfileEn from '../locales/en/companyProfile.json';
import organizationProfileEn from '../locales/en/organizationProfile.json';
import companySuccessEn from '../locales/en/companySuccess.json';
import dashboardEn from '../locales/en/dashboard.json';
import deleteConfirmEn from '../locales/en/deleteConfirm.json';
import HomeEn from '../locales/en/Home.json';
import hrPoliciesEn from '../locales/en/hrPolicies.json';
import languageSwitcherEn from '../locales/en/languageSwitcher.json';
import manageTeamEn from '../locales/en/manageTeam.json';
import managerSignupEn from '../locales/en/managerSignup.json';
import onboardingEn from '../locales/en/onboarding.json';
import orgStructureEn from '../locales/en/orgStructure.json';
import payrollComponentsModalEn from '../locales/en/payrollComponentsModal.json';
import payrollCycleModalEn from '../locales/en/payrollCycleModal.json';
import payrollOvertimeModalEn from '../locales/en/payrollOvertimeModal.json';
import payrollOfficerFinishEn from '../locales/en/payrollOfficerFinish.json';
import payrollOfficerStructureEn from '../locales/en/payrollOfficerStructure.json';
import payrollStructureEn from '../locales/en/payrollStructure.json';
import pricingEn from '../locales/en/pricing.json';
import reviewSetupEn from '../locales/en/reviewSetup.json';
import teamSetupEn from '../locales/en/teamSetup.json';
import teamViewEn from '../locales/en/teamView.json';
import verificationEn from '../locales/en/verification.json';
import staffSignupEn from '../locales/en/staffSignup.json';
import loginEn from '../locales/en/login.json';
import forgotPasswordEn from '../locales/en/forgotPassword.json';
import employeesEn from '../locales/en/employees.json';
import rolesEn from '../locales/en/roles.json';
import logoutConfirmEn from '../locales/en/logoutConfirm.json';
import contractsEn from '../locales/en/contracts.json';
import setupSuccessEn from '../locales/en/setupSuccess.json';
import employeeSuccessEn from '../locales/en/employeeSuccess.json';
import entitlementEn from '../locales/en/entitlement.json';
import contractsInsurancesEn from '../locales/en/contractsInsurances.json';
import settingsEn from '../locales/en/settings.json';
import documentEn from '../locales/en/document.json';
import payrollEn from '../locales/en/payroll.json';
import termsEn from '../locales/en/terms.json';
import privacyEn from '../locales/en/privacy.json';
import landingEn from '../locales/en/landing.json';


import addMembersAr from '../locales/ar/addMembers.json';
import billingAr from '../locales/ar/billing.json';
import companyAr from '../locales/ar/company.json';
import companyProfileAr from '../locales/ar/companyProfile.json';
import organizationProfileAr from '../locales/ar/organizationProfile.json';
import companySuccessAr from '../locales/ar/companySuccess.json';
import dashboardAr from '../locales/ar/dashboard.json';
import deleteConfirmAr from '../locales/ar/deleteConfirm.json';
import HomeAr from '../locales/ar/Home.json';
import hrPoliciesAr from '../locales/ar/hrPolicies.json';
import languageSwitcherAr from '../locales/ar/languageSwitcher.json';
import manageTeamAr from '../locales/ar/manageTeam.json';
import managerSignupAr from '../locales/ar/managerSignup.json';
import onboardingAr from '../locales/ar/onboarding.json';
import orgStructureAr from '../locales/ar/orgStructure.json';
import payrollComponentsModalAr from '../locales/ar/payrollComponentsModal.json';
import payrollCycleModalAr from '../locales/ar/payrollCycleModal.json';
import payrollOvertimeModalAr from '../locales/ar/payrollOvertimeModal.json';
import payrollOfficerFinishAr from '../locales/ar/payrollOfficerFinish.json';
import payrollOfficerStructureAr from '../locales/ar/payrollOfficerStructure.json';
import payrollStructureAr from '../locales/ar/payrollStructure.json';
import pricingAr from '../locales/ar/pricing.json';
import reviewSetupAr from '../locales/ar/reviewSetup.json';
import teamSetupAr from '../locales/ar/teamSetup.json';
import teamViewAr from '../locales/ar/teamView.json';
import verificationAr from '../locales/ar/verification.json';
import staffSignupAr from '../locales/ar/staffSignup.json';
import loginAr from '../locales/ar/login.json';
import forgotPasswordAr from '../locales/ar/forgotPassword.json';
import employeesAr from '../locales/ar/employees.json';
import rolesAr from '../locales/ar/roles.json';
import logoutConfirmAr from '../locales/ar/logoutConfirm.json';
import contractsAr from '../locales/ar/contracts.json';
import setupSuccessAr from '../locales/ar/setupSuccess.json';
import employeeSuccessAr from '../locales/ar/employeeSuccess.json';
import entitlementAr from '../locales/ar/entitlement.json';
import contractsInsurancesAr from '../locales/ar/contractsInsurances.json';
import settingsAr from '../locales/ar/settings.json';
import documentAr from '../locales/ar/document.json';
import payrollAr from '../locales/ar/payroll.json';
import termsAr from '../locales/ar/terms.json';
import privacyAr from '../locales/ar/privacy.json';
import landingAr from '../locales/ar/landing.json';


const resources = {
  en: {
    addMembers: addMembersEn,
    billing: billingEn,
    company: companyEn,
    companyProfile: companyProfileEn,
    organizationProfile: organizationProfileEn,
    companySuccess: companySuccessEn,
    dashboard: dashboardEn,
    deleteConfirm: deleteConfirmEn,
    Home: HomeEn,
    hrPolicies: hrPoliciesEn,
    languageSwitcher: languageSwitcherEn,
    manageTeam: manageTeamEn,
    managerSignup: managerSignupEn,
    onboarding: onboardingEn,
    orgStructure: orgStructureEn,
    payrollComponentsModal: payrollComponentsModalEn,
    payrollCycleModal: payrollCycleModalEn,
    payrollOvertimeModal: payrollOvertimeModalEn,
    payrollOfficerFinish: payrollOfficerFinishEn,
    payrollOfficerStructure: payrollOfficerStructureEn,
    payrollStructure: payrollStructureEn,
    pricing: pricingEn,
    reviewSetup: reviewSetupEn,
    teamSetup: teamSetupEn,
    teamView: teamViewEn,
    verification: verificationEn,
    staffSignup: staffSignupEn,
    login: loginEn,
    forgotPassword: forgotPasswordEn,
    employees: employeesEn,
    roles: rolesEn,
    logoutConfirm: logoutConfirmEn,
    contracts: contractsEn,
    setupSuccess: setupSuccessEn,
    employeeSuccess: employeeSuccessEn,
    entitlement: entitlementEn,
    contractsInsurances: contractsInsurancesEn,
    settings: settingsEn,
    document: documentEn,
    payroll: payrollEn,
    terms: termsEn,
    privacy: privacyEn,
    landing: landingEn,
  },
  ar: {
    addMembers: addMembersAr,
    billing: billingAr,
    company: companyAr,
    companyProfile: companyProfileAr,
    organizationProfile: organizationProfileAr,
    companySuccess: companySuccessAr,
    dashboard: dashboardAr,
    deleteConfirm: deleteConfirmAr,
    Home: HomeAr,
    hrPolicies: hrPoliciesAr,
    languageSwitcher: languageSwitcherAr,
    manageTeam: manageTeamAr,
    managerSignup: managerSignupAr,
    onboarding: onboardingAr,
    orgStructure: orgStructureAr,
    payrollComponentsModal: payrollComponentsModalAr,
    payrollCycleModal: payrollCycleModalAr,
    payrollOvertimeModal: payrollOvertimeModalAr,
    payrollOfficerFinish: payrollOfficerFinishAr,
    payrollOfficerStructure: payrollOfficerStructureAr,
    payrollStructure: payrollStructureAr,
    pricing: pricingAr,
    reviewSetup: reviewSetupAr,
    teamSetup: teamSetupAr,
    teamView: teamViewAr,
    verification: verificationAr,
    staffSignup: staffSignupAr,
    login: loginAr,
    forgotPassword: forgotPasswordAr,
    employees: employeesAr,
    roles: rolesAr,
    logoutConfirm: logoutConfirmAr,
    contracts: contractsAr,
    setupSuccess: setupSuccessAr,
    employeeSuccess: employeeSuccessAr,
    entitlement: entitlementAr,
    contractsInsurances: contractsInsurancesAr,
    settings: settingsAr,
    document: documentAr,
    payroll: payrollAr,
    terms: termsAr,
    privacy: privacyAr,
    landing: landingAr,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
      lookupCookie: 'hrms_language',
    },
  });

export const changeLanguage = (lang: 'en' | 'ar') => {
  i18n.changeLanguage(lang);
  document.cookie = `hrms_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
};

export default i18n;
