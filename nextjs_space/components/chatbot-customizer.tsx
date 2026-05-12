'use client';

import { useEffect } from 'react';

/**
 * Overrides the Abacus AI chatbot widget styles to match CRM branding
 * and adds click-outside-to-close behavior.
 */
export function ChatbotCustomizer() {
  useEffect(() => {
    // Inject custom CSS overrides for the chatbot widget
    const styleId = 'chatbot-crm-overrides';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Override chatbot circle button — corporate deep teal */
        .floating-circle {
          background-color: #073B34 !important;
          width: 56px !important;
          height: 56px !important;
          bottom: 20px !important;
          right: 24px !important;
          box-shadow: 0 4px 14px rgba(7, 59, 52, 0.4) !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .floating-circle:hover {
          transform: scale(1.08) !important;
          box-shadow: 0 6px 20px rgba(7, 59, 52, 0.5) !important;
        }
        .floating-circle:active {
          transform: scale(0.95) !important;
        }
        .floating-circle svg {
          margin: 13px !important;
          width: 28px !important;
          height: 28px !important;
          fill: #CEFD56 !important;
        }

        /* Override chatbot iframe panel */
        .floating-iframe {
          bottom: 88px !important;
          right: 24px !important;
          border-radius: 16px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(7, 59, 52, 0.1) !important;
          overflow: hidden !important;
        }
        .floating-iframe.open {
          border-radius: 16px !important;
          max-height: calc(100vh - 120px) !important;
          max-width: calc(100vw - 48px) !important;
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .floating-iframe.open {
            width: calc(100vw - 32px) !important;
            height: calc(100vh - 140px) !important;
            right: 16px !important;
            bottom: 84px !important;
          }
          .floating-circle {
            right: 16px !important;
            bottom: 16px !important;
            width: 50px !important;
            height: 50px !important;
          }
          .floating-circle svg {
            margin: 11px !important;
            width: 26px !important;
            height: 26px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Click-outside-to-close handler
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const iframe = document.querySelector('.floating-iframe');
      const circle = document.querySelector('.floating-circle');

      if (!iframe || !circle) return;
      if (!iframe.classList.contains('open')) return;

      // Check if click is on the circle or the iframe
      if (circle.contains(target) || iframe.contains(target) || target === iframe) return;

      // Close the chatbot
      iframe.classList.remove('open');
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return null;
}
