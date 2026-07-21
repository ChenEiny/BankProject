import React from 'react';

interface BankCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function BankCard({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
}: BankCardProps) {
  return (
    <div className={`bank-card ${className}`}>
      {(title || icon || action) && (
        <div className="bank-card-header">
          <div className="bank-card-title-group">
            {icon && <div className="bank-card-icon">{icon}</div>}
            <div>
              {title && <h3 className="bank-card-title">{title}</h3>}
              {subtitle && <p className="bank-card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="bank-card-action">{action}</div>}
        </div>
      )}
      <div className="bank-card-body">{children}</div>
    </div>
  );
}