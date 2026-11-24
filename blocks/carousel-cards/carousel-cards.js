import { fetchPlaceholders } from '../../scripts/placeholders.js';

/*
 * Carousel (cards): slider of look-alike icon cards (title + text above an icon image).
 * Extends the carousel block: one row per slide, cells [image | title + text].
 * Several slides are visible at once (scroll-snap track); prev/next move by one slide
 * and wrap around at both ends.
 */

function getSlides(block) {
  return [...block.querySelectorAll('.carousel-cards-slide')];
}

function getActiveIndex(block) {
  const track = block.querySelector('.carousel-cards-slides');
  const slides = getSlides(block);
  let active = 0;
  let best = Infinity;
  slides.forEach((slide, idx) => {
    const distance = Math.abs(slide.offsetLeft - track.offsetLeft - track.scrollLeft);
    if (distance < best) {
      best = distance;
      active = idx;
    }
  });
  return active;
}

function showSlide(block, slideIndex) {
  const track = block.querySelector('.carousel-cards-slides');
  const slides = getSlides(block);
  const maxScroll = track.scrollWidth - track.clientWidth;
  let index = slideIndex;
  if (index < 0) index = slides.length - 1;
  // wrap to the first slide when moving past the end of the track
  const atEnd = track.scrollLeft >= maxScroll - 1;
  if (index >= slides.length || (slideIndex > getActiveIndex(block) && atEnd)) index = 0;
  block.dataset.activeSlide = index;
  track.scrollTo({
    top: 0,
    left: slides[index].offsetLeft - track.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const track = block.querySelector('.carousel-cards-slides');
  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, getActiveIndex(block) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, getActiveIndex(block) + 1);
  });
  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      block.dataset.activeSlide = getActiveIndex(block);
      ticking = false;
    });
  }, { passive: true });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-cards-${carouselId}-slide-${slideIndex}`;
  slide.classList.add('carousel-cards-slide');

  [...row.children].forEach((column) => {
    const hasText = column.textContent.trim() !== '';
    const hasMedia = !!column.querySelector('picture, img');
    // authors may leave the icon cell empty: drop it so it does not take the content slot
    if (!hasText && !hasMedia) return;
    const isImage = hasMedia && !hasText;
    column.classList.add(`carousel-cards-slide-${isImage ? 'image' : 'content'}`);
    slide.append(column);
  });

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.id) slide.setAttribute('aria-labelledby', heading.id);
  return slide;
}

let carouselId = 0;

/**
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  carouselId += 1;
  block.id = `carousel-cards-${carouselId}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const placeholders = await fetchPlaceholders();
  const { carousel: carouselLabel, carouselSlides: carouselSlidesLabel } = placeholders;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', carouselLabel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-cards-slides-container');

  const track = document.createElement('ul');
  track.classList.add('carousel-cards-slides');
  track.id = `${block.id}-slides`;
  track.tabIndex = 0;
  track.setAttribute('aria-label', carouselSlidesLabel || 'Slides');

  rows.forEach((row, idx) => {
    track.append(createSlide(row, idx, carouselId));
    row.remove();
  });
  container.append(track);
  block.append(container);
  block.dataset.activeSlide = 0;

  if (rows.length > 1) {
    const nav = document.createElement('div');
    nav.classList.add('carousel-cards-navigation-buttons');
    nav.innerHTML = `
      <button type="button" class="slide-prev" aria-controls="${track.id}" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-controls="${track.id}" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
    block.append(nav);
    bindEvents(block);
  }
}
