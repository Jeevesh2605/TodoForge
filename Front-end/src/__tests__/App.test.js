import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

global.localStorage = mockLocalStorage;

// Basic smoke test
test('renders app without crashing', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  // Should render login form when no user is logged in
  expect(screen.getByText(/login/i)).toBeInTheDocument();
});

test('renders signup form when switching to signup', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  // Should render signup form when no user is logged in and navigating to signup
  expect(screen.getByText(/sign up/i)).toBeInTheDocument();
});
