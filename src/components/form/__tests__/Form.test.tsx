/**
 * Form 组件测试
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Form from '../Form';

describe('Form', () => {
  it('应该渲染表单', () => {
    render(
      <Form onSubmit={jest.fn()}>
        <input type="text" />
      </Form>
    );

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('应该渲染子元素', () => {
    render(
      <Form onSubmit={jest.fn()}>
        <input type="text" data-testid="test-input" />
      </Form>
    );

    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });

  it('应该支持自定义 className', () => {
    render(
      <Form onSubmit={jest.fn()} className="custom-class">
        <input type="text" />
      </Form>
    );

    const form = document.querySelector('form');
    expect(form).toHaveClass('custom-class');
  });

  it('应该在提交时调用 onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => {
      e.preventDefault();
    });

    render(
      <Form onSubmit={onSubmit}>
        <input type="text" />
        <button type="submit">提交</button>
      </Form>
    );

    const button = screen.getByRole('button', { name: '提交' });
    await user.click(button);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('应该阻止默认表单提交行为', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => {
      expect(e.defaultPrevented).toBe(true);
    });

    render(
      <Form onSubmit={onSubmit}>
        <input type="text" />
        <button type="submit">提交</button>
      </Form>
    );

    const button = screen.getByRole('button', { name: '提交' });
    await user.click(button);

    expect(onSubmit).toHaveBeenCalled();
  });

  it('应该支持 Enter 键提交', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => {
      e.preventDefault();
    });

    render(
      <Form onSubmit={onSubmit}>
        <input type="text" />
        <button type="submit">提交</button>
      </Form>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '{Enter}');

    expect(onSubmit).toHaveBeenCalled();
  });

  it('应该传递事件对象给 onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => {
      e.preventDefault();
      expect(e).toBeInstanceOf(Object);
      expect(e.type).toBe('submit');
    });

    render(
      <Form onSubmit={onSubmit}>
        <input type="text" />
        <button type="submit">提交</button>
      </Form>
    );

    const button = screen.getByRole('button', { name: '提交' });
    await user.click(button);

    expect(onSubmit).toHaveBeenCalled();
  });
});

