import { resetPasswordAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export default function ResetPassword(props: { searchParams: URLSearchParams }) {
  const success = props.searchParams.get("success");
  const error = props.searchParams.get("error");

  return (
    <form className="flex flex-col w-full max-w-md mt-6 gap-1 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">Reset password</h1>
      <input
        type="password"
        name="password"
        placeholder="New password"
        className="p-2 rounded bg-gray-700"
        required
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        className="p-2 rounded bg-gray-700"
        required
      />
      <SubmitButton formAction={resetPasswordAction} className="bg-gray-800 p-1 rounded-xl">
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
