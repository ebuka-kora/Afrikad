import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with title', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPressMock} disabled />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('has accessibility label', () => {
    const { getByLabelText } = render(
      <Button title="Test Button" onPress={() => {}} accessibilityLabel="Custom Label" />
    );
    
    expect(getByLabelText('Custom Label')).toBeTruthy();
  });
});
