import { useState } from 'react';

import { t } from '../../../i18n/core/t';
import { getDomainFromUrl } from '../../utils/getDomainFromUrl';
import { getYoutubeEmbedUrl } from '../../utils/getYoutubeEmbedUrl';
import type { SupportResource } from '../../../types/SupportResource';
import BodySection from '../BodySection/BodySection';
import Icon from '../Icon/Icon';
import type { IconName } from '../Icon/iconPaths';

import './supportResources.css';

interface Props {
  readonly resources?: readonly SupportResource[];
  readonly title: string;
  readonly videoTitle: string;
  readonly icon?: IconName;
}

export default function SupportResources({
  resources,
  title,
  videoTitle,
  icon = 'menu_book'
}: Props) {
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
    <BodySection title={title} icon={icon}>
      {showTabs && (
        <div className="support-resources__tabs" role="tablist">
          <button
            id="tab-videos"
            data-testid="tab-videos"
            type="button"
            role="tab"
            aria-selected={activeTab === 'videos'}
            aria-controls="panel-videos"
            tabIndex={activeTab === 'videos' ? 0 : -1}
            className={`support-resources__tab ${
              activeTab === 'videos' ? 'support-resources__tab--active' : ''
            }`}
            onClick={() => setActiveTab('videos')}
          >
            <Icon name="movie" decorative />
            <span>{t('common.resources.videos')}</span>
          </button>
          <button
            id="tab-articles"
            data-testid="tab-articles"
            type="button"
            role="tab"
            aria-selected={activeTab === 'articles'}
            aria-controls="panel-articles"
            tabIndex={activeTab === 'articles' ? 0 : -1}
            className={`support-resources__tab ${
              activeTab === 'articles' ? 'support-resources__tab--active' : ''
            }`}
            onClick={() => setActiveTab('articles')}
          >
            <Icon name="description" decorative />
            <span>{t('common.resources.articles')}</span>
          </button>
        </div>
      )}

      {videos.length > 0 && (
        <div
          id="panel-videos"
          role="tabpanel"
          aria-labelledby="tab-videos"
          hidden={showTabs && activeTab !== 'videos'}
          className="support-resources__videos"
          style={{
            display: !showTabs || activeTab === 'videos' ? 'grid' : 'none'
          }}
        >
          {videos.map((video) => {
            const embedUrl = getYoutubeEmbedUrl(video.url);
            if (!embedUrl) return null;

            return (
              <iframe
                key={video.url}
                className="support-resources__iframe"
                src={embedUrl}
                title={video.title || videoTitle}
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
          id="panel-articles"
          role="tabpanel"
          aria-labelledby="tab-articles"
          hidden={showTabs && activeTab !== 'articles'}
          className="support-resources__articles"
          style={{
            display: !showTabs || activeTab === 'articles' ? 'flex' : 'none'
          }}
        >
          {articles.map((article) => (
            <a
              key={article.url}
              className="support-resources__article-link"
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="link" decorative />
              <span className="support-resources__article-title">
                {article.title || getDomainFromUrl(article.url)}
              </span>
              {article.source && (
                <span className="support-resources__article-source">
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
