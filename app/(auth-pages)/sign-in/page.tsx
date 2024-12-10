"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { signInAction, signUpAction } from "@/app/actions";
import { useEventEmitter } from "@/utils/providers/EventEmitterContext";

export default function Login(props: { searchParams: Promise<{ error?: string, register?: string, success?: string }> }) {
  const [actionIsLogin, setActionIsLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { emit } = useEventEmitter();

  useEffect(() => {
    props.searchParams.then((searchParams) => {
      setError(searchParams.error || null);
      setActionIsLogin(!searchParams.register);
      setSuccessMessage(searchParams.success || null);
    });
  }, []);

  const onSubmit = (formData: FormData) => {
    if (actionIsLogin) {
      setTimeout(() => emit("user:signed-in"), 1000);
      return signInAction(formData);
    }
    return signUpAction(formData);
  }

  return (
    <form className="max-w-36 items-start flex-1 flex flex-col min-w-80 mx-auto mt-48 bg-gray-300 dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl">
      <div className="flex flex-row dark:border-b dark:border-gray-600 w-full bg-gray-400 dark:bg-gray-700 cursor-pointer text-center">
        <h1 onClick={() => setActionIsLogin(true)}
          className={"border-r w-1/2 h-16 border-gray-500 leading-[4rem] " + (actionIsLogin ? "text-3xl font-bold bg-gray-400 dark:bg-gray-600" : "text-2xl")}>
          Login
        </h1>
        <h1 onClick={() => setActionIsLogin(false)}
          className={"text-center h-16 w-1/2 leading-[4rem] " + (!actionIsLogin ? "text-3xl font-bold bg-gray-400 dark:bg-gray-600" : "text-2xl")}>
          Register
        </h1>
      </div>
      <div className="flex flex-col gap-2 w-full p-5">
        <input type="email" name="email" placeholder="Your email"
          className="p-1 rounded bg-gray-100 dark:bg-gray-700 focus:outline-none"
          required />

        <input
          type="password"
          name="password"
          placeholder="Your password"
          className="p-1 rounded bg-gray-100 dark:bg-gray-700 focus:outline-none"
          required />
        <SubmitButton className="rounded-lg font-bold text-xl p-3 bg-blue-500 hover:bg-blue-400"
          pendingText="Loading..." formAction={onSubmit}>
          {actionIsLogin ? "Login" : "Register"}
        </SubmitButton>
        {successMessage && <p className="text-green-500 mt-3">{successMessage}</p>}
        {error && <div className="mt-3 flex flex-col text-center">
          <p className="text-red-500">{error}</p>
          <Link className="text-xs" href="/forgot-password">
            Forgot Password?
          </Link>
        </div>}
      </div>
    </form>
  );
}
