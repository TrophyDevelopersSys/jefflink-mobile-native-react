// ─── Core Authentication Error & Success Messages ───────────────────────────

export const AuthMessages = {
  // ── General Errors ─────────────────────────────────────────────────────────
  general: {
    unexpected:    "Something went wrong. Please try again.",
    serverError:   "We are experiencing technical issues. Please try again later.",
    networkOffline:"No internet connection. Check your network and try again.",
    timeout:       "The request took too long. Please try again.",
  },

  // ── Registration – Required Fields ─────────────────────────────────────────
  required: {
    name:                "Enter your full name.",
    email:               "Enter your email address.",
    password:            "Create a password.",
    passwordConfirm:     "Confirm your password.",
  },

  // ── Registration – Name Validation ─────────────────────────────────────────
  name: {
    tooShort:   "Your name must contain at least 2 characters.",
    tooLong:    "Your name cannot exceed 100 characters.",
    invalid:    "Enter a valid name.",
  },

  // ── Registration – Email Validation ────────────────────────────────────────
  email: {
    invalid:    "Enter a valid email address.",
    taken:      "An account with this email already exists.",
    notAllowed: "This email address cannot be used.",
  },

  // ── Registration – Phone Validation ────────────────────────────────────────
  phone: {
    invalid:  "Enter a valid phone number.",
    tooShort: "Phone number is too short.",
    tooLong:  "Phone number is too long.",
  },

  // ── Registration – Password Validation ─────────────────────────────────────
  password: {
    tooShort:       "Password must be at least 8 characters long.",
    tooLong:        "Password cannot exceed 72 characters.",
    weak:           "Choose a stronger password.",
    missingNumber:  "Password must include at least one number.",
    missingLetter:  "Password must include at least one letter.",
  },

  // ── Registration – Password Confirmation ───────────────────────────────────
  passwordConfirm: {
    mismatch: "Passwords do not match.",
  },

  // ── Login Errors ────────────────────────────────────────────────────────────
  login: {
    missingEmail:        "Enter your email address.",
    missingPassword:     "Enter your password.",
    invalidCredentials:  "Email or password is incorrect.",
  },

  // ── Account Status Errors ───────────────────────────────────────────────────
  account: {
    disabled:         "Your account has been disabled. Contact support.",
    suspended:        "Your account has been suspended.",
    locked:           "Too many login attempts. Try again later.",
    emailUnverified:  "Please verify your email before signing in.",
  },

  // ── Password Reset – Request ────────────────────────────────────────────────
  resetRequest: {
    missingEmail: "Enter your email to reset your password.",
    sent:         "If an account exists, password reset instructions have been sent.",
  },

  // ── Password Reset – Link ───────────────────────────────────────────────────
  resetLink: {
    invalid: "This reset link is invalid.",
    expired: "This reset link has expired. Request a new one.",
  },

  // ── Session Errors ──────────────────────────────────────────────────────────
  session: {
    expired:      "Your session has expired. Please sign in again.",
    unauthorized: "You are not authorized to perform this action.",
  },

  // ── Security / Rate Limiting ────────────────────────────────────────────────
  rateLimit: {
    login:        "Too many attempts. Please try again later.",
    registration: "Too many registration attempts. Try again later.",
  },

  // ── Dealer Account Errors ───────────────────────────────────────────────────
  dealer: {
    pending:              "Your dealer account is awaiting approval.",
    verificationRequired: "Dealer registration requires verification.",
    rejected:             "Your dealer application was not approved.",
  },

  // ── Success Messages ────────────────────────────────────────────────────────
  success: {
    registered:      "Your account has been created successfully.",
    loggedIn:        "Welcome back.",
    passwordUpdated: "Your password has been updated.",
    loggedOut:       "You have been signed out.",
  },
} as const;
