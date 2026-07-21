import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import BankCard from '../common/BankCard';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-page-container">
      <BankCard
        title={title}
        subtitle={subtitle}
        icon={<ShieldCheck size={28} color="#3b82f6" />}
        className="auth-card-override"
      >
        {children}

        <div className="security-badge">
          <Lock size={12} />
          <span>256-Bit Encrypted Banking System</span>
        </div>
      </BankCard>
    </div>
  );
}