import { FC, KeyboardEvent } from 'react';
import OtpInput from 'react-otp-input';
import Button from '../shared/button';

interface TokenFormProps {
  token: string;
  setToken: (token: string) => void;
  tokenClick: () => void;
  loading: boolean;
}

const TokenForm: FC<TokenFormProps> = ({
  token,
  setToken,
  tokenClick,
  loading
}) => {
  const handleTokenChange = (token: string) => {
    // Only allow numeric values
    const numericToken = token.replace(/\D/g, '');
    setToken(numericToken);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    // Prevent non-numeric input
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Delete' && event.key !== 'Tab') {
      event.preventDefault();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Handle Enter key press on the container
    if (event.key === 'Enter' && token.length === 6 && !loading) {
      tokenClick();
    }
  };

  return (
    <div className='mt-8' onKeyDown={handleKeyDown}>
      <OtpInput
        value={token}
        onChange={handleTokenChange}
        numInputs={6}
        inputType='text'
        inputStyle={{
          width: '16.6%', 
          height: '80px', 
          borderRadius: '8px', 
          border: '1px solid #667085', 
          marginRight: '8px'
        }}
        renderInput={(props) => (
          <input 
            {...props} 
            onKeyPress={handleKeyPress}
          />
        )}
      />
      <Button 
        variant="primary" 
        disabled={token.length < 6 || loading} 
        className="w-full mt-12" 
        onClick={tokenClick}
      >
        {loading ? 'Loading...' : 'Log in'}
      </Button>
    </div>
  );
};

export default TokenForm;