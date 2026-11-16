import { NotFound } from '../shared/components/NotFound/NotFound';

export default function NotFoundPage() {
  return (
    <NotFound
      titleKey="notFound.title"
      messageKey="notFound.message"
      backTo="/"
      backLabelKey="notFound.backHome"
    />
  );
}
