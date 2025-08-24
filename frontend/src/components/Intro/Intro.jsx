import React from 'react'
import './Intro.css'

const Intro = () => {
  return (
    <section className="intro-section" id="intro">
  <div className="intro-content">
    <h1>Premium Carbon Fiber Tubes </h1>
    <p>
      Fortune India Store offers a wide range of <strong>premium  carbon fiber tubes</strong>, perfect for applications. Known for their lightweight, high strength, and durability, these tubes are ideal for constructing frames, arms, and structural components.
    </p>
    <div className="tubes-sizes">
      <div className="tube-card">
        <img src="https://indianrobostore.com/_next/image?url=https%3A%2F%2Fimages.indianrobostore.com%2FProd%2FProducts%2FIRS2304855941%2F1734773918075-c.webp&w=1920&q=75" alt="48×38×1000 mm tube" />
        <h3>Precision builds — ultra-light yet strong</h3>
        <p>48×38×1000 mm (1 mm)</p>
      </div>
      <div className="tube-card">
        <img src="https://indianrobostore.com/_next/image?url=https%3A%2F%2Fimages.indianrobostore.com%2FProd%2FProducts%2FIRS2304681718%2F1729139520199-download.webp&w=1920&q=75" alt="40×36×1000 mm tube" />
        <h3>Heavy-duty projects — added strength, same low weight.<span></span></h3>
        <p>40×36×1000 mm (2 mm)</p>
      </div>
    </div>
    <p>
      We also provide various other sizes to meet diverse requirements. These <strong>corrosion-resistant tubes</strong> are designed to handle high‑stress conditions, ensuring reliable performance for both professional and DIY enthusiasts.
    </p>
    <a href="#featured-products" className="btn-primary">Explore Our Products</a>
  </div>
</section>

  )
}

export default Intro
