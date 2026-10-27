import { useState } from 'react';

import { t } from '../../../../i18n/core/t';
import BodySection from '../../../../shared/components/BodySection/BodySection';
import Icon from '../../../../shared/components/Icon/Icon';
import { getDomainFromUrl } from '../../../../shared/utils/getDomainFromUrl';
import { getYoutubeEmbedUrl } from '../../../../shared/utils/getYoutubeEmbedUrl';
import type { SupportResource } from '../../../../types/SupportResource';

import './gardenInputResources.css';

interface Props {
  readonly resources?: readonly SupportResource[];
}

export function GardenInputResources({ resources }: Props) {
  const videos = (resources ?? []).filter((r) => r.type === 'video');
  const articles = (resources ?? []).filter((r) => r.type === 'article');

  const [activeTab, setActiveTab] = useState<'videos' | 'articles'>(
    videos.length > 0 ? 'videos' : 'articles'
  );

  if (videos.length === 0 && articles.length === 0) {
    return null;
  }

  const showTabs = videos.length > 0 && articles.length > 0;

  return (
    <BodySection title={t('gardenInput.resources.title')} icon="menu_book">
      {showTabs && (
        <div className="garden-input-resources__tabs" role="tablist">
          <button
            id="garden-input-tab-videos"
            type="button"
            role="tab"
            aria-selected={activeTab === 'videos'}
            aria-controls="garden-input-panel-videos"
            tabIndex={activeTab === 'videos' ? 0 : -1}
            className={`garden-input-resources__tab ${
              activeTab === 'videos'
                ? 'garden-input-resources__tab--active'
                : ''
            }`}
            onClick={() => setActiveTab('videos')}
          >
            <Icon name="movie" decorative />
            <span>{t('gardenInput.resources.videos')}</span>
          </button>
          <button
            id="garden-input-tab-articles"
            type="button"
            role="tab"
            aria-selected={activeTab === 'articles'}
            aria-controls="garden-input-panel-articles"
            tabIndex={activeTab === 'articles' ? 0 : -1}
            className={`garden-input-resources__tab ${
              activeTab === 'articles'
                ? 'garden-input-resources__tab--active'
                : ''
            }`}
            onClick={() => setActiveTab('articles')}
          >
            <Icon name="description" decorative />
            <span>{t('gardenInput.resources.articles')}</span>
          </button>
        </div>
      )}

      {videos.length > 0 && (
        <div
          id="garden-input-panel-videos"
          role="tabpanel"
          aria-labelledby="garden-input-tab-videos"
          hidden={showTabs && activeTab !== 'videos'}
          className="garden-input-resources__videos"
        >
          {videos.map((video) => {
            const embedUrl = getYoutubeEmbedUrl(video.url);
            if (!embedUrl) return null;

            return (
              <iframe
                key={video.url}
                className="garden-input-resources__iframe"
                src={embedUrl}
                title={video.title || t('gardenInput.resources.video_title')}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            );
          })}
        </div>
      )}

      {articles.length > 0 && (
        <div
          id="garden-input-panel-articles"
          role="tabpanel"
          aria-labelledby="garden-input-tab-articles"
          hidden={showTabs && activeTab !== 'articles'}
          className="garden-input-resources__articles"
        >
          {articles.map((article) => (
            <a
              key={article.url}
              className="garden-input-resources__article-link"
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="link" decorative />
              <span className="garden-input-resources__article-title">
                {article.title || getDomainFromUrl(article.url)}
              </span>
              {article.source && (
                <span className="garden-input-resources__article-source">
                  ({article.source})
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </BodySection>
  );
}
