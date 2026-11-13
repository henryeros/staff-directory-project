import Input from "../shared/input";
import Button from "../shared/button";

interface LoginFormProps {
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    loginClick: () => void;
    loading: boolean;
}

export default function LoginForm({
    email,
    setEmail,
    password,
    setPassword,
    loginClick,
    loading,
}: LoginFormProps) {
    return (
        <div className="mt-8">
            <Input 
                label="Work email" 
                name="email" 
                type="email" 
                placeholder="Enter your email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <Input 
                className="mt-4" 
                label="Password" 
                name="password" 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <div className="flex justify-end mt-3">
                <p className="text-[#002244] font-semibold text-base cursor-pointer">
                    Forgot Password
                </p>
            </div>
            <Button 
                variant="primary" 
                disabled={!email || !password || loading}
                className="w-full mt-12" 
                onClick={loginClick}
            >
                {loading ? "Logging in..." : "Log in"}
            </Button>
        </div>
    );
}