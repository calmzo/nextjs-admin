"use client";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";

export default function ResetPasswordForm() {
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
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              忘记密码？
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              输入与账户关联的邮箱地址，我们会发送重置密码的链接。
            </p>
          </div>
          <div>
            <form>
              <div className="space-y-6">
                <div>
                  <Label>
                    邮箱 <span className="text-error-500">*</span>
                  </Label>
                  <Input type="email" placeholder="info@gmail.com" />
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    发送重置链接
                  </Button>
                </div>
              </div>
            </form>
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                想起密码了？{" "}
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  去登录
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
