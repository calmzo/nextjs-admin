import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTreeDropdown } from '@/hooks/useTreeDropdown';

type Node = { id: number; name: string; children?: Node[] };

const data: Node[] = [
  { id: 1, name: 'Root', children: [{ id: 2, name: 'Child' }] },
  { id: 3, name: 'Alone' },
];

function Demo({ value }: { value?: number | null }) {
  const {
    isOpen,
    setIsOpen,
    searchValue,
    setSearchValue,
    filteredData,
    selectedNode,
    handleNodeSelect,
  } = useTreeDropdown<Node>({
    data,
    value: value ?? null,
    getNodeId: (n) => n.id,
    getChildren: (n) => n.children,
    matchSearch: (n, k) => n.name.toLowerCase().includes(k.toLowerCase()),
  });

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} data-testid="toggle">toggle</button>
      <input
        placeholder="kw"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <div data-testid="count">{filteredData.length}</div>
      <div data-testid="selected">{selectedNode ? selectedNode.name : ''}</div>
      <button onClick={() => handleNodeSelect(data[0])} data-testid="select-root">select</button>
    </div>
  );
}

describe('useTreeDropdown', () => {
  it('filters by search keyword', () => {
    render(<Demo />);
    expect(screen.getByTestId('count').textContent).toBe('2');
    fireEvent.change(screen.getByPlaceholderText('kw'), { target: { value: 'root' } });
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('reflects selected node when handleNodeSelect called', () => {
    render(<Demo />);
    fireEvent.click(screen.getByTestId('select-root'));
    expect(screen.getByTestId('selected').textContent).toBe('Root');
  });

  it('initializes selected from value', () => {
    render(<Demo value={3} />);
    expect(screen.getByTestId('selected').textContent).toBe('Alone');
  });
});


