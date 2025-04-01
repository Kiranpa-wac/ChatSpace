import React from "react";
import { Chrome } from "lucide-react";
import useSignIn from "../hooks/useSignIn";

const LoginPage = () => {
  const { signIn, error } = useSignIn();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Sign in to Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Please sign in with Google
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={signIn}
              className="w-full flex justify-center py-3 px-4 border border-transparent 
                         rounded-md shadow-sm text-lg font-medium text-white 
                         bg-red-600 hover:bg-red-700 focus:outline-none 
                         focus:ring-2 focus:ring-offset-2 focus:ring-red-500 
                         transition duration-300 ease-in-out transform hover:scale-105"
            >
              <Chrome className="mr-3 h-6 w-6" />
              Sign In With Google
            </button>
            {error && (
              <p className="mt-4 text-red-600 text-sm text-center">
                {error.message}
              </p>
            )}
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?
              <a
                href="#"
                className="font-medium text-red-600 hover:text-red-500 ml-1"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          © 2024 Your Company. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
