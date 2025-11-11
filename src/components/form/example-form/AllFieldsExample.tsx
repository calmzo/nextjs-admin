/**
 * 所有字段组件使用示例
 * 展示 RadioField, CheckboxField, TextAreaField, DateField 的用法
 */

"use client";

import React, { useEffect } from 'react';
import { useForm } from '../hooks';
import { 
  TextField, 
  NumberField, 
  SelectField, 
  RadioField, 
  CheckboxField, 
  TextAreaField, 
  DateField 
} from '../fields';
import ModalForm from '../ModalForm';

type AllFieldsFormData = {
  name: string;
  email: string;
  age: number;
  gender: string;
  hobbies: string[];
  agree: boolean;
  description: string;
  birthday: string;
  status: string;
} & Record<string, unknown>;

interface AllFieldsExampleProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AllFieldsFormData) => Promise<void>;
  initialData?: Partial<AllFieldsFormData>;
  loading?: boolean;
}

const AllFieldsExample: React.FC<AllFieldsExampleProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  // 性别选项
  const genderOptions = [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
    { value: 'other', label: '其他' }
  ];

  // 爱好选项
  const hobbyOptions = [
    { value: 'reading', label: '阅读' },
    { value: 'music', label: '音乐' },
    { value: 'sports', label: '运动' },
    { value: 'travel', label: '旅行' },
    { value: 'coding', label: '编程' }
  ];

  // 状态选项
  const statusOptions = [
    { value: 'active', label: '活跃' },
    { value: 'inactive', label: '不活跃' },
    { value: 'pending', label: '待审核' }
  ];

  // 使用 useForm Hook 管理表单
  const form = useForm<AllFieldsFormData>({
    initialValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      age: initialData?.age || 18,
      gender: initialData?.gender || 'male',
      hobbies: initialData?.hobbies || [],
      agree: initialData?.agree ?? false,
      description: initialData?.description || '',
      birthday: initialData?.birthday || '',
      status: initialData?.status || 'active',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.name.trim()) {
        errors.name = '姓名不能为空';
      }

      if (!values.email.trim()) {
        errors.email = '邮箱不能为空';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = '邮箱格式不正确';
      }

      if (values.age < 1 || values.age > 150) {
        errors.age = '年龄必须在1-150之间';
      }

      if (!values.gender) {
        errors.gender = '请选择性别';
      }

      if (values.hobbies.length === 0) {
        errors.hobbies = '请至少选择一个爱好';
      }

      if (!values.agree) {
        errors.agree = '请同意用户协议';
      }

      if (!values.description.trim()) {
        errors.description = '描述不能为空';
      } else if (values.description.length < 10) {
        errors.description = '描述至少需要10个字符';
      }

      if (!values.birthday) {
        errors.birthday = '请选择生日';
      }

      if (!values.status) {
        errors.status = '请选择状态';
      }

      return errors;
    },
    onSubmit: async (values) => {
      await onSubmit(values);
      onClose();
    },
    resetOnSubmit: true,
  });

  // 当 initialData 变化时，更新表单值
  useEffect(() => {
    if (initialData) {
      form.setValues({
        name: initialData.name || '',
        email: initialData.email || '',
        age: initialData.age || 18,
        gender: initialData.gender || 'male',
        hobbies: initialData.hobbies || [],
        agree: initialData.agree ?? false,
        description: initialData.description || '',
        birthday: initialData.birthday || '',
        status: initialData.status || 'active',
      });
    }
  }, [initialData, isOpen, form]);

  // 当模态框关闭时重置表单
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={form.handleSubmit}
      title="完整表单示例"
      description="展示所有字段组件的用法"
      loading={loading}
      isSubmitting={form.isSubmitting}
      submitText="提交"
      maxWidth="2xl"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* 基础字段 */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="姓名"
            name="name"
            value={form.values.name}
            onChange={form.handleChange('name')}
            onBlur={form.handleBlur('name')}
            error={form.errors['name']}
            placeholder="请输入姓名"
            required
            autoManageTouched
            forceShowError={!!form.errors['name']}
          />

          <TextField
            label="邮箱"
            name="email"
            type="email"
            value={form.values.email}
            onChange={form.handleChange('email')}
            onBlur={form.handleBlur('email')}
            error={form.errors['email']}
            placeholder="请输入邮箱"
            required
            autoManageTouched
            forceShowError={!!form.errors['email']}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label="年龄"
            name="age"
            value={form.values.age}
            onChange={form.handleChange('age')}
            onBlur={form.handleBlur('age')}
            error={form.errors['age']}
            placeholder="请输入年龄"
            min={1}
            max={150}
            required
            autoManageTouched
            forceShowError={!!form.errors['age']}
          />

          <DateField
            label="生日"
            name="birthday"
            value={form.values.birthday}
            onChange={form.handleChange('birthday')}
            onBlur={form.handleBlur('birthday')}
            error={form.errors['birthday']}
            placeholder="请选择生日"
            required
            autoManageTouched
            forceShowError={!!form.errors['birthday']}
          />
        </div>

        {/* 单选按钮组 - RadioField */}
        <RadioField
          label="性别"
          name="gender"
          value={form.values.gender}
          onChange={form.handleChange('gender')}
          onBlur={form.handleBlur('gender')}
          options={genderOptions}
          error={form.errors['gender']}
          required
          direction="horizontal"
          autoManageTouched
          forceShowError={!!form.errors['gender']}
        />

        {/* 下拉选择 - SelectField */}
        <SelectField
          label="状态"
          name="status"
          value={form.values.status}
          onChange={form.handleChange('status')}
          onBlur={form.handleBlur('status')}
          options={statusOptions}
          error={form.errors['status']}
          placeholder="请选择状态"
          required
          autoManageTouched
          forceShowError={!!form.errors['status']}
        />

        {/* 多选复选框 - CheckboxField (多个) */}
        <CheckboxField
          label="爱好"
          name="hobbies"
          value={form.values.hobbies}
          onChange={(value) => form.setValue('hobbies', Array.isArray(value) ? value : [])}
          onBlur={form.handleBlur('hobbies')}
          options={hobbyOptions}
          error={form.errors['hobbies']}
          required
          direction="horizontal"
          autoManageTouched
          forceShowError={!!form.errors['hobbies']}
        />

        {/* 多行文本 - TextAreaField */}
        <TextAreaField
          label="个人描述"
          name="description"
          value={form.values.description}
          onChange={form.handleChange('description')}
          onBlur={form.handleBlur('description')}
          error={form.errors['description']}
          placeholder="请输入个人描述（至少10个字符）"
          rows={4}
          required
          autoManageTouched
          forceShowError={!!form.errors['description']}
        />

        {/* 单个复选框 - CheckboxField (单个) */}
        <CheckboxField
          label=""
          name="agree"
          value={form.values.agree}
          onChange={(value) => form.setValue('agree', typeof value === 'boolean' ? value : false)}
          onBlur={form.handleBlur('agree')}
          error={form.errors['agree']}
          checkboxLabel="我已阅读并同意用户协议"
          layout="inline"
          required
          autoManageTouched
          forceShowError={!!form.errors['agree']}
        />
      </div>
    </ModalForm>
  );
};

export default AllFieldsExample;

