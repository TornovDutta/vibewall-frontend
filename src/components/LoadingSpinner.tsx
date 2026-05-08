interface Props {
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ fullPage, size = 'md' }: Props) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const spinner = (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-white/20 border-t-violet-500`}
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vw-bg">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center py-6">{spinner}</div>;
}
