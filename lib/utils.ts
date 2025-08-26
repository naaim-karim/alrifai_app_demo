export const getFriendlyErrorMessage = (error: Error) => {
  const errorMap: { [key: string]: string } = {
    "Signups not allowed for otp":
      "We couldn't find an account with that email address.",
    "Invalid credentials": "Please check your email address and try again.",
    "Rate limit exceeded":
      "Too many attempts. Please wait a moment and try again.",
    "Signups not allowed for this instance":
      "Sign-ups are currently disabled. Please contact support or try again later.",
  };

  return errorMap[error.message] || "Something went wrong. Please try again.";
};

export const capitalize = (str: string) => {
  const result = str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1) + " ");
  return result;
};

export const getAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};