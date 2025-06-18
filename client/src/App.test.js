import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders TLE CodePlus app', () => {
  render(<App />);
  const linkElement = screen.getByText(/TLE/i);
  expect(linkElement).toBeInTheDocument();
});
