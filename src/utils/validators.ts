export const validators = {
  email(value: string) {
    return /\S+@\S+\.\S+/.test(value);
  },
  password(value: string) {
    return value.length >= 8;
  }
};
