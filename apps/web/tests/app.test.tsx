import { render, screen } from '@testing-library/react';

import { App } from '../src/App';

describe('App', () => {
  it('renders scaffold message', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'ScrambleIQ' })).toBeInTheDocument();
    expect(screen.getByText(/manual-first match review scaffold is ready/i)).toBeInTheDocument();
  });
});
