/**
 * FormField 组件测试
 */

import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormField from '../FormField';

describe('FormField', () => {
  describe('基础渲染', () => {
    it('应该渲染标签', () => {
      render(
        <FormField label="用户名">
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText('用户名')).toBeInTheDocument();
    });

    it('应该渲染必填标记', () => {
      render(
        <FormField label="用户名" required>
          <input type="text" />
        </FormField>
      );

      const label = screen.getByText('用户名');
      expect(label.parentElement).toHaveTextContent('*');
    });

    it('应该渲染帮助文本', () => {
      render(
        <FormField label="用户名" helpText="请输入您的用户名">
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText('请输入您的用户名')).toBeInTheDocument();
    });

    it('应该渲染错误信息', () => {
      render(
        <FormField label="用户名" error="用户名不能为空" forceShowError>
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
    });

    it('应该支持自定义 className', () => {
      const { container } = render(
        <FormField label="用户名" className="custom-class">
          <input type="text" />
        </FormField>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('布局', () => {
    it('应该使用垂直布局（默认）', () => {
      const { container } = render(
        <FormField label="用户名">
          <input type="text" />
        </FormField>
      );

      expect(container.firstChild).toHaveClass('space-y-1');
    });

    it('应该支持内联布局', () => {
      const { container } = render(
        <FormField label="用户名" layout="inline">
          <input type="text" />
        </FormField>
      );

      expect(container.firstChild).toHaveClass('flex');
    });
  });

  describe('验证功能', () => {
    it('应该在失去焦点时执行验证', async () => {
      const user = userEvent.setup();
      const validate = jest.fn((value) => {
        if (!value) return '请输入用户名';
        return '';
      });

      const TestComponent = () => {
        const [value, setValue] = useState('');
        return (
          <FormField label="用户名" validate={validate} value={value} autoManageTouched>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormField>
        );
      };

      render(<TestComponent />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(validate).toHaveBeenCalled();
      });
    });

    it('应该显示验证错误', async () => {
      const user = userEvent.setup();
      const validate = (value: unknown) => {
        if (!value) return '请输入用户名';
        return '';
      };

      const TestComponent = () => {
        const [value, setValue] = useState('');
        return (
          <FormField label="用户名" validate={validate} value={value} autoManageTouched>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormField>
        );
      };

      render(<TestComponent />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('请输入用户名')).toBeInTheDocument();
      });
    });

    it('应该在值变化时重新验证', async () => {
      const user = userEvent.setup();
      const validate = (value: unknown) => {
        if (!value) return '请输入用户名';
        if (String(value).length < 3) return '用户名至少3个字符';
        return '';
      };

      const TestComponent = () => {
        const [value, setValue] = useState('');
        return (
          <FormField label="用户名" validate={validate} value={value} autoManageTouched>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormField>
        );
      };

      render(<TestComponent />);

      const input = screen.getByRole('textbox');
      
      // 先输入一个字符，失去焦点
      await user.type(input, 'a');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('用户名至少3个字符')).toBeInTheDocument();
      });

      // 输入更多字符
      await user.click(input);
      await user.type(input, 'bc');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText('用户名至少3个字符')).not.toBeInTheDocument();
      });
    });
  });

  describe('触摸状态管理', () => {
    it('应该自动管理触摸状态', async () => {
      const user = userEvent.setup();
      const validate = (value: unknown) => {
        if (!value) return '请输入用户名';
        return '';
      };

      const TestComponent = () => {
        const [value, setValue] = useState('');
        return (
          <FormField label="用户名" validate={validate} value={value} autoManageTouched>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormField>
        );
      };

      render(<TestComponent />);

      const input = screen.getByRole('textbox');
      
      // 未触摸时不应该显示错误
      expect(screen.queryByText('请输入用户名')).not.toBeInTheDocument();

      // 触摸后应该显示错误
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('请输入用户名')).toBeInTheDocument();
      });
    });

    it('应该支持外部控制触摸状态', () => {
      const TestComponent = () => {
        const [touched, setTouched] = useState(false);
        return (
          <FormField
            label="用户名"
            error="用户名不能为空"
            touched={touched}
            onTouchedChange={setTouched}
          >
            <input type="text" />
          </FormField>
        );
      };

      render(<TestComponent />);

      // 未触摸时不应该显示错误
      expect(screen.queryByText('用户名不能为空')).not.toBeInTheDocument();
    });
  });

  describe('强制显示错误', () => {
    it('应该在 forceShowError 为 true 时显示错误', () => {
      render(
        <FormField
          label="用户名"
          error="用户名不能为空"
          forceShowError
        >
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
    });

    it('应该在有值时隐藏"请输入"类型的错误', () => {
      render(
        <FormField
          label="用户名"
          error="请输入用户名"
          value="test"
          forceShowError
        >
          <input type="text" value="test" readOnly />
        </FormField>
      );

      expect(screen.queryByText('请输入用户名')).not.toBeInTheDocument();
    });
  });

  describe('回调函数', () => {
    it('应该调用 onBlur 回调', async () => {
      const user = userEvent.setup();
      const onBlur = jest.fn();
      const onValueChange = jest.fn(); // 需要提供 onValueChange 才能注入 onBlur

      render(
        <FormField label="用户名" onBlur={onBlur} onValueChange={onValueChange}>
          <input type="text" />
        </FormField>
      );

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(onBlur).toHaveBeenCalled();
      });
    });

    it('应该调用 onValueChange 回调', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();

      const TestComponent = () => {
        const [value, setValue] = useState('');
        return (
          <FormField label="用户名" onValueChange={onValueChange}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormField>
        );
      };

      render(<TestComponent />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      await waitFor(() => {
        expect(onValueChange).toHaveBeenCalled();
      });
    });
  });

  describe('错误显示逻辑', () => {
    it('应该在有值时隐藏"请输入"类型的错误', async () => {
      const user = userEvent.setup();
      const validate = (value: unknown) => {
        if (!value) return '请输入用户名';
        return '';
      };

      const TestComponent = () => {
        const [value, setValue] = useState('');
        return (
          <FormField
            label="用户名"
            validate={validate}
            value={value}
            autoManageTouched
          >
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormField>
        );
      };

      render(<TestComponent />);

      const input = screen.getByRole('textbox');
      
      // 先失去焦点，显示错误
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('请输入用户名')).toBeInTheDocument();
      });

      // 输入值后，错误应该消失
      await user.click(input);
      await user.type(input, 'test');

      await waitFor(() => {
        expect(screen.queryByText('请输入用户名')).not.toBeInTheDocument();
      });
    });

    it('应该在有值时仍然显示格式错误', async () => {
      const user = userEvent.setup();
      const validate = (value: unknown) => {
        if (!value) return '请输入用户名';
        if (String(value).length < 3) return '用户名至少3个字符';
        return '';
      };

      const TestComponent = () => {
        const [value, setValue] = useState('');
        return (
          <FormField
            label="用户名"
            validate={validate}
            value={value}
            autoManageTouched
          >
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormField>
        );
      };

      render(<TestComponent />);

      const input = screen.getByRole('textbox');
      
      // 输入一个字符
      await user.type(input, 'a');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('用户名至少3个字符')).toBeInTheDocument();
      });
    });
  });
});

