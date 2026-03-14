import React from "react";
import { PriceTag } from "../PriceTag";
import { Button } from "../Button";

export interface ActionBarProps {
  price?: number;
  currency?: string;
  onContact?: () => void;
  onCall?: () => void;
  onChat?: () => void;
  className?: string;
}

export function ActionBar({ price, currency = "UGX", onContact, onCall, onChat, className = "" }: ActionBarProps) {
  return (
    <div className={`bg-card border-t border-border/40 shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {price !== undefined ? (
          <PriceTag amount={price} currency={currency} size="lg" />
        ) : null}
        <div className="flex items-center gap-2 ml-auto">
          {onCall ? (
            <button
              type="button"
              onClick={onCall}
              className="w-10 h-10 flex items-center justify-center bg-surface border border-border/40 rounded-button hover:bg-surface/80 transition-colors"
              aria-label="Call seller"
            >
              📞
            </button>
          ) : null}
          {onChat ? (
            <button
              type="button"
              onClick={onChat}
              className="w-10 h-10 flex items-center justify-center bg-surface border border-border/40 rounded-button hover:bg-surface/80 transition-colors"
              aria-label="Chat with seller"
            >
              💬
            </button>
          ) : null}
          {onContact ? (
            <Button onClick={onContact} variant="primary" size="md">
              Contact Seller
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
