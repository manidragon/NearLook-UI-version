import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 lg:px-8 mt-16 max-w-4xl text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p>We collect information to provide better services to all our users. The types of information we collect include personal information you provide to us (such as name, email address, phone number) and information collected automatically as you navigate through our site.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Information</h2>
          <p>We use the information we collect to operate, maintain, and provide the features and functionality of the service, to process your transactions, and to communicate directly with you, such as to send you email messages regarding your account or orders.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Sharing of Information</h2>
          <p>We do not share your personal information with third parties except as necessary to provide our services, such as payment processing and shipping, or when required by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
          <p>We use commercially reasonable physical, managerial, and technical safeguards to preserve the integrity and security of your personal information. However, no method of transmission over the Internet is 100% secure.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">5. Your Choices</h2>
          <p>You can review and update your personal information by logging into your account. You can also opt-out of receiving promotional communications from us by following the instructions in those emails.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
