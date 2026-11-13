export interface InputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel';
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}