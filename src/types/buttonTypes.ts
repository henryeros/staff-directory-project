export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'deactivate' | 'activate';

export interface ButtonProps {
  variant?: ButtonVariant;
  children: React.ReactNode;
  icon?: React.ReactElement<any>;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}