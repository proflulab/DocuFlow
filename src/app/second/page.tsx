'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import SecondPageContent from '@/components/secondPageContent';

export default function Second() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navigation />
            <div className="container mx-auto px-4 py-8">
                <SecondPageContent />
            </div>
        </div>
    );
}