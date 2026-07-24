import React from "react";
import { Tooltip } from "@mui/material";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LanguageIcon from '@mui/icons-material/Language';

export default function About({ seller }: any) {
  const business = seller?.businessDetails;

  return (
    <section className="section">
      <div className="about-grid">
        {/* LEFT */}
        <div className="about-card animate-in">
          <h3>
            <span className="info-icon">📖</span>
            Our Story
          </h3>

          <div className="about-text">
            <p>
              {seller?.storefront?.description || business?.description ||
                "Welcome to our store. We provide quality products and trusted service."}
            </p>
          </div>
          
          {seller?.storefront?.socialLinks && (
            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              {seller.storefront.socialLinks.facebook && (
                <Tooltip title="Facebook" arrow>
                  <a href={seller.storefront.socialLinks.facebook} target="_blank" rel="noreferrer" style={{ color: "#1877F2" }}>
                    <FacebookIcon fontSize="large" />
                  </a>
                </Tooltip>
              )}
              {seller.storefront.socialLinks.instagram && (
                <Tooltip title="Instagram" arrow>
                  <a href={seller.storefront.socialLinks.instagram} target="_blank" rel="noreferrer" style={{ color: "#E4405F" }}>
                    <InstagramIcon fontSize="large" />
                  </a>
                </Tooltip>
              )}
              {seller.storefront.socialLinks.twitter && (
                <Tooltip title="Twitter" arrow>
                  <a href={seller.storefront.socialLinks.twitter} target="_blank" rel="noreferrer" style={{ color: "#1DA1F2" }}>
                    <TwitterIcon fontSize="large" />
                  </a>
                </Tooltip>
              )}
              {seller.storefront.socialLinks.website && (
                <Tooltip title="Website" arrow>
                  <a href={seller.storefront.socialLinks.website} target="_blank" rel="noreferrer" style={{ color: "#333" }}>
                    <LanguageIcon fontSize="large" />
                  </a>
                </Tooltip>
              )}
            </div>
          )}

          <h3 style={{ marginTop: "24px" }}>
            <span className="info-icon">🚀</span>
            Company Milestones
          </h3>

          <div className="milestone-timeline">
            <div className="milestone">
              <span className="milestone-year">Joined</span>
              <p className="milestone-text">
                {seller?.createdAt ? new Date(seller.createdAt).toDateString() : "Recently"}
              </p>
            </div>

            <div className="milestone">
              <span className="milestone-year">Current</span>
              <p className="milestone-text">Trusted seller on platform</p>
            </div>
          </div>
        </div>

        {/* RIGHT STORE DETAILS */}
        <div className="about-card animate-in" style={{ height: "fit-content" }}>
          <h3>
            <span className="info-icon">📋</span>
            Store Details
          </h3>

          <ul className="info-list">
            {/* BUSINESS NAME */}
            <li>
              <div className="info-icon">🏢</div>
              <div>
                <div className="info-label">Business Name</div>
                <div className="info-value">
                  {business?.businessName || seller?.sellerName || "Not Available"}
                </div>
              </div>
            </li>

            {/* CATEGORY */}
            <li>
              <div className="info-icon">🛍</div>
              <div>
                <div className="info-label">Category</div>
                <div className="info-value">{seller?.businessType || business?.businessType || "General"}</div>
              </div>
            </li>

            {/* LOCATION FIXED */}
            <li>
              <div className="info-icon">📍</div>
              <div>
                <div className="info-label">Location</div>
                <div className="info-value">
                  {business?.city || seller?.district || seller?.address || "Not Available"}
                </div>
              </div>
            </li>

            {/* PHONE */}
            <li>
              <div className="info-icon">📞</div>
              <div>
                <div className="info-label">Phone</div>
                <div className="info-value">{seller?.mobile || "Not Available"}</div>
              </div>
            </li>

            {/* VERIFIED */}
            <li>
              <div className="info-icon">🛡</div>
              <div>
                <div className="info-label">Verified Since</div>
                <div className="info-value">
                  {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "Unknown"}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}