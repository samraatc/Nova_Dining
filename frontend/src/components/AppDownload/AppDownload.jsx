import React from "react";
import "./AppDownlaod.css";
import p1 from "../../assets/Tomahawk_Steak.jpg";
import p2 from "../../assets/TablesideServiceDish.jpg";
import p3 from "../../assets/Secret-Off-Menu-Item.jpg";

const AppDownload = () => {
  return (
    <div className="featured-products" id="featured-products">
      <h2 className="section-title">Our Special Items</h2>
      <div className="product-grid">
        <div className="product-card">
          <img src={p1} alt="BALSA SHEET" />
          <h3> Tomahawk Steak</h3>
          <p>
            {" "}
            A Tomahawk steak is a spectacular, ribeye steak with the rib bone
            left intact and frenched (cleaned), giving it the dramatic
            appearance of a tomahawk axe. Its "special" status comes from its
            impressive visual presentation, its size (often meant for 2-4 people
            to share), and its exceptional flavor from the bone-in cooking
            process. 
          </p>
          <span className="price">₹910</span>
        </div>
        <div className="product-card">
          <img src={p2} alt="Tableside Service Dish" />
          <h3>Tableside Service Dish</h3>
          <p>
            The specialness of this item lies in the theatre and personalization
            of the dining experience. A classic example is a Caesar salad
            prepared from scratch at your table. The server will meticulously
            assemble and emulsify the dressing, season the greens, and often
            even crack the quail's egg right in front of you. 
          </p>
          <span className="price">₹990</span>
        </div>
        <div className="product-card">
          <img src={p3} alt="Secret-Off-Menu-Item" />
          <h3>Secret-Off-Menu-Item</h3>
          <p>
            This is a dish not listed on the standard menu, known only to
            regular patrons, those "in the know," or those who ask if the chef
            is preparing anything special. Its exclusivity is what makes it
            special. It could be a test recipe for a potential new menu item, a
            creation using a rare, limited-ingredient the chef sourced that day,
            or a classic dish that was retired but is still made upon request.
          </p>
          <span className="price">₹4,550</span>
        </div>
        <div className="product-card">
          <img src={p3} alt="Secret-Off-Menu-Item" />
          <h3>Secret-Off-Menu-Item</h3>
          <p>
            This is a dish not listed on the standard menu, known only to
            regular patrons, those "in the know," or those who ask if the chef
            is preparing anything special. Its exclusivity is what makes it
            special. It could be a test recipe for a potential new menu item, a
            creation using a rare, limited-ingredient the chef sourced that day,
            or a classic dish that was retired but is still made upon request.
          </p>
          <span className="price">₹999</span>
        </div>
      </div>
    </div>
  );
};

export default AppDownload;
