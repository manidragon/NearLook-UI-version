import React, { useState, type ChangeEvent, type KeyboardEvent, useEffect } from 'react';

interface OTPInputProps {
    length: number;
    onChange: (otp: string) => void;
    error?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ length, onChange, error = false }) => {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''));

    useEffect(() => {
        const otpString = otp.join('');
        if (otpString.length === length) {
            onChange(otpString);
        }
    }, [otp, length, onChange]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move to the next input field if there is a next one
            if (value && index < otp.length - 1) {
                const nextInput = document.getElementById(`otp-input-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
        if (pastedData) {
            const newOtp = [...otp];
            pastedData.split('').forEach((char, idx) => {
                newOtp[idx] = char;
            });
            setOtp(newOtp);
            const nextFocusIndex = Math.min(pastedData.length, length - 1);
            const nextInput = document.getElementById(`otp-input-${nextFocusIndex}`);
            if (nextInput) nextInput.focus();
        }
    };

    return (
        <div className='flex justify-between gap-1 sm:gap-2 w-full max-w-sm mx-auto'>
            {otp.map((item, index) => (
                <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    value={item}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    maxLength={1}
                    className={`mt-1 block p-0 border ${error ? 'border-red-500' : 'border-gray-200'
                        } rounded-xl shadow-sm focus:outline-none text-lg sm:text-xl font-bold aspect-square w-full max-w-[3.5rem] flex-1 flex justify-center items-center text-center focus:ring-1 focus:ring-primary bg-gray-50 text-gray-900 transition-colors`}
                />
            ))}
        </div>
    );
};

export default OTPInput;
