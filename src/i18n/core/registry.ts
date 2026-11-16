type MessageTree = Record<string, unknown>;

const messages: MessageTree = {};

export function registerMessages(partial: Readonly<MessageTree>): void {
  Object.assign(messages, partial);
}

export function getMessages(): MessageTree {
  return messages;
}
