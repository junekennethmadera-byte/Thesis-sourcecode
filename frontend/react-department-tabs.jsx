import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const departments = [
  { value: '', label: 'All Departments', color: '#60748a' },
  { value: 'CCS', label: 'CCS', color: '#278257' },
  { value: 'CED', label: 'CED', color: '#2672b8' },
  { value: 'CBAA', label: 'CBAA', color: '#c69418' },
  { value: 'CCJE', label: 'CCJE', color: '#7b2f45' },
  { value: 'CN', label: 'CN', color: '#c43d3d' }
];

function DepartmentTabs() {
  const filter = document.getElementById('repositoryCategory');
  const search = document.getElementById('repositorySearchButton');
  const [selected, setSelected] = useState(filter?.value || '');

  const choose = (value) => {
    setSelected(value);
    if (filter) {
      filter.value = value;
    }
    search?.click();
  };

  return React.createElement(
    'div',
    { className: 'department-tabs', role: 'tablist', 'aria-label': 'Filter repository by department' },
    departments.map((department) => React.createElement(
      'button',
      {
        key: department.value || 'all',
        className: `department-tab${selected === department.value ? ' active' : ''}`,
        type: 'button',
        role: 'tab',
        'aria-selected': selected === department.value,
        'data-department-tab': department.value,
        style: { '--department-color': department.color },
        onClick: () => choose(department.value)
      },
      department.label
    ))
  );
}

const root = document.getElementById('departmentTabsRoot');
if (root) createRoot(root).render(React.createElement(DepartmentTabs));
