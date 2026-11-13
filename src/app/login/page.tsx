"use client";

import AuthLayout from "@/layout/authLayout";
import LoginForm from "@/components/loginForm";
import TokenForm from "@/components/tokenForm";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Loader from "@/components/shared/loader";
import Cookies from "js-cookie";
import { login} from "@/lib/services/auth";
import { useGetPublicKeyQuery } from "@/lib/store/api/card/api";
import { generateRSAKeyPair, importPublicKey } from "@/lib/crypto";
import { decryptResponse, createEncryptedPayload } from "@/lib/utils/cryptoUtils";
import { useToast } from "@/components/shared/toast";

export default function Login() {
  const {show} = useToast();
  const router = useRouter();

  const [authSuccess, setAuthSuccess] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [backendPublicKey, setBackendPublicKey] = useState<CryptoKey | null>(
    null
  );
  const [keyPair, setKeyPair] = useState<any>(null);

  const { data: publicKeyRes } = useGetPublicKeyQuery({});

  useEffect(() => {
    if (!publicKeyRes || !publicKeyRes.publicKey) return;

    const initializeCrypto = async (): Promise<void> => {
      try {
        const pair = await generateRSAKeyPair();
        setKeyPair(pair);

        const pem = publicKeyRes.publicKey.replace(/\r\n/g, "\n").trim();
        const backendKey = await importPublicKey(pem);
        setBackendPublicKey(backendKey);
      } catch (err) {
        console.error("Failed to initialize crypto:", err);
      }
    };

    void initializeCrypto();
  }, [publicKeyRes]);

  const handleLogin = useCallback(async (): Promise<void> => {
  if (!email || !password) {
    setError("Email and password are required.");
    return;
  }

  if (!backendPublicKey || !keyPair?.privateKey || !keyPair.publicKey) {
    setError("Secure channel not ready. Please refresh.");
    return;
  }

  setError(null);
  setLoading(true);

  try {
    const body = {
      email,
      password,
      token,
    };

    const payload = await createEncryptedPayload(body, backendPublicKey, keyPair);

    const rawResponse: unknown = await login(payload);

    const packet =
      (rawResponse as any)?.data ??
      rawResponse;

    const decrypted = await decryptResponse(
      {
        EncryptedKey: packet.EncryptedKey,
        EncryptedData: packet.EncryptedData,
        IV: packet.IV,
      },
      keyPair.privateKey
    );


    console.log(decrypted)

    const parsed = decrypted as {
      isSuccess?: boolean;
      IsSuccess?: boolean;
      data?: any;
      Data?: any;
      description?: string;
      Description?: string;
    };

    const ok = parsed.isSuccess ?? parsed.IsSuccess ?? false;
    const userData = parsed.data ?? parsed.Data ?? null;
 

    if (ok && userData) {
      Cookies.set("access_token", userData.token, {
        expires: 2,
        path: "/",
        secure: false,
      });

      Cookies.set("user", JSON.stringify(userData), { expires: 2 });
if (authSuccess) {
  router.push('/dashboard')
} else {
  if (userData.userType !== 'Administrator') {
show({
type: "error",
title: "You are Unauthorized to view this resource",
description: `Please Login with an administrator's details`,

})
  } else {
 setAuthSuccess(true);
  }

}
     
      
    } else {
      const serverMessage =
        parsed.description ??
        parsed.Description ??
        "Authentication failed.";
      setError(serverMessage);
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Login failed unexpectedly.";
    setError(message);
  } finally {
    setLoading(false);
  }
}, [email, password, token, backendPublicKey, keyPair]);




  return (
    <AuthLayout
      paragraph={
        authSuccess
          ? "Enter your token to complete your login"
          : "Welcome back, enter your details to sign in"
      }
      header={authSuccess ? "Enter your Token" : "Log In to your Account"}
    >
       
      {loading && <Loader />}
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {authSuccess ? (
        <TokenForm
          token={token}
          setToken={setToken}
          tokenClick={handleLogin}
          loading={loading}
        />
      ) : (
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loginClick={handleLogin}
          loading={loading}
        />
      )}
    </AuthLayout>
  );
}