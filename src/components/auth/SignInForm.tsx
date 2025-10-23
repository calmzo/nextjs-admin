"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { useAuthStore } from "@/store/authStore";
import AuthAPI from "@/api/auth.api";
import type { LoginFormData } from "@/types/api";

export default function SignInForm() {
  // ==================== 状态管理 ====================
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [captchaImage, setCaptchaImage] = useState<string>("");
  const [captchaKey, setCaptchaKey] = useState<string>("");
  const [focusedField, setFocusedField] = useState<string>("");
  const [captchaLoading, setCaptchaLoading] = useState<boolean>(false);
  const [isCapsLock, setIsCapsLock] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ==================== Hooks ====================
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, touchedFields },
    setValue,
    watch,
    trigger,
    getValues
  } = useForm<LoginFormData>({
    defaultValues: {
      username: "admin",
      password: "123456",
      captchaCode: "",
      rememberMe: false
    },
    mode: "onChange" // 输入时验证
  });

  // ==================== 表单验证逻辑 ====================

  // 自定义验证逻辑：用户名和密码必须有效，验证码可以为空（动态获取）
  const isFormValid = () => {
    const username = watch("username");
    const password = watch("password");
    const captchaCode = watch("captchaCode");
    
    // 用户名和密码必须有效
    const usernameValid = username && username.trim().length >= 3;
    const passwordValid = password && password.trim().length >= 6;
    
    // 验证码可以为空（如果还没有获取到验证码）
    const captchaValid = !captchaImage || (captchaCode && captchaCode.trim().length >= 4);
    
    return usernameValid && passwordValid && captchaValid;
  };

  // 监听记住我状态
  const rememberMe = watch("rememberMe");

  // ==================== 用户交互处理 ====================

  // 处理输入框焦点事件
  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    // 用户开始交互，不再是首次加载
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  };

  const handleFieldBlur = async (fieldName: keyof LoginFormData) => {
    setFocusedField("");
    // 用户开始交互，不再是首次加载
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
    // 触发实时验证
    await trigger(fieldName);
  };

  // 处理用户交互，标记不再是首次加载
  const handleUserInteraction = () => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  };

  // 检查CapsLock状态
  const checkCapsLock = (event: React.KeyboardEvent) => {
    if (event.getModifierState) {
      setIsCapsLock(event.getModifierState("CapsLock"));
    }
  };

  // 处理Enter键提交
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      // 让表单自然提交，避免重复调用
      // 表单的 onSubmit={handleSubmit(onSubmit)} 会自动处理
    }
  };

  // 获取字段提示信息
  const getFieldHint = (fieldName: string) => {
    const hints: Record<string, string> = {
      username: "请输入用户名",
      password: "请输入密码",
      captchaCode: "请输入验证码"
    };
    return hints[fieldName] || "";
  };

  // 检查字段是否应该显示错误
  const shouldShowError = (fieldName: string) => {
    const fieldError = errors[fieldName as keyof typeof errors];
    const fieldValue = watch(fieldName as keyof LoginFormData);
    
    // 如果是首次加载，不显示任何错误
    if (isInitialLoad) {
      return false;
    }
    
    // 使用 onChange 模式，只要有错误就显示
    // 对于用户名字段，如果为空也显示错误样式
    if (fieldName === "username") {
      return !!fieldError || (!fieldValue || (typeof fieldValue === "string" && fieldValue.trim() === ""));
    }
    
    return !!fieldError;
  };

  // ==================== API调用处理 ====================

  // 获取验证码
  const getCaptcha = async () => {
    try {
      setCaptchaLoading(true);
      const result = await AuthAPI.getCaptcha();
      setCaptchaImage(result.captchaBase64);
      setCaptchaKey(result.captchaKey);
    } catch (error: any) {
      console.error("获取验证码失败:", error);
      
      // 根据错误类型显示不同的提示
      let errorMessage = "获取验证码失败，请重试";
      
      if (error?.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status >= 500) {
        errorMessage = "服务器错误，请稍后重试";
      }
      
      toast.error(errorMessage);
    } finally {
      setCaptchaLoading(false);
    }
  };

  // ==================== 生命周期处理 ====================

  // 组件挂载时获取验证码
  useEffect(() => {
    getCaptcha();
  }, []);

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // ==================== 路由处理 ====================

  // 解析重定向目标
  const resolveRedirectTarget = (searchParams: URLSearchParams): string => {
    // 默认跳转路径
    const defaultPath = "/";
    
    // 获取原始重定向路径
    const rawRedirect = searchParams.get("redirect") || defaultPath;
    
    try {
      // 验证路径是否安全（防止开放重定向攻击）
      const url = new URL(rawRedirect, window.location.origin);
      if (url.origin !== window.location.origin) {
        return defaultPath;
      }
      return url.pathname + url.search;
    } catch {
      // 异常处理：返回安全路径
      return defaultPath;
    }
  };

  // ==================== 错误处理 ====================

  // 处理登录错误
  const handleLoginError = (error: any) => {
    // 根据错误类型显示不同的提示信息
    let errorMessage = "登录失败，请重试";
    
    // 处理新的业务错误格式（从request拦截器返回的）
    if (error?.code === "A0214") {
      errorMessage = error.msg || "验证码错误，请重新输入";
      // 验证码错误时，自动刷新验证码（避免重复调用）
      if (!captchaLoading) {
        getCaptcha();
      }
    } else if (error?.response?.data?.msg) {
      errorMessage = error.response.data.msg;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.code === "A0001") {
      errorMessage = "Token已过期，请重新登录";
    } else if (error?.code === "A0002") {
      errorMessage = "会话已过期，请重新登录";
    } else if (error?.response?.status === 401 || error?.status === 401) {
      errorMessage = "用户名或密码错误";
    } else if (error?.response?.status === 403 || error?.status === 403) {
      errorMessage = "访问被拒绝，权限不足";
    } else if (error?.response?.status === 404 || error?.status === 404) {
      errorMessage = "请求的资源不存在";
    } else if (error?.response?.status === 429 || error?.status === 429) {
      errorMessage = "登录尝试次数过多，请稍后再试";
    } else if ((error?.response?.status >= 500) || (error?.status >= 500)) {
      errorMessage = "服务器错误，请稍后重试";
    }
    // 统一使用toast显示错误信息
    toast.error(errorMessage);
  };


  // 处理刷新验证码
  const handleRefreshCaptcha = () => {
    getCaptcha();
    setValue("captchaCode", "");
  };

  // ==================== 表单提交处理 ====================

  // 表单提交处理
  const onSubmit = async (data: LoginFormData) => {
    // 防止重复提交
    if (loading) {
      return;
    }
    try {
      await login({
        username: data.username,
        password: data.password,
        captchaCode: data.captchaCode,
        captchaKey: captchaKey,
        rememberMe: data.rememberMe
      });
      
      toast.success("登录成功！");
      
      // 解析并跳转目标地址
      const redirect = resolveRedirectTarget(new URLSearchParams(window.location.search));
      router.push(redirect);
    } catch (error: any) {
      handleLoginError(error);
    }
  };

  // ==================== 渲染组件 ====================

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                    fill="#EB4335"
                  />
                </svg>
                Sign in with Google
              </button>
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <svg
                  width="21"
                  className="fill-current"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
                </svg>
                Sign in with X
              </button>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
              <div className="space-y-6">
                <div>
                  <Label>
                    用户名 <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    placeholder={focusedField === "username" ? "请输入用户名" : "请输入用户名"}
                    {...register("username", {
                      required: "用户名不能为空",
                      minLength: {
                        value: 2,
                        message: "用户名至少2个字符"
                      },
                      maxLength: {
                        value: 20,
                        message: "用户名不能超过20个字符"
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
                        message: "用户名只能包含字母、数字、下划线和中文"
                      }
                    })}
                    value={watch("username")}
                    error={shouldShowError("username")}
                    className={`${
                      focusedField === "username" ? "ring-2 ring-blue-500 ring-opacity-50" : ""
                    }`}
                    onFocus={() => handleFieldFocus("username")}
                    onBlur={() => handleFieldBlur("username")}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => {
                      handleUserInteraction();
                      // 直接设置值到React Hook Form，不进行trim处理
                      setValue("username", e.target.value, { shouldValidate: true });
                    }}
                    min={undefined}
                    max={undefined}
                  />
                  {shouldShowError("username") && (
                    <p className="mt-1 text-sm" style={{ color: '#f04438' }}>
                      {errors.username?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    密码 <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入密码"
                      {...register("password", {
                        required: "密码不能为空",
                        minLength: {
                          value: 6,
                          message: "密码至少6个字符"
                        },
                        maxLength: {
                          value: 32,
                          message: "密码不能超过32个字符"
                        }
                      
                      })}
                      value={watch("password")}
                      error={shouldShowError("password")}
                      className={`${
                        focusedField === "password" ? "ring-2 ring-blue-500 ring-opacity-50" : ""
                      }`}
                      onFocus={() => handleFieldFocus("password")}
                      onBlur={() => handleFieldBlur("password")}
                      onKeyUp={checkCapsLock}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => {
                        handleUserInteraction();
                        // 直接设置值到React Hook Form，不进行trim处理
                        setValue("password", e.target.value, { shouldValidate: true });
                      }}
                      min={undefined}
                      max={undefined}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {shouldShowError("password") && (
                    <p className="mt-1 text-sm" style={{ color: '#f04438' }}>{errors.password?.message}</p>
                  )}
                  {focusedField === "password" && !shouldShowError("password") && (
                    <p className="mt-1 text-sm text-gray-500">{getFieldHint("password")}</p>
                  )}
                  {isCapsLock && (
                    <p className="mt-1 text-sm text-amber-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      大写锁定已开启
                    </p>
                  )}
                </div>
                
                {/* 验证码 */}
                <div>
                  <Label>
                    验证码 <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="请输入验证码"
                      {...register("captchaCode", {
                        required: "验证码不能为空",
                        minLength: {
                          value: 4,
                          message: "验证码至少4个字符"
                        },
                        maxLength: {
                          value: 6,
                          message: "验证码不能超过6个字符"
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9]+$/,
                          message: "验证码只能包含字母和数字"
                        }
                      })}
                      value={watch("captchaCode")}
                      error={shouldShowError("captchaCode")}
                      className={`${
                        focusedField === "captchaCode" ? "ring-2 ring-blue-500 ring-opacity-50" : ""
                      }`}
                      onFocus={() => handleFieldFocus("captchaCode")}
                      onBlur={() => handleFieldBlur("captchaCode")}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => {
                        handleUserInteraction();
                        // 直接设置值到React Hook Form，不进行trim处理
                        setValue("captchaCode", e.target.value, { shouldValidate: true });
                      }}
                      min={undefined}
                      max={undefined}
                    />
                    <div className="flex-shrink-0">
                      {captchaLoading ? (
                        <div className="h-10 w-24 border border-gray-300 rounded flex items-center justify-center bg-gray-50">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        </div>
                      ) : captchaImage ? (
                        <div 
                          className="h-10 w-24 border border-gray-300 rounded cursor-pointer flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                          onClick={getCaptcha}
                          title="点击刷新验证码"
                        >
                          <img 
                            src={captchaImage} 
                            alt="验证码" 
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div 
                          className="h-10 w-24 border border-gray-300 rounded cursor-pointer flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                          onClick={getCaptcha}
                          title="点击获取验证码"
                        >
                          <span className="text-xs text-gray-500">获取验证码</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {shouldShowError("captchaCode") && (
                    <p className="mt-1 text-sm" style={{ color: '#f04438' }}>{errors.captchaCode?.message}</p>
                  )}
                  {focusedField === "captchaCode" && !shouldShowError("captchaCode") && (
                    <p className="mt-1 text-sm text-gray-500">{getFieldHint("captchaCode")}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={rememberMe} 
                      onChange={(checked) => setValue("rememberMe", checked)} 
                    />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      记住我
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    忘记密码？
                  </Link>
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    disabled={loading || !isFormValid()}
                    onClick={handleSubmit(onSubmit)}
                  >
                    {loading ? "登录中..." : "登录"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
