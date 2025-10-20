"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";

export default function OtpForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleChange = (value: string, index: number) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace") {
      const updatedOtp = [...otp];
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1].focus();
      }
      updatedOtp[index] = "";
      setOtp(updatedOtp);
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
    if (event.key === "ArrowRight" && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData("text").slice(0, 6).split("");
    const updatedOtp = [...otp];
    pasteData.forEach((char, idx) => {
      if (idx < updatedOtp.length) {
        updatedOtp[idx] = char;
      }
    });
    setOtp(updatedOtp);
    const filledIndex = pasteData.length - 1;
    if (inputsRef.current[filledIndex]) {
      inputsRef.current[filledIndex].focus();
    }
  };

  const handleSubmit = (e?: React.MouseEvent) => {
    e?.preventDefault();
    alert(`Submitted OTP: ${otp.join("")}`);
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          返回仪表板
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            两步验证
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            我们已向您的手机发送验证码，请在下方输入6位安全码。
          </p>
        </div>
        <div>
          <form>
            <div className="space-y-5">
              <div>
                <Label>请输入6位安全验证码</Label>
                <div className="flex gap-2 sm:gap-4" id="otp-container">
                  {otp.map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={(e) => handlePaste(e)}
                      ref={(el) => {
                        if (el) {
                          inputsRef.current[index] = el;
                        }
                      }}
                      className="dark:bg-dark-900 otp-input h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-center text-xl font-semibold text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  ))}
                </div>
              </div>
              <div>
                <Button className="w-full" size="sm" onClick={handleSubmit}>
                  验证我的账户
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              没收到验证码？{" "}
              <Link
                href="/"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                重新发送
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
