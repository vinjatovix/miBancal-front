interface Window {
  google?: {
    accounts: {
      id: {
        initialize(options: {
          readonly client_id: string;
          readonly callback: (response: {
            readonly credential: string;
          }) => void;
          readonly ux_mode?: 'popup' | 'redirect';
        }): void;
        prompt(): void;
        renderButton(
          parent: HTMLElement,
          options?: Record<string, unknown>
        ): void;
      };
    };
  };
}
