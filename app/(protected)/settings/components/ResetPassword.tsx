import { resetPasswordAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export default function ResetPassword(props: { searchParams: URLSearchParams }) {
  const success = props.searchParams.get("success");
  const error = props.searchParams.get("error");

  return (
    <form className="flex flex-col w-full max-w-md mt-6 gap-1 [&>input]:mb-2">
      <h1 className="text-xl font-bold mb-2">Reset password</h1>
      <input
        type="password"
        name="password"
        placeholder="New password"
        className="p-2 rounded dark:bg-gray-700 bg-gray-400"
        required
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        className="p-2 rounded dark:bg-gray-700 bg-gray-400"
        required
      />
      <SubmitButton formAction={resetPasswordAction} className="dark:bg-blue-800 bg-blue-400 p-1 rounded-xl">
        Reset password
      </SubmitButton>
      {error && (
        <p className="text-red-500">{error}</p>
      )}
      {success && (
        <p className="text-green-500">{success}</p>
      )}
    </form>
  );
}
