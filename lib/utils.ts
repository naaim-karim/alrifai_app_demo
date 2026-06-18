export const getFriendlyErrorMessage = (
  error: Error,
  t: (key: string) => string
) => {
  const errorMap: { [key: string]: string } = {
    "Signups not allowed for otp": t("errors.accountNotFound"),
    "Invalid credentials": t("errors.invalidCredentials"),
    "Rate limit exceeded": t("errors.rateLimitExceeded"),
    "Signups not allowed for this instance": t("errors.signupsDisabled"),
    'duplicate key value violates unique constraint "groups_group_name_key"':
      t("errors.groupNameTaken"),
  };

  return errorMap[error.message] || t("errors.generic");
};

export const capitalize = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getProfileRole = (role?: string) => {
  if (role === "teacher_assistant") return "teacher";
  return role || "student";
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
