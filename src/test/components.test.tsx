import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/logo';

describe('Logo Component', () => {
  it('should render successfully', () => {
    render(<Logo />);
    const logoElement = screen.getByRole('img', { hidden: true }); // Lucide icons are often hidden from accessibility tree
    expect(logoElement).toBeInTheDocument();
  });
});
