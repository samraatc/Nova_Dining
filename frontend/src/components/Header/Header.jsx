import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Array with image and corresponding text
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1506459225024-1428097a7e18?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      heading: 'Hand Decorating Blueberry Cake',
      description: 'A beautifully frosted cake topped with blueberries and delicate decorative twigs is being styled by a hand gently placing a fresh blueberry on top. The cake sits on a white pedestal against a clean, minimal background, highlighting the elegance of homemade desserts and fine food photography.',
    },
    {
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=780&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      heading: 'Golden Pancake Stack with Syrup Drizzle',
      description: 'A tall stack of fluffy golden pancakes is beautifully topped with fresh banana slices and mint leaves, while warm syrup is being poured from above, cascading down the layers. Styled on rustic wooden plates with a dark textured background, the image captures the perfect balance of comfort food and gourmet presentation.',
    },
    {
      image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=710&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      heading: 'Avocado & Egg Toast with Fresh Greens',
      description: 'A slice of toasted bread is topped with creamy avocado, perfectly poached eggs, and a sprinkle of fresh greens. The dish is elegantly presented on a rustic wooden board, showcasing the vibrant colors and textures of the ingredients.',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => setCurrentIndex(index);
  const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  return (
    <div className='header'>
      {/* Carousel slides */}
      <div className="carousel-slides">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
      </div>

      {/* Dynamic content overlay */}
      <div className="header-contents">
        <h2>{slides[currentIndex].heading}</h2>
        <p>{slides[currentIndex].description}</p>
      </div>

      {/* Arrows */}
      <button className="carousel-arrow prev" onClick={goToPrev}>
        &lt;
      </button>
      <button className="carousel-arrow next" onClick={goToNext}>
        &gt;
      </button>

      {/* Indicators */}
      <div className="carousel-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Header;
