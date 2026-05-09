import { useEffect, useRef, useState } from 'react';
import { BenefitStrip } from '../components/home/BenefitStrip';
import { BestsellersSection } from '../components/home/BestsellersSection';
import { CollectionGrid } from '../components/home/CollectionGrid';
import { HeroSection } from '../components/home/HeroSection';
import { NewsletterSection } from '../components/home/NewsletterSection';
import { StoryBand } from '../components/home/StoryBand';

export function HomePage() {
  const metricsRef = useRef<HTMLDListElement>(null);
  const [countDesigns, setCountDesigns] = useState(0);
  const [countRating, setCountRating] = useState('0.0');

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

    const metricsElement = metricsRef.current;
    let metricsObserver: IntersectionObserver | null = null;

    if (metricsElement) {
      metricsObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        metricsObserver?.disconnect();

        const durationMs = 1600;
        const startTime = Date.now();
        const ticker = setInterval(() => {
          const progress = Math.min((Date.now() - startTime) / durationMs, 1);
          const easedProgress = 1 - (1 - progress) ** 3;

          setCountDesigns(Math.floor(easedProgress * 500));
          setCountRating((Math.round(easedProgress * 48) / 10).toFixed(1));

          if (progress >= 1) clearInterval(ticker);
        }, 16);
      }, { threshold: 0.5 });

      metricsObserver.observe(metricsElement);
    }

    return () => {
      revealObserver.disconnect();
      metricsObserver?.disconnect();
    };
  }, []);

  return (
    <>
      <HeroSection
        metricsRef={metricsRef}
        countDesigns={countDesigns}
        countRating={countRating}
      />
      <BenefitStrip />
      <CollectionGrid />
      <BestsellersSection />
      <StoryBand />
      <NewsletterSection />
    </>
  );
}
