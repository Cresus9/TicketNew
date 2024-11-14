import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export default function LoadingButton({
  loading = false,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${props.className} ${loading ? 'cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <>
          <Loader className="animate-spin h-5 w-5" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}