import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TreeDropdownBase from '@/components/ui/tree/base/TreeDropdownBase';

describe('TreeDropdownBase', () => {
  it('renders trigger content and toggles open state via prop', () => {
    const setIsOpen = jest.fn();
    render(
      <TreeDropdownBase
        isOpen={false}
        setIsOpen={setIsOpen}
        searchValue=""
        onSearchChange={() => {}}
        triggerContent={<span data-testid="trigger">Trigger</span>}
      >
        <div>content</div>
      </TreeDropdownBase>
    );
    expect(screen.getByTestId('trigger')).toBeInTheDocument();
  });

  it('shows search input when showSearch=true and updates value', () => {
    const setIsOpen = jest.fn();
    const onSearchChange = jest.fn();
    render(
      <TreeDropdownBase
        isOpen
        setIsOpen={setIsOpen}
        showSearch
        searchValue=""
        onSearchChange={onSearchChange}
        triggerContent={<span>Trigger</span>}
      >
        <div>content</div>
      </TreeDropdownBase>
    );
    const input = screen.getByPlaceholderText('搜索...');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(onSearchChange).toHaveBeenCalledWith('abc');
  });

  it('calls onClear when clear button clicked', () => {
    const setIsOpen = jest.fn();
    const onClear = jest.fn();
    render(
      <TreeDropdownBase
        isOpen={false}
        setIsOpen={setIsOpen}
        allowClear
        canClear
        onClear={onClear}
        searchValue=""
        onSearchChange={() => {}}
        triggerContent={<span>Trigger</span>}
      >
        <div>content</div>
      </TreeDropdownBase>
    );
    const clearBtn = screen.getByRole('button', { hidden: true });
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });
});


