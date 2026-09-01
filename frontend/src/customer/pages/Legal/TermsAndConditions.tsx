import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="container mx-auto px-4 py-12 lg:px-8 mt-16 max-w-4xl text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Terms & Conditions</h1>
      <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p>Welcome to Near Look. By accessing our website and using our services, you agree to be bound by the following terms and conditions. Please read them carefully.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Use of the Site</h2>
          <p>You may use our site for lawful purposes only. You must not use our site in any way that causes, or may cause, damage to the site or impairment of the availability or accessibility of the site.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
          <p>When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account and password.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Intellectual Property</h2>
          <p>All content included on this site, such as text, graphics, logos, images, and software, is the property of Near Look or its content suppliers and protected by international copyright laws.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
          <p>Near Look will not be liable for any direct, indirect, incidental, punitive, or consequential damages arising from the use of or inability to use our site.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
