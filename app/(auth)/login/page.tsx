"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DarkModeContext } from "../../layout";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  const handleNumberClick = (number: number) => {
    if (password.length < 4) {
      setPassword((prev) => prev + number);
    }
  };

  const handleDelete = () => {
    setPassword((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (password === "7777") {
      router.push("/dashboard");
    } else {
      setError("Invalid Password");
      setPassword("");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "dark bg-black" : "bg-white"}`}>
      <div className="mx-auto max-w-screen-sm px-4 py-12">
        {/* Header */}
        <header className="mb-16 flex items-center justify-between">
          <div className={`text-xs font-light tracking-widest ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            DEAL SPLIT TRACKER
          </div>
          <button
            onClick={toggleDarkMode}
            className={`h-6 w-6 rounded-full ${isDarkMode ? "bg-white" : "bg-black"}`}
            aria-label="Toggle dark mode"
          />
        </header>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className={`text-2xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>Enter Password</h1>
          </div>

          {/* Password Display */}
          <div className="flex justify-center space-x-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`h-4 w-4 rounded-full ${
                  password.length > index
                    ? isDarkMode
                      ? "bg-white"
                      : "bg-black"
                    : isDarkMode
                      ? "bg-gray-800"
                      : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && <div className="text-center text-sm text-red-500">{error}</div>}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <button
                key={number}
                onClick={() => handleNumberClick(number)}
                className={`aspect-square rounded-full text-2xl font-light ${
                  isDarkMode ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-100 text-black hover:bg-gray-200"
                } transition-colors`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className={`aspect-square rounded-full text-sm font-light ${
                isDarkMode ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-100 text-black hover:bg-gray-200"
              } transition-colors`}
            >
              Delete
            </button>
            <button
              onClick={() => handleNumberClick(0)}
              className={`aspect-square rounded-full text-2xl font-light ${
                isDarkMode ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-100 text-black hover:bg-gray-200"
              } transition-colors`}
            >
              0
            </button>
            <button
              onClick={handleSubmit}
              className={`aspect-square rounded-full text-sm font-light ${
                isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
              } transition-colors`}
            >
              Enter
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}