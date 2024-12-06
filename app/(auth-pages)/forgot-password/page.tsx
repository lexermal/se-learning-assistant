import { forgotPasswordAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export default async function ForgotPassword(props: {
  searchParams: Promise<{ success?: string, error?: string }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <form className="flex-1 flex flex-col w-full gap-1 min-w-64 max-w-96 mx-auto mt-32 bg-slate-700 p-4 rounded-lg">
        <div>
          <h1 className="text-3xl font-medium text-center">Reset Password</h1>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <input name="email" placeholder="you@example.com" required 
          className="p-2 rounded-lg focus:outline-none text-center"/>
          <SubmitButton formAction={forgotPasswordAction} className="bg-gray-800 rounded p-4">
            Reset Password
          </SubmitButton>
          {searchParams.error && (
            <p className="text-red-500">{searchParams.error}</p>
          )}
        </div>
      </form>
      {searchParams.success && (
        <p className="text-green-500">{searchParams.success}</p>
      )}
    </>
  );
}
