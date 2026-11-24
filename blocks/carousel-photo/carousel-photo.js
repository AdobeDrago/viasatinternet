import { fetchPlaceholders } from '../../scripts/placeholders.js';

/*
 * Carousel (photo): slider of photo cards with the title + text overlaid on the photo.
 * Extends the carousel block: one row per slide, cells [image | title + text].
 * Several slides are visible at once (scroll-snap track); prev/next move by one slide
 * and wrap around at both ends.
 */

function getSlides(block) {
  return [...block.querySelectorAll('.carousel-photo-slide')];
}

// scroll position that puts a slide at the start of the track (after its start padding,
// which lines the first slide up with the page content while the track bleeds to the edge)
function slideScrollLeft(track, slide) {
  const padStart = parseFloat(getComputedStyle(track).paddingLeft) || 0;
  return slide.offsetLeft - track.offsetLeft - padStart;
}

function getActiveIndex(block) {
  const track = block.querySelector('.carousel-photo-slides');
  const slides = getSlides(block);
  const maxScroll = track.scrollWidth - track.clientWidth;
  let active = 0;
  let best = Infinity;
  // slides that cannot reach the start (the last ones on wide screens) resolve to the end
  // position; the first of them wins, so "previous" from the end goes back one step
  slides.forEach((slide, idx) => {
    const target = Math.min(slideScrollLeft(track, slide), maxScroll);
    const distance = Math.abs(target - track.scrollLeft);
    if (distance < best) {
      best = distance;
      active = idx;
    }
  });
  return active;
}

function showSlide(block, slideIndex) {
  const track = block.querySelector('.carousel-photo-slides');
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
    left: slideScrollLeft(track, slides[index]),
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const track = block.querySelector('.carousel-photo-slides');
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
  slide.id = `carousel-photo-${carouselId}-slide-${slideIndex}`;
  slide.classList.add('carousel-photo-slide');

  [...row.children].forEach((column) => {
    const isImage = column.querySelector('picture') && column.textContent.trim() === '';
    column.classList.add(`carousel-photo-slide-${isImage ? 'image' : 'content'}`);
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
  block.id = `carousel-photo-${carouselId}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const placeholders = await fetchPlaceholders();
  const { carousel: carouselLabel, carouselSlides: carouselSlidesLabel } = placeholders;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', carouselLabel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-photo-slides-container');

  const track = document.createElement('ul');
  track.classList.add('carousel-photo-slides');
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
  // the track bleeds to the viewport edge: keep a classic scrollbar out of the 100vw math
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbar > 0) block.style.setProperty('--carousel-photo-scrollbar', `${scrollbar}px`);

  if (rows.length > 1) {
    const nav = document.createElement('div');
    nav.classList.add('carousel-photo-navigation-buttons');
    nav.innerHTML = `
      <button type="button" class="slide-prev" aria-controls="${track.id}" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-controls="${track.id}" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
    block.append(nav);
    bindEvents(block);
  }
}
