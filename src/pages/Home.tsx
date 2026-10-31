import { t } from '../i18n/core/t';
import { CONTACT_EMAIL } from '../shared/constants/contact';

export default function Home() {
  return (
    <section>
      <h1>{t('app.brand')}</h1>
      <h2>{t('app.info.title')}</h2>

      <p>{t('app.info.nonprofit')}</p>
      <p>{t('app.info.images')}</p>
      <p>{t('app.info.videos')}</p>
      <p>{t('app.info.youtube_notice')}</p>
      <p>{t('app.info.disclaimer')}</p>
      <p>{t('app.info.feedback')}</p>

      <hr />

      <h3>{t('app.info.contact')}</h3>
      <p>{t('app.info.contact_text')}</p>

      <p>
        {t('app.info.email')}{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </section>
  );
}
