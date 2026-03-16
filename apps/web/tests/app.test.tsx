import { fireEvent, render, screen } from '@testing-library/react';

import { App } from '../src/App';

describe('App', () => {
  it('renders match creation form', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'ScrambleIQ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create Match' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Match' })).toBeInTheDocument();
  });

  it('shows validation errors when required fields are missing', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Create Match' }));

    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Date is required.')).toBeInTheDocument();
    expect(screen.getByText('Ruleset is required.')).toBeInTheDocument();
    expect(screen.getByText('Competitor A is required.')).toBeInTheDocument();
    expect(screen.getByText('Competitor B is required.')).toBeInTheDocument();
  });
});
