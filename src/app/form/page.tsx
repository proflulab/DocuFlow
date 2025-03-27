'use client';

import Navigation from '@/components/Navigation';
import HomeContent from '@/components/homeContent';

export default function FormPage() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navigation />
            <div className="container mx-auto px-4 py-8">
                <HomeContent />
            </div>
        </div>
    );
}