export {
  DEFAULT_PHONE_COUNTRY,
  isValidPhone,
  normalizePhone,
  validatePhoneValue,
  type CountryCode,
} from "./phone";

export {
  validateCustomerInput,
  validateCustomerName,
  type CustomerInput,
} from "./customer";

export {
  getServicesMissingOptionsFromCatalog,
  isBookingCustomerDetailsValid,
  parseTimeTo24Hour,
  validateBookingCreateInput,
  validateBookingPatchFields,
  type BookingCreateInput,
  type BookingServiceInput,
  type BookingValidationOptions,
  type CatalogService,
} from "./booking";
