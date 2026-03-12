import { AuthMessages } from "../constants/authMessages";

export const validators = {
  email(value: string): true | string {
    return /\S+@\S+\.\S+/.test(value) || AuthMessages.email.invalid;
  },
  password(value: string): true | string {
    if (value.length < 8) return AuthMessages.password.tooShort;
    if (value.length > 72) return AuthMessages.password.tooLong;
    if (!/\d/.test(value)) return AuthMessages.password.missingNumber;
    if (!/[a-zA-Z]/.test(value)) return AuthMessages.password.missingLetter;
    return true;
  },
  fullName(value: string): true | string {
    const trimmed = value.trim();
    if (trimmed.length < 2) return AuthMessages.name.tooShort;
    if (trimmed.length > 100) return AuthMessages.name.tooLong;
    if (!/^[\p{L}\s''\-]+$/u.test(trimmed)) return AuthMessages.name.invalid;
    return true;
  },
};
