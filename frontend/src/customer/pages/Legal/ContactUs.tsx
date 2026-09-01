import React from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const ContactUs = () => {
  return (
    <div className="container mx-auto px-4 py-12 lg:px-8 mt-16 max-w-4xl text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-orange-600 text-center">Contact Us</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          We'd love to hear from you. Whether you have a question about our services, pricing, need a demo, or anything else, our team is ready to answer all your questions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center">
          <div className="flex flex-col items-center p-6 bg-orange-50 rounded-xl">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 text-xl">
              <FaMapMarkerAlt />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Our Office</h3>
            <p className="text-sm text-gray-600">184/F-31/1 Solaimalai Ayyanar Kovil St, Pugal Coffee Opp, Theni, Tamil Nadu - 625531</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-orange-50 rounded-xl">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 text-xl">
              <FaPhoneAlt />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
            <p className="text-sm text-gray-600">(+91) 9876-543-210</p>
            <p className="text-sm text-gray-600 mt-1">Mon-Fri from 9am to 6pm.</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-orange-50 rounded-xl">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 text-xl">
              <FaEnvelope />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
            <p className="text-sm text-gray-600">info@nearlooks.com</p>
            <p className="text-sm text-gray-600 mt-1">career@nearlooks.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
