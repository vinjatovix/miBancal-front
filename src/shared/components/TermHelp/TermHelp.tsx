import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { lookup, t } from '../../../i18n/core/t';
import { reportMissingTranslation } from '../../observability/reportMissingTranslation';
import Icon from '../Icon/Icon';

import './termHelp.css';

export interface TermHelpProps {
  readonly termKey: string;
  readonly className?: string;
}

export default function TermHelp({ termKey, className }: TermHelpProps) {
  const term = lookup(`glossary.terms.${termKey}.term`);
  const definition = lookup(`glossary.terms.${termKey}.definition`);
  const isResolved = term !== undefined && definition !== undefined;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!isResolved) {
      reportMissingTranslation(`glossary.terms.${termKey}.definition`);
    }
  }, [isResolved, termKey]);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen, close]);

  if (!isResolved) {
    return null;
  }

  return (
    <span
      ref={containerRef}
      className={className ? `term-help ${className}` : 'term-help'}
    >
      <button
        ref={triggerRef}
        type="button"
        className="term-help__trigger"
        aria-expanded={isOpen}
        aria-controls={popoverId}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <Icon name="info" label={t('glossary.help_label', { term })} />
      </button>

      {isOpen && (
        <span
          id={popoverId}
          role="note"
          aria-label={term}
          className="term-help__popover"
        >
          <span className="term-help__term">{term}</span>
          <span className="term-help__definition">{definition}</span>
          <button
            ref={closeRef}
            type="button"
            className="term-help__close"
            aria-label={t('glossary.close_label')}
            onClick={close}
          >
            <Icon name="close" decorative />
          </button>
        </span>
      )}
    </span>
  );
}
