export function focusFirstFormError(): void {
  setTimeout(() => {
    const firstErrorElement = document.querySelector<HTMLElement>(
      '.anomaly-form [aria-invalid="true"]'
    );
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center'
      });
      firstErrorElement.focus?.();
    }
  }, 0);
}
