import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 lg:px-8 mt-16 max-w-4xl text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Cancellation & Refund Policy</h1>
      <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Cancellation Policy</h2>
          <p>Customers can cancel their orders within 24 hours of placing them, provided the order has not already been shipped. To cancel an order, please visit your account dashboard or contact our support team immediately.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Refund Eligibility</h2>
          <p>We offer refunds for products that are defective, damaged upon arrival, or significantly not as described. To be eligible for a refund, you must return the item in its original condition and packaging within 7 days of delivery.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Process for Returns and Refunds</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Initiate a return request through your account dashboard.</li>
            <li>Our team will review the request and provide return shipping instructions if approved.</li>
            <li>Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund.</li>
            <li>Approved refunds will be processed and applied to your original method of payment within 5-7 business days.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Non-Refundable Items</h2>
          <p>Certain items are exempt from being returned or refunded, such as perishable goods, custom-made products, and personal hygiene items, unless they are defective.</p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;
