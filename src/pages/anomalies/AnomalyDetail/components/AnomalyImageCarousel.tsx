import { useState, type KeyboardEvent } from 'react';

import { t } from '../../../../i18n/core/t';
import Icon from '../../../../shared/components/Icon/Icon';
import type { SupportResource } from '../../../../types/SupportResource';

import './anomalyImageCarousel.css';

interface Props {
  readonly images: readonly SupportResource[];
  readonly anomalyName: string;
}

export function AnomalyImageCarousel({ images, anomalyName }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const count = images.length;
  const currentImage = images[currentIndex];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % count);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prevSlide();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSlide();
    }
  };

  return (
    <section
      className="anomaly-carousel"
      role="region"
      aria-roledescription={t('anomaly.carousel.roledescription')}
      aria-label={t('anomaly.carousel.label')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="anomaly-carousel__stage">
        <button
          type="button"
          className="anomaly-carousel__nav anomaly-carousel__nav--prev"
          aria-label={t('anomaly.carousel.prev')}
          onClick={prevSlide}
        >
          <Icon name="chevron_left" decorative />
        </button>

        <div
          className="anomaly-carousel__slide"
          role="group"
          aria-roledescription={t('anomaly.carousel.slide_roledescription')}
          aria-label={t('anomaly.carousel.slide_label', {
            current: currentIndex + 1,
            total: count
          })}
        >
          <figure className="anomaly-carousel__figure">
            <img
              src={currentImage.url}
              alt={currentImage.title || anomalyName}
              className="anomaly-carousel__img"
              loading="lazy"
            />
            {(currentImage.title || currentImage.source) && (
              <figcaption className="anomaly-carousel__caption">
                {currentImage.title && (
                  <span className="anomaly-carousel__caption-title">
                    {currentImage.title}
                  </span>
                )}
                {currentImage.source && (
                  <span className="anomaly-carousel__caption-source">
                    {t('anomaly.hero.source', { source: currentImage.source })}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        </div>

        <button
          type="button"
          className="anomaly-carousel__nav anomaly-carousel__nav--next"
          aria-label={t('anomaly.carousel.next')}
          onClick={nextSlide}
        >
          <Icon name="chevron_right" decorative />
        </button>
      </div>

      <div className="anomaly-carousel__dots">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`anomaly-carousel__dot ${
              index === currentIndex ? 'anomaly-carousel__dot--active' : ''
            }`}
            aria-label={t('anomaly.carousel.dot_label', {
              current: index + 1,
              total: count
            })}
            aria-current={index === currentIndex ? 'true' : undefined}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}
