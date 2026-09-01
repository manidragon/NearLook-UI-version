import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 lg:px-8 mt-16 max-w-4xl text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Shipping Policy</h1>
      <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Processing Time</h2>
          <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Shipping Rates & Delivery Estimates</h2>
          <p>Shipping charges for your order will be calculated and displayed at checkout. Delivery delays can occasionally occur depending on the destination and courier availability.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Shipment Confirmation & Order Tracking</h2>
          <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Damages</h2>
          <p>Near Look is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.</p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
