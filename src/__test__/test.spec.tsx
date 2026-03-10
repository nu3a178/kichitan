import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import App from '@/App';
import { MemoryRouter } from 'react-router-dom';

expect.extend(matchers);

beforeEach(() => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
});
afterEach(() => {
  cleanup();
});

test('コンポーネントが正しく表示されること', () => {

  const element = screen.getByText('テストコンポーネント');
  expect(element).toBeInTheDocument();

});