import { ReactNode } from 'react';

export default function ProductionLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="">
      {children}
    </div>
  );
}
