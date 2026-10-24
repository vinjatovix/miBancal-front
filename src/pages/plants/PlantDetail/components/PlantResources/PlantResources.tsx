import { t } from '../../../../../i18n/core/t';
import BodySection from '../../../../../shared/components/BodySection/BodySection';
import Icon from '../../../../../shared/components/Icon/Icon';
import { getDomainFromUrl } from '../../../../../shared/utils/getDomainFromUrl';
import type { Plant } from '../../../../../types/Plants/Plant';
import { getYoutubeEmbedUrl } from '../../../utils/getYoutubeEmbedUrl';
import { usePlantResources } from './hooks/usePlantResourcesTabs';

import './plantResources.css';

interface Props {
  readonly plant: Plant;
}

export default function PlantResources({ plant }: Props) {
  const { videos, articles, tab, setTab, height, videosRef } =
    usePlantResources(plant);

  if (!videos.length && !articles.length) return null;

  return (
    <BodySection title={t('plant.resources.title')} icon="menu_book">
      <div className="plant-resources__tabs" role="tablist">
        {videos.length > 0 && (
          <button
            id="tab-videos"
            data-testid="tab-videos"
            type="button"
            role="tab"
            aria-selected={tab === 'videos'}
            aria-controls="panel-videos"
            tabIndex={tab === 'videos' ? 0 : -1}
            className={tab === 'videos' ? 'active' : ''}
            onClick={() => setTab('videos')}
          >
            <Icon name="movie" decorative /> {t('plant.resources.videos')}
          </button>
        )}

        {articles.length > 0 && (
          <button
            id="tab-articles"
            data-testid="tab-articles"
            type="button"
            role="tab"
            aria-selected={tab === 'articles'}
            aria-controls="panel-articles"
            tabIndex={tab === 'articles' ? 0 : -1}
            className={tab === 'articles' ? 'active' : ''}
            onClick={() => setTab('articles')}
          >
            <Icon name="description" decorative />{' '}
            {t('plant.resources.articles')}
          </button>
        )}
      </div>

      <div className="plant-resources__content" style={{ height }}>
        <div
          id="panel-videos"
          role="tabpanel"
          aria-labelledby="tab-videos"
          hidden={tab !== 'videos'}
          ref={videosRef}
          className="plant-resources__videos"
          style={{ display: tab === 'videos' ? 'grid' : 'none' }}
        >
          {videos.map((video) => {
            const embedUrl = getYoutubeEmbedUrl(video.url);
            if (!embedUrl) return null;

            return (
              <iframe
                className="plant-video"
                data-testid="resource-video"
                key={video.url}
                src={embedUrl}
                title={t('plant.resources.video_title')}
                allowFullScreen
              />
            );
          })}
        </div>

        <div
          id="panel-articles"
          role="tabpanel"
          aria-labelledby="tab-articles"
          hidden={tab !== 'articles'}
          className="plant-resources__articles"
          style={{ display: tab === 'articles' ? 'flex' : 'none' }}
        >
          {articles.map((article) => (
            <a
              className="plant-article"
              data-testid="resource-article"
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="link" decorative />{' '}
              {article.title ?? getDomainFromUrl(article.url)}
            </a>
          ))}
        </div>
      </div>
    </BodySection>
  );
}
