export function getManualReviewPlaceholder(language: string) {
  switch (language) {
    case "python":
      return `Paste Python code here, for example:

def validate_email(email):
    print("validating", email)
    if not email:
        return False
    return "@" in email`;
    case "cpp":
      return `Paste C++ code here, for example:

int divide(int a, int b) {
    return a / b;
}`;
    case "react":
    case "jsx":
    case "tsx":
      return `Paste React code here, for example:

export function Profile({ user }) {
  console.log(user);
  return <div>{user.name}</div>;
}`;
    default:
      return "Paste plain code, patch, or unified diff here";
  }
}

export function getManualReviewExample(language: string) {
  switch (language) {
    case "python":
      return {
        title: "Python Email Validator Review",
        changedFiles: "app/validators.py, tests/test_validators.py",
        repoContext:
          "Validation helpers are used on incoming API payloads before persistence. Invalid values should be rejected early and debug prints should not exist in production.",
        code: `def validate_email(email):
    print("validating email", email)
    if not email:
        return False
    if "@" not in email:
        return False
    return True`
      };
    case "cpp":
      return {
        title: "C++ Division Utility Review",
        changedFiles: "src/math.cpp, tests/math_test.cpp",
        repoContext:
          "This helper is used in request processing. Division-by-zero and invalid input handling should be explicit and safe.",
        code: `#include <iostream>

int divide(int a, int b) {
    std::cout << "dividing " << a << " by " << b << std::endl;
    return a / b;
}`
      };
    case "react":
    case "jsx":
    case "tsx":
      return {
        title: "React Profile Component Review",
        changedFiles: "src/components/Profile.tsx, src/pages/account.tsx",
        repoContext:
          "Profile data may come from asynchronous API responses. Components should handle missing data safely and avoid noisy console logging in production.",
        code: `export function Profile({ user }) {
  console.log("profile", user);

  if (user.isAdmin) {
    return <div>Admin: {user.name}</div>;
  }

  return <div>{user.name.toUpperCase()}</div>;
}`
      };
    default:
      return {
        title: "Manual Code Review",
        changedFiles: "",
        repoContext: "",
        code: ""
      };
  }
}
