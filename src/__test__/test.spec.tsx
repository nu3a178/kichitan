import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

beforeEach(() => {
  render(<div>テストコンポーネント</div>);
});
afterEach(() => {
  cleanup();
});

test('コンポーネントが正しく表示されること', () => {

  const element = screen.getByText('テストコンポーネント');
  expect(element).toBeInTheDocument();

});